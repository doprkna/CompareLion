'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  Database, 
  Wifi, 
  Bug, 
  GitBranch, 
  Clock, 
  RefreshCw,
  ExternalLink,
  Server,
  AlertCircle,
  CheckCircle,
  XCircle,
  Minus
} from 'lucide-react';

interface HealthData {
  version: string;
  commit: string | null;
  buildTime: string;
  env: {
    node: string;
    runtime: 'edge' | 'node';
  };
  db: {
    ok: boolean;
    latencyMs?: number;
    error?: string;
  };
  redis: {
    present: boolean;
    ok: boolean | null;
    error?: string;
  };
  sentry: {
    enabled: boolean;
  };
  features: {
    enableSentry: boolean;
    enableRedis: boolean;
  };
  uptimeSec: number;
}

interface StatusIndicatorProps {
  status: 'ok' | 'warn' | 'error' | 'disabled';
  label: string;
}

function StatusIndicator({ status, label }: StatusIndicatorProps) {
  const config = {
    ok: {
      icon: CheckCircle,
      color: 'text-green-600',
      bg: 'bg-green-50',
      border: 'border-green-200',
    },
    warn: {
      icon: AlertCircle,
      color: 'text-yellow-600',
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
    },
    error: {
      icon: XCircle,
      color: 'text-red-600',
      bg: 'bg-red-50',
      border: 'border-red-200',
    },
    disabled: {
      icon: Minus,
      color: 'text-gray-400',
      bg: 'bg-gray-50',
      border: 'border-gray-200',
    },
  };

  const { icon: Icon, color, bg, border } = config[status];

  return (
    <div className={`flex items-center gap-2 px-3 py-1 rounded-md border ${bg} ${border}`}>
      <Icon className={`w-4 h-4 ${color}`} />
      <span className={`text-sm font-medium ${color}`}>{label}</span>
    </div>
  );
}

function formatUptime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
}

function formatTimestamp(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function HealthPage() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const fetchTimeoutRef = useRef<NodeJS.Timeout>();

  const fetchHealth = useCallback(async () => {
    try {
      const response = await fetch('/api/health', {
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      setHealth(data);
      setError(null);
      setLastUpdate(new Date());
    } catch (err: any) {
      setError(err.message || 'Failed to fetch health data');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch + auto-refresh every 15s with debouncing
  useEffect(() => {
    fetchHealth();

    const interval = setInterval(() => {
      // Debounce: clear any pending timeout
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }

      // Schedule fetch after 100ms to debounce rapid triggers
      fetchTimeoutRef.current = setTimeout(fetchHealth, 100);
    }, 15000); // 15 seconds

    return () => {
      clearInterval(interval);
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, [fetchHealth]);

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center gap-2 mb-6">
          <Activity className="w-6 h-6" />
          <h1 className="text-2xl font-bold">System Health</h1>
        </div>
        <Card>
          <CardContent className="p-8 text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-gray-400" />
            <p className="text-gray-500">Loading health status...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !health) {
    return (
      <div className="p-8">
        <div className="flex items-center gap-2 mb-6">
          <Activity className="w-6 h-6" />
          <h1 className="text-2xl font-bold">System Health</h1>
        </div>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-8">
            <AlertCircle className="w-12 h-12 text-red-600 mb-4" />
            <h3 className="text-lg font-semibold text-red-900 mb-2">Health Check Failed</h3>
            <p className="text-red-700">{error || 'Unable to load health data'}</p>
            <Button onClick={fetchHealth} className="mt-4">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const dbStatus = health.db.ok ? 'ok' : 'error';
  const redisStatus = !health.redis.present 
    ? 'disabled' 
    : health.redis.ok 
    ? 'ok' 
    : 'error';
  const sentryStatus = health.sentry.enabled ? 'ok' : 'disabled';

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-6 h-6" />
          <h1 className="text-2xl font-bold">System Health</h1>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdate && (
            <span className="text-sm text-gray-500">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </span>
          )}
          <Button
            onClick={fetchHealth}
            variant="outline"
            size="sm"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button
            onClick={() => window.open('/api/health', '_blank')}
            variant="outline"
            size="sm"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Raw JSON
          </Button>
        </div>
      </div>

      {/* Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* App Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Server className="w-5 h-5" />
              Application
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <StatusIndicator status="ok" label="Running" />
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Version:</span>
                <span className="font-mono font-medium">{health.version}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Uptime:</span>
                <span className="font-mono font-medium">{formatUptime(health.uptimeSec)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Runtime:</span>
                <Badge variant="secondary">{health.env.runtime}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Database */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Database className="w-5 h-5" />
              Database
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <StatusIndicator 
              status={dbStatus} 
              label={health.db.ok ? 'Connected' : 'Error'} 
            />
            {health.db.ok && health.db.latencyMs !== undefined && (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Latency:</span>
                  <span className="font-mono font-medium">{health.db.latencyMs}ms</span>
                </div>
              </div>
            )}
            {health.db.error && (
              <div className="text-xs text-red-600 bg-red-50 p-2 rounded border border-red-200">
                {health.db.error}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Redis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Wifi className="w-5 h-5" />
              Redis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <StatusIndicator 
              status={redisStatus} 
              label={
                !health.redis.present 
                  ? 'Not Configured' 
                  : health.redis.ok 
                  ? 'Connected' 
                  : 'Error'
              } 
            />
            {health.redis.error && (
              <div className="text-xs text-red-600 bg-red-50 p-2 rounded border border-red-200">
                {health.redis.error}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sentry */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Bug className="w-5 h-5" />
              Sentry
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <StatusIndicator 
              status={sentryStatus} 
              label={health.sentry.enabled ? 'Enabled' : 'Disabled'} 
            />
            <div className="text-sm">
              <span className="text-gray-500">Error tracking</span>
            </div>
          </CardContent>
        </Card>

        {/* Build Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <GitBranch className="w-5 h-5" />
              Build
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2 text-sm">
              {health.commit && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Commit:</span>
                  <code className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                    {health.commit.substring(0, 7)}
                  </code>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">Built:</span>
                <span className="text-xs">{formatTimestamp(health.buildTime)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Environment */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="w-5 h-5" />
              Environment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Node:</span>
                <span className="font-mono text-xs">{health.env.node}</span>
              </div>
              <div className="space-y-1 pt-2 border-t">
                <div className="text-xs text-gray-500 font-medium">Features</div>
                <div className="flex flex-wrap gap-1">
                  {health.features.enableRedis && (
                    <Badge variant="secondary" className="text-xs">Redis</Badge>
                  )}
                  {health.features.enableSentry && (
                    <Badge variant="secondary" className="text-xs">Sentry</Badge>
                  )}
                  {!health.features.enableRedis && !health.features.enableSentry && (
                    <span className="text-xs text-gray-400">None active</span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Auto-refresh notice */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <RefreshCw className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-900">Auto-refresh enabled</p>
              <p className="text-blue-700 mt-1">
                This page automatically refreshes every 15 seconds to provide real-time system status.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}



