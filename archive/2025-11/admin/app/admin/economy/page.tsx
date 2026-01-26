'use client';

/**
 * Admin Economy Dashboard
 * v0.36.14 - Economy Sanity Pass
 */

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/apiBase';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Coins, Users, ShoppingBag, FlaskConical } from 'lucide-react';

interface EconomyStats {
  totalGold: number;
  avgGoldPerUser: number;
  userCount: number;
  topRichUsers: Array<{
    id: string;
    name: string;
    gold: number;
  }>;
  totalItemsSold: number;
  totalPotionsPurchased: number;
}

export default function AdminEconomyPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<EconomyStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    
    if (status === 'authenticated') {
      loadStats();
    }
  }, [status, router]);

  async function loadStats() {
    setLoading(true);
    try {
      const res = await apiFetch('/api/admin/economy');
      if ((res as any).ok && (res as any).data) {
        setStats((res as any).data);
      }
    } catch (error) {
      console.error('Error loading economy stats:', error);
    } finally {
      setLoading(false);
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-accent" />
          <p className="text-muted-foreground">Loading economy stats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text mb-2">💰 Economy Dashboard</h1>
            <p className="text-subtle">Monitor gold circulation and marketplace activity</p>
          </div>
          <Button onClick={loadStats} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {stats && (
          <>
            {/* Overview Cards */}
            <div className="grid md:grid-cols-4 gap-4">
              <Card className="bg-card border-2 border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-subtle flex items-center gap-2">
                    <Coins className="h-4 w-4" />
                    Total Gold
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-text">
                    {stats.totalGold.toLocaleString()} 🪙
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-2 border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-subtle flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Avg Gold/User
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-text">
                    {stats.avgGoldPerUser.toLocaleString()} 🪙
                  </div>
                  <div className="text-xs text-subtle mt-1">
                    {stats.userCount} users
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-2 border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-subtle flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4" />
                    Items Sold
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-text">
                    {stats.totalItemsSold.toLocaleString()}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-2 border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-subtle flex items-center gap-2">
                    <FlaskConical className="h-4 w-4" />
                    Potions Purchased
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-text">
                    {stats.totalPotionsPurchased.toLocaleString()}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top 10 Richest Players */}
            <Card className="bg-card border-2 border-border">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Top 10 Richest Players</CardTitle>
              </CardHeader>
              <CardContent>
                {stats.topRichUsers.length > 0 ? (
                  <div className="space-y-2">
                    {stats.topRichUsers.map((user, index) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-3 bg-bg rounded border border-border"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-sm font-bold text-accent">
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-medium text-text">{user.name}</div>
                            <div className="text-xs text-subtle">{user.id.slice(0, 8)}...</div>
                          </div>
                        </div>
                        <div className="text-lg font-bold text-accent">
                          {user.gold.toLocaleString()} 🪙
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-subtle text-center py-4">No users found</p>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

