"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { 
  Settings, 
  Home, 
  Loader2,
  Info
} from 'lucide-react';
import { RoastMeterSlider } from '@/components/roast/RoastMeterSlider';
import { RoastPreview } from '@/components/roast/RoastPreview';
import { useRoastLevel, useSetRoastLevel } from '@parel/core/hooks/useRoastLevel';

export default function ProfileSettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [skipLanding, setSkipLanding] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [canBeAdded, setCanBeAdded] = useState<'anyone'|'friendsOnly'|'noOne'>('anyone');
  const { roastLevel, loading: roastLoading, reload: reloadRoast } = useRoastLevel();
  const { setLevel: setRoastLevel, loading: settingRoast } = useSetRoastLevel();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated') {
      // Load preference from localStorage
      const storedValue = localStorage.getItem('skipLandingAfterLogin');
      setSkipLanding(storedValue === 'true');
      setLoading(false);
    }
  }, [status, router]);

  const handleToggle = (checked: boolean) => {
    setSkipLanding(checked);
    localStorage.setItem('skipLandingAfterLogin', checked.toString());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleRoastLevelChange = async (level: number) => {
    try {
      await setRoastLevel(level);
      reloadRoast();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      console.error('Failed to update roast level', e);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Settings className="h-8 w-8 text-accent" />
          <h1 className="text-4xl font-bold text-text">Settings</h1>
        </div>
        <p className="text-subtle">Customize your PareL experience</p>
      </div>

      {/* Preferences Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            Navigation Preferences
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Skip Landing Toggle */}
            <div className="flex items-start justify-between gap-4 p-4 bg-bg border border-border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <label htmlFor="skip-landing" className="text-text font-semibold cursor-pointer">
                    Skip landing page on login
                  </label>
                  {saved && (
                    <span className="text-xs text-green-500 font-medium">Saved!</span>
                  )}
                </div>
                <p className="text-sm text-subtle mb-3">
                  When enabled, you'll go straight to your dashboard after logging in. 
                  When disabled, you'll see the landing page first.
                </p>
                <div className="flex items-start gap-2 p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg">
                  <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-subtle">
                    This setting is stored locally on your device and won't sync across browsers.
                  </p>
                </div>
              </div>
              <Switch
                id="skip-landing"
                checked={skipLanding}
                onCheckedChange={handleToggle}
              />
            </div>

            {/* Preview */}
            <div className="p-4 bg-accent/5 border border-accent/20 rounded-lg">
              <h4 className="text-sm font-semibold text-text mb-2">Current behavior:</h4>
              <p className="text-sm text-subtle">
                {skipLanding ? (
                  <>
                    ✨ You will be redirected to <strong className="text-accent">Dashboard</strong> after login
                  </>
                ) : (
                  <>
                    🏠 You will see the <strong className="text-accent">Landing Page</strong> after login
                  </>
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Roast/Toast Meter */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>🔥</span>
            <span>Roast/Toast Level</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!roastLoading && (
            <>
              <RoastMeterSlider
                value={roastLevel}
                onChange={handleRoastLevelChange}
                disabled={settingRoast}
              />
              <RoastPreview level={roastLevel} />
            </>
          )}
          {roastLoading && (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-5 w-5 animate-spin text-accent" />
            </div>
          )}
          <div className="text-xs text-gray-500 mt-2">
            💡 This setting affects the tone of feedback and reflections you receive.
          </div>
        </CardContent>
      </Card>

      {/* Affinity Requests */}
      <div className="rounded border p-4">
        <h3 className="font-semibold mb-2">Affinity Requests</h3>
        <label className="text-sm text-gray-600 mb-1 block">Who can send you affinity requests?</label>
        <select
          className="border rounded p-2 text-sm"
          value={canBeAdded}
          onChange={async (e) => {
            const v = e.target.value as 'anyone'|'friendsOnly'|'noOne';
            setCanBeAdded(v);
            try {
              await fetch('/api/profile/can-be-added', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ value: v }) });
            } catch {}
          }}
        >
          <option value="anyone">Anyone</option>
          <option value="friendsOnly">Friends only</option>
          <option value="noOne">No one</option>
        </select>
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={() => router.push('/profile')}
        >
          Back to Profile
        </Button>
        <Button
          onClick={() => router.push('/landing')}
          variant="ghost"
        >
          Test Landing Page
          <Home className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

