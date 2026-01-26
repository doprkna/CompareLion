/**
 * Photo Challenge Leaderboard Component
 * Display weekly leaderboard rankings
 * v0.37.14 - Snack Leaderboard
 */

'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Trophy, Medal, Award, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiFetch } from '@/lib/apiBase';

interface LeaderboardEntry {
  id: string;
  userId: string;
  imageUrl: string;
  category: string;
  createdAt: string;
  totalScore: number;
  appealScore: number;
  creativityScore: number;
  finalScore: number;
  humanScore: number;
  aiScore: number;
  hasAiRating: boolean;
  rank: number;
  user?: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

interface PhotoLeaderboardProps {
  category?: string;
  className?: string;
}

export function PhotoLeaderboard({ category, className = '' }: PhotoLeaderboardProps) {
  const { data: session } = useSession();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<{ rank: number; total: number } | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get current user ID
  useEffect(() => {
    if (session?.user?.email) {
      fetch('/api/me')
        .then((r) => r.json())
        .then((data) => {
          if (data.user?.id) {
            setCurrentUserId(data.user.id);
          }
        })
        .catch(() => {});
    }
  }, [session]);

  useEffect(() => {
    loadLeaderboard();
  }, [category]);

  const loadLeaderboard = async () => {
    setLoading(true);
    setError(null);

    try {
      const url = category
        ? `/api/challenge/photo/leaderboard?category=${encodeURIComponent(category)}`
        : '/api/challenge/photo/leaderboard';

      const response = await apiFetch(url);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to load leaderboard');
      }

      setEntries(data.topEntries || []);
      setUserRank(data.userRank || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Award className="w-5 h-5 text-amber-600" />;
    return <span className="text-sm font-medium text-gray-500">#{rank}</span>;
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Weekly Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Loading leaderboard...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Weekly Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-red-600">{error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Weekly Leaderboard</CardTitle>
        {category && (
          <p className="text-sm text-gray-500 capitalize">Category: {category}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* User Rank */}
        {userRank && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="text-sm font-medium text-blue-900">Your Rank</div>
            <div className="text-lg font-bold text-blue-700">
              #{userRank.rank} with {userRank.total} {userRank.total === 1 ? 'vote' : 'votes'}
            </div>
          </div>
        )}

        {/* Leaderboard Entries */}
        {entries.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No entries this week yet. Be the first to submit!
          </div>
        ) : (
          <div className="space-y-2">
            {entries.map((entry) => {
              const isUserEntry = currentUserId && entry.userId === currentUserId;
              
              return (
                <div
                  key={entry.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border ${
                    isUserEntry
                      ? 'bg-blue-50 border-blue-200'
                      : 'bg-white border-gray-200'
                  }`}
                >
                  {/* Rank */}
                  <div className="flex-shrink-0 w-8 flex items-center justify-center">
                    {getRankIcon(entry.rank)}
                  </div>

                  {/* Image */}
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={entry.imageUrl}
                      alt={`Entry by ${entry.user?.name || 'user'}`}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {entry.user?.image && (
                        <img
                          src={entry.user.image}
                          alt={entry.user.name || 'User'}
                          className="w-5 h-5 rounded-full"
                        />
                      )}
                      <span className={`text-sm font-medium truncate ${isUserEntry ? 'text-blue-900' : ''}`}>
                        {entry.user?.name || 'Anonymous'}
                        {isUserEntry && ' (You)'}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {entry.appealScore} appeal + {entry.creativityScore} creativity
                    </div>
                    {entry.hasAiRating && (
                      <div className="text-xs text-purple-600 flex items-center gap-1 mt-0.5">
                        <Sparkles className="w-3 h-3" />
                        AI: {Math.round(entry.aiScore)}
                      </div>
                    )}
                  </div>

                  {/* Score */}
                  <div className="flex-shrink-0 text-right">
                    <div className={`text-lg font-bold ${isUserEntry ? 'text-blue-700' : 'text-gray-900'}`}>
                      {Math.round(entry.finalScore)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {entry.hasAiRating ? (
                        <span className="flex items-center gap-1 justify-end">
                          <span>Human: {entry.humanScore}</span>
                          <span className="text-purple-600">AI: {Math.round(entry.aiScore)}</span>
                        </span>
                      ) : (
                        `${entry.totalScore} votes`
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

