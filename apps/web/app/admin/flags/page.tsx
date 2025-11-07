'use client';

/**
 * Admin Feature Flags Panel
 * Centralized view and control of all feature flags
 * v0.34.9 - Feature Flags File
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Flag, RefreshCw, Info } from 'lucide-react';
import { getFlags, type FeatureFlags } from '@/lib/config/flags';
import { toast } from 'sonner';

export default function AdminFlagsPage() {
  const [flags, setFlags] = useState<FeatureFlags>(getFlags());
  const [localOverrides, setLocalOverrides] = useState<Partial<FeatureFlags>>({});
  const [isDev, setIsDev] = useState(false);

  useEffect(() => {
    // Check if we are in development
    setIsDev(flags.environment === 'development');

    // Load local overrides from localStorage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('featureFlagOverrides');
      if (stored) {
        try {
          const overrides = JSON.parse(stored);
          setLocalOverrides(overrides);
          // Apply overrides to current flags
          setFlags({ ...flags, ...overrides });
        } catch (e) {
          console.error('[FLAGS] Failed to parse overrides:', e);
        }
      }
    }
  }, []);

  const handleToggle = (flagKey: keyof FeatureFlags, value: boolean) => {
    if (!isDev) {
      toast.error('Feature flags can only be edited in development mode');
      return;
    }

    // Update local state
    const newOverrides = { ...localOverrides, [flagKey]: value };
    setLocalOverrides(newOverrides);
    setFlags({ ...flags, [flagKey]: value });

    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('featureFlagOverrides', JSON.stringify(newOverrides));
    }

    toast.success(`Flag "${flagKey}" ${value ? 'enabled' : 'disabled'}`);
  };

  const handleReset = () => {
    if (!isDev) {
      toast.error('Feature flags can only be reset in development mode');
      return;
    }

    // Clear localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('featureFlagOverrides');
    }

    // Reset to defaults
    setLocalOverrides({});
    setFlags(getFlags());
    toast.success('Feature flags reset to defaults');
  };

  const flagDescriptions: Record<keyof FeatureFlags, string> = {
    enableBase: 'Core base/camp system functionality',
    enableTrials: 'Mount trials and micro-challenges',
    enableThemes: 'User profile themes and customization',
    enableEconomyV2: 'Next-generation economy system (experimental)',
    enableAnalytics: 'Analytics and metrics tracking',
    environment: 'Current runtime environment',
  };

  const flagCategories: Record<string, (keyof FeatureFlags)[]> = {
    'Core Features': ['enableBase', 'enableTrials', 'enableThemes'],
    'Experimental': ['enableEconomyV2'],
    'Monitoring': ['enableAnalytics'],
    'Environment': ['environment'],
  };

  const renderFlagValue = (key: keyof FeatureFlags, value: any) => {
    if (typeof value === 'boolean') {
      return (
        <Switch
          checked={value}
          onCheckedChange={(checked) => handleToggle(key, checked)}
          disabled={!isDev || key === 'environment'}
        />
      );
    }

    // For non-boolean values (like environment), just display
    return (
      <Badge variant="outline" className="font-mono">
        {String(value)}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text flex items-center gap-2">
            <Flag className="h-8 w-8" />
            Feature Flags
          </h1>
          <p className="text-subtle mt-1">
            Centralized feature toggle system â€¢ {isDev ? 'Development Mode' : 'Production Mode'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleReset} variant="outline" disabled={!isDev}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset to Defaults
          </Button>
        </div>
      </div>

      {/* Environment Warning */}
      {!isDev && (
        <Card className="border-yellow-500/50 bg-yellow-500/10">
          <CardContent className="p-4 flex items-center gap-3">
            <Info className="h-5 w-5 text-yellow-500" />
            <p className="text-sm">
              Feature flags are <strong>read-only in production</strong>. Switch to development mode to edit flags.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Flags by Category */}
      {Object.entries(flagCategories).map(([category, flagKeys]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle>{category}</CardTitle>
            <CardDescription>
              {category === 'Core Features' && 'Stable features available in production'}
              {category === 'Experimental' && 'Features under development and testing'}
              {category === 'Monitoring' && 'Analytics and telemetry settings'}
              {category === 'Environment' && 'Runtime environment configuration'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {flagKeys.map((flagKey) => {
                const value = flags[flagKey];
                const hasOverride = flagKey in localOverrides;

                return (
                  <div
                    key={flagKey}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-mono font-medium">{flagKey}</p>
                        {hasOverride && (
                          <Badge variant="secondary" className="text-xs">
                            Override
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-subtle mt-1">
                        {flagDescriptions[flagKey]}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {renderFlagValue(flagKey, value)}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Usage Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Usage</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>
            Feature flags are stored in <code className="px-1 py-0.5 bg-muted rounded">localStorage</code> when overridden in development.
          </p>
          <p>
            To use flags in your code:
          </p>
          <pre className="bg-muted p-3 rounded-lg overflow-x-auto">
{`import { getFlags } from '@/lib/config/flags';

const flags = getFlags();
if (flags.enableThemes) {
  // Themes feature is enabled
}`}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
