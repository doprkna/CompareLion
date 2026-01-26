/**
 * Power User Moderation Page
 * Lightweight moderation interface for flagged challenge entries
 * v0.38.12 - Power User Moderation View
 */

'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, CheckCircle, EyeOff, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { apiFetch } from '@/lib/apiBase';

interface FlaggedEntry {
  id: string;
  userId: string;
  imageUrl: string;
  category: string;
  createdAt: string;
  flagCount: number;
  flags: Array<{
    reason: string;
    userId: string;
    createdAt: string;
  }>;
  integrityAnalysis: {
    watermarkDetected: boolean;
    aiLikelihood: number;
    screenshotLikelihood: number;
  } | null;
  user?: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

export default function ModerationPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [entries, setEntries] = useState<FlaggedEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actingOnId, setActingOnId] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    
    if (status === 'authenticated') {
      loadFlaggedEntries();
    }
  }, [status, router]);

  const loadFlaggedEntries = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiFetch('/api/moderation/flagged');
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 403) {
          router.push('/');
          return;
        }
        throw new Error(data.error || 'Failed to load flagged entries');
      }

      setEntries(data.entries || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load flagged entries');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (entryId: string, action: 'approve' | 'hide') => {
    setActingOnId(entryId);

    try {
      const response = await apiFetch('/api/moderation/action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ entryId, action }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to moderate entry');
      }

      // Reload entries
      await loadFlaggedEntries();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to moderate entry');
    } finally {
      setActingOnId(null);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Moderation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">Loading flagged entries...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error && entries.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Moderation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-red-600">{error}</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Moderation - Flagged Entries
          </CardTitle>
          <p className="text-sm text-gray-500 mt-2">
            Hidden entries are removed from leaderboard but not deleted.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {entries.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No flagged entries found.
            </div>
          ) : (
            <div className="space-y-4">
              {entries.map((entry) => {
                const isActing = actingOnId === entry.id;
                const hasIntegrityWarnings = entry.integrityAnalysis && (
                  entry.integrityAnalysis.watermarkDetected ||
                  entry.integrityAnalysis.aiLikelihood > 50 ||
                  entry.integrityAnalysis.screenshotLikelihood > 50
                );

                return (
                  <div
                    key={entry.id}
                    className="border border-gray-200 rounded-lg p-4 bg-white"
                  >
                    <div className="flex gap-4">
                      {/* Image Preview */}
                      <div className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden bg-gray-100">
                        <img
                          src={entry.imageUrl}
                          alt={`Entry by ${entry.user?.name || 'user'}`}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Entry Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          {entry.user?.image && (
                            <img
                              src={entry.user.image}
                              alt={entry.user.name || 'User'}
                              className="w-6 h-6 rounded-full"
                            />
                          )}
                          <span className="font-medium text-sm">
                            {entry.user?.name || 'Anonymous'}
                          </span>
                          <span className="text-xs text-gray-500">•</span>
                          <span className="text-xs text-gray-500 capitalize">{entry.category}</span>
                        </div>

                        {/* Flags */}
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className="w-4 h-4 text-orange-500" />
                          <span className="text-sm font-medium text-orange-700">
                            {entry.flagCount} {entry.flagCount === 1 ? 'flag' : 'flags'}
                          </span>
                          <span className="text-xs text-gray-500">
                            ({entry.flags.map(f => f.reason).join(', ')})
                          </span>
                        </div>

                        {/* Integrity Warnings */}
                        {hasIntegrityWarnings && entry.integrityAnalysis && (
                          <div className="text-xs text-red-600 mb-2">
                            {entry.integrityAnalysis.watermarkDetected && '⚠️ Watermark detected • '}
                            {entry.integrityAnalysis.aiLikelihood > 50 && 
                              `AI: ${Math.round(entry.integrityAnalysis.aiLikelihood)}% • `}
                            {entry.integrityAnalysis.screenshotLikelihood > 50 && 
                              `Screenshot: ${Math.round(entry.integrityAnalysis.screenshotLikelihood)}%`}
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2 mt-3">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-700 border-green-300 hover:bg-green-50"
                            onClick={() => handleAction(entry.id, 'approve')}
                            disabled={isActing}
                          >
                            {isActing ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Approve
                              </>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-700 border-red-300 hover:bg-red-50"
                            onClick={() => handleAction(entry.id, 'hide')}
                            disabled={isActing}
                          >
                            {isActing ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <EyeOff className="w-4 h-4 mr-1" />
                                Hide
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

