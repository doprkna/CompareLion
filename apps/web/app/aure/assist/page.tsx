/**
 * AURE Assist Engine Page
 * Screenshot Scraper and AI Coach
 * v0.39.3 - AURE Assist Engine
 */

'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Image, Sparkles } from 'lucide-react';
import { apiFetch } from '@/lib/apiBase';

export default function AureAssistPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Screenshot state
  const [screenshotUrl, setScreenshotUrl] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [screenshotResult, setScreenshotResult] = useState<{
    description: string;
    contextGuess: string;
    suggestedActions: string[];
  } | null>(null);

  // Coach state
  const [coachType, setCoachType] = useState<'snack' | 'desk' | 'outfit' | 'room' | 'generic'>('snack');
  const [coaching, setCoaching] = useState(false);
  const [coachResult, setCoachResult] = useState<{
    tips: string[];
    summary: string;
    focusAreas: string[];
  } | null>(null);
  const [coachError, setCoachError] = useState<string | null>(null);

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  async function handleAnalyzeScreenshot() {
    if (!screenshotUrl) {
      alert('Please enter an image URL');
      return;
    }

    setAnalyzing(true);
    setScreenshotResult(null);
    try {
      const res = await apiFetch('/api/aure/assist/screenshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: screenshotUrl }),
      });
      if ((res as any).ok && (res as any).data) {
        setScreenshotResult((res as any).data);
      } else {
        alert((res as any).error || 'Failed to analyze screenshot');
      }
    } catch (error) {
      console.error('Failed to analyze screenshot', error);
      alert('Failed to analyze screenshot');
    } finally {
      setAnalyzing(false);
    }
  }

  async function handleAskCoach() {
    setCoaching(true);
    setCoachResult(null);
    setCoachError(null);
    try {
      const res = await apiFetch(`/api/aure/assist/coach?type=${coachType}`);
      if ((res as any).ok && (res as any).data) {
        setCoachResult((res as any).data);
      } else {
        const error = (res as any).error || 'Failed to get coach advice';
        if (error.includes('premium') || error.includes('Premium')) {
          setCoachError('premium');
        } else {
          setCoachError(error);
        }
      }
    } catch (error) {
      console.error('Failed to get coach advice', error);
      setCoachError('Failed to get coach advice');
    } finally {
      setCoaching(false);
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">AURE Assist Engine</h1>

      <div className="space-y-6">
        {/* Screenshot Helper */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="w-5 h-5" />
              Screenshot Helper
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Image URL:</label>
                <Input
                  value={screenshotUrl}
                  onChange={(e) => setScreenshotUrl(e.target.value)}
                  placeholder="https://example.com/screenshot.png"
                />
              </div>
              <Button onClick={handleAnalyzeScreenshot} disabled={analyzing}>
                {analyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  'Analyze Screenshot'
                )}
              </Button>
              {screenshotResult && (
                <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                  <div>
                    <h3 className="font-medium mb-1">Description:</h3>
                    <p className="text-sm text-gray-700">{screenshotResult.description}</p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Context:</h3>
                    <p className="text-sm text-gray-700">{screenshotResult.contextGuess}</p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Suggested Actions:</h3>
                    <ul className="list-disc list-inside text-sm text-gray-700">
                      {screenshotResult.suggestedActions.map((action, idx) => (
                        <li key={idx}>{action}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* AI Coach */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              AI Coach
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Coach Type:</label>
                <select
                  value={coachType}
                  onChange={(e) => setCoachType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
                >
                  <option value="snack">Snack</option>
                  <option value="desk">Desk</option>
                  <option value="outfit">Outfit</option>
                  <option value="room">Room</option>
                  <option value="generic">Generic</option>
                </select>
              </div>
              <Button onClick={handleAskCoach} disabled={coaching}>
                {coaching ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Getting Advice...
                  </>
                ) : (
                  'Ask Coach'
                )}
              </Button>
              {coachError === 'premium' && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    Coach is a premium feature. Upgrade to access personalized coaching.
                  </p>
                </div>
              )}
              {coachError && coachError !== 'premium' && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">{coachError}</p>
                </div>
              )}
              {coachResult && (
                <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                  <div>
                    <h3 className="font-medium mb-1">Summary:</h3>
                    <p className="text-sm text-gray-700">{coachResult.summary}</p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Tips:</h3>
                    <ul className="list-disc list-inside text-sm text-gray-700">
                      {coachResult.tips.map((tip, idx) => (
                        <li key={idx}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                  {coachResult.focusAreas.length > 0 && (
                    <div>
                      <h3 className="font-medium mb-1">Focus Areas:</h3>
                      <p className="text-sm text-gray-700">{coachResult.focusAreas.join(', ')}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

