'use client';

/**
 * Moderation Dashboard
 * v0.20.1 - Admin-only content moderation interface
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FlaggedList } from '@/components/admin/FlaggedList';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ModerationLog {
  id: string;
  action: string;
  targetType: string;
  moderator: string;
  createdAt: string;
}

export default function ModerationDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [logs, setLogs] = useState<ModerationLog[]>([]);
  const [showLogs, setShowLogs] = useState(false);

  useEffect(() => {
    checkAccess();
  }, []);

  const checkAccess = async () => {
    try {
      // Try to fetch flagged content - if 403, not authorized
      const response = await fetch('/api/moderation/flagged');
      
      if (response.status === 403) {
        setAuthorized(false);
        setLoading(false);
        return;
      }

      if (response.ok) {
        setAuthorized(true);
      }
    } catch (err) {
      console.error('Access check failed:', err);
      setAuthorized(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    try {
      const response = await fetch('/api/moderation/logs?limit=20');
      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs || []);
        setShowLogs(true);
      }
    } catch (err) {
      console.error('Failed to fetch logs:', err);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="container max-w-6xl mx-auto py-8 px-4">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Checking access...</p>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="container max-w-6xl mx-auto py-8 px-4">
        <Card className="border-red-200 dark:border-red-800">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🚫</div>
              <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
              <p className="text-muted-foreground mb-4">
                You don't have permission to access this page.
              </p>
              <p className="text-sm text-muted-foreground">
                Admin access is required for the moderation dashboard.
              </p>
              <Button
                onClick={() => router.push('/dashboard')}
                className="mt-4"
              >
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <h1 className="text-3xl font-bold">Moderation Dashboard</h1>
          <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-semibold rounded-full">
            🛡️ ADMIN ONLY
          </span>
        </div>
        <p className="text-muted-foreground">
          Monitor and manage flagged content to keep the community healthy
        </p>
      </div>

      {/* Flagged Content */}
      <div className="mb-6">
        <FlaggedList />
      </div>

      {/* Moderation Logs */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle>Moderation Logs</CardTitle>
            <CardDescription>Recent admin actions</CardDescription>
          </div>
          <Button
            onClick={showLogs ? () => setShowLogs(false) : fetchLogs}
            variant="outline"
            size="sm"
          >
            {showLogs ? 'Hide Logs' : 'Show Logs'}
          </Button>
        </CardHeader>
        {showLogs && (
          <CardContent>
            {logs.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No logs yet
              </p>
            ) : (
              <div className="space-y-2">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg text-sm"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-semibold">{log.action}</span>
                      <span className="text-muted-foreground">
                        on {log.targetType}
                      </span>
                      <span className="text-muted-foreground">
                        by {log.moderator}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(log.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
}

