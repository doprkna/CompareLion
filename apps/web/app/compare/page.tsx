/**
 * Compare Page
 * Compare two users' stats, missions, and economy
 * v0.36.42 - Social Systems 1.0
 */

'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { apiFetch } from '@/lib/apiBase';
import { CompareData } from '@/lib/social/types';

export default function ComparePage() {
  const searchParams = useSearchParams();
  const [userAId, setUserAId] = useState(searchParams.get('userA') || '');
  const [userBId, setUserBId] = useState(searchParams.get('userB') || '');
  const [compareData, setCompareData] = useState<CompareData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userAId && userBId) {
      loadCompare();
    }
  }, []);

  async function loadCompare() {
    if (!userAId || !userBId) {
      setError('Please provide both user IDs');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.set('userA', userAId);
      params.set('userB', userBId);

      const res = await apiFetch(`/api/social/compare?${params.toString()}`);
      if ((res as any).ok && (res as any).data) {
        setCompareData((res as any).data.compare);
      } else {
        setError((res as any).error || 'Failed to load compare data');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to compare users');
    } finally {
      setLoading(false);
    }
  }

  function formatNumber(num: number): string {
    return num.toLocaleString();
  }

  function getComparisonIcon(a: number, b: number) {
    if (a > b) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (a < b) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-gray-500" />;
  }

  if (loading && !compareData) {
    return (
      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      <h1 className="text-3xl font-bold mb-6">Compare Users</h1>

      {/* Input Form */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">User A ID</label>
              <Input
                value={userAId}
                onChange={(e) => setUserAId(e.target.value)}
                placeholder="Enter user ID"
              />
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">User B ID</label>
              <Input
                value={userBId}
                onChange={(e) => setUserBId(e.target.value)}
                placeholder="Enter user ID"
              />
            </div>
            <Button onClick={loadCompare} disabled={loading || !userAId || !userBId}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Comparing...
                </>
              ) : (
                'Compare'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card className="mb-6 border-red-500">
          <CardContent className="p-4 text-red-500">{error}</CardContent>
        </Card>
      )}

      {compareData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* User A */}
          <Card>
            <CardHeader>
              <CardTitle>{compareData.userA.name || compareData.userA.username || 'User A'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Core Stats */}
              <div>
                <h3 className="font-semibold mb-2">Core Stats</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Level:</span>
                    <span className="font-medium">{compareData.userA.level}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>XP:</span>
                    <span className="font-medium">{formatNumber(compareData.userA.xp)}</span>
                  </div>
                </div>
              </div>

              {/* Mount Stats */}
              {compareData.userA.mountStats && (
                <div>
                  <h3 className="font-semibold mb-2">Mount</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Level:</span>
                      <span className="font-medium">{compareData.userA.mountStats.level}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Power:</span>
                      <span className="font-medium">{formatNumber(compareData.userA.mountStats.power)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Speed:</span>
                      <span className="font-medium">{formatNumber(compareData.userA.mountStats.speed)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Economy */}
              <div>
                <h3 className="font-semibold mb-2">Economy</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Gold:</span>
                    <span className="font-medium">{formatNumber(compareData.userA.economyStats.gold)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Diamonds:</span>
                    <span className="font-medium">{formatNumber(compareData.userA.economyStats.diamonds)}</span>
                  </div>
                </div>
              </div>

              {/* Recent Missions */}
              {compareData.userA.recentMissions.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Recent Missions</h3>
                  <div className="space-y-1 text-sm">
                    {compareData.userA.recentMissions.map((mission) => (
                      <div key={mission.id} className="text-gray-400">
                        {mission.title}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* User B */}
          <Card>
            <CardHeader>
              <CardTitle>{compareData.userB.name || compareData.userB.username || 'User B'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Core Stats */}
              <div>
                <h3 className="font-semibold mb-2">Core Stats</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span>Level:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{compareData.userB.level}</span>
                      {getComparisonIcon(compareData.userA.level, compareData.userB.level)}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>XP:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{formatNumber(compareData.userB.xp)}</span>
                      {getComparisonIcon(compareData.userA.xp, compareData.userB.xp)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Mount Stats */}
              {compareData.userB.mountStats && (
                <div>
                  <h3 className="font-semibold mb-2">Mount</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span>Level:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{compareData.userB.mountStats.level}</span>
                        {compareData.userA.mountStats && getComparisonIcon(
                          compareData.userA.mountStats.level,
                          compareData.userB.mountStats.level
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Power:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{formatNumber(compareData.userB.mountStats.power)}</span>
                        {compareData.userA.mountStats && getComparisonIcon(
                          compareData.userA.mountStats.power,
                          compareData.userB.mountStats.power
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Speed:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{formatNumber(compareData.userB.mountStats.speed)}</span>
                        {compareData.userA.mountStats && getComparisonIcon(
                          compareData.userA.mountStats.speed,
                          compareData.userB.mountStats.speed
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Economy */}
              <div>
                <h3 className="font-semibold mb-2">Economy</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span>Gold:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{formatNumber(compareData.userB.economyStats.gold)}</span>
                      {getComparisonIcon(compareData.userA.economyStats.gold, compareData.userB.economyStats.gold)}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Diamonds:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{formatNumber(compareData.userB.economyStats.diamonds)}</span>
                      {getComparisonIcon(compareData.userA.economyStats.diamonds, compareData.userB.economyStats.diamonds)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Missions */}
              {compareData.userB.recentMissions.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Recent Missions</h3>
                  <div className="space-y-1 text-sm">
                    {compareData.userB.recentMissions.map((mission) => (
                      <div key={mission.id} className="text-gray-400">
                        {mission.title}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

