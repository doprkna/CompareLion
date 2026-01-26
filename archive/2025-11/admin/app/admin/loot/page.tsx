/**
 * Admin Loot Page
 * Manage loot tables, simulate rolls, view tables
 * v0.36.30 - Loot System 2.0
 */

'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Package, Loader2, RefreshCw, Play, Plus } from 'lucide-react';
import { apiFetch } from '@/lib/apiBase';
import { useToast } from '@/components/ui/use-toast';

interface LootTable {
  id: string;
  name: string;
  enemyType: string | null;
  items: Record<string, string[]>;
  weights: Record<string, number>;
  createdAt: string;
}

export default function AdminLootPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [tables, setTables] = useState<LootTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [simulating, setSimulating] = useState<string | null>(null);
  const [simResult, setSimResult] = useState<any>(null);

  useEffect(() => {
    if (status === 'authenticated') {
      loadTables();
    }
  }, [status]);

  async function loadTables() {
    setLoading(true);
    try {
      const res = await apiFetch('/api/loot/tables');
      if ((res as any).ok) {
        setTables((res as any).data.tables || []);
      }
    } catch (error) {
      console.error('Failed to load tables', error);
      toast({
        title: 'Error',
        description: 'Failed to load loot tables',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleSeed() {
    setSeeding(true);
    try {
      const res = await apiFetch('/api/admin/loot/seed', {
        method: 'POST',
      });

      if ((res as any).ok) {
        toast({
          title: 'Success',
          description: 'Loot tables seeded successfully',
        });
        await loadTables();
      } else {
        throw new Error((res as any).error || 'Seed failed');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to seed loot tables',
        variant: 'destructive',
      });
    } finally {
      setSeeding(false);
    }
  }

  async function simulateRoll(tableId: string) {
    setSimulating(tableId);
    try {
      // Simulate roll by calling fight-drop with test data
      const res = await apiFetch('/api/loot/fight-drop', {
        method: 'POST',
        body: JSON.stringify({
          fightId: 'sim-' + Date.now(),
          enemyType: tables.find(t => t.id === tableId)?.enemyType || undefined,
        }),
      });

      if ((res as any).ok) {
        setSimResult((res as any).data);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to simulate roll',
        variant: 'destructive',
      });
    } finally {
      setSimulating(null);
    }
  }

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
          <Package className="w-8 h-8" />
          Admin Loot System
        </h1>
        <p className="text-gray-400">Manage loot tables, simulate rolls, and configure drops</p>
      </div>

      {/* Actions */}
      <Card className="bg-gray-800 border-gray-700 mb-6">
        <CardContent className="p-4">
          <div className="flex gap-4">
            <Button
              onClick={handleSeed}
              disabled={seeding}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {seeding ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Seeding...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Seed Base Tables
                </>
              )}
            </Button>
            <Button
              onClick={loadTables}
              disabled={loading}
              variant="outline"
              className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Simulation Result */}
      {simResult && (
        <Card className="bg-gray-800 border-gray-700 mb-6">
          <CardContent className="p-4">
            <h3 className="text-lg font-bold text-white mb-2">Simulation Result</h3>
            {simResult.dropped ? (
              <div className="flex items-center gap-4">
                <div className="text-4xl">{simResult.item?.emoji || '📦'}</div>
                <div>
                  <div className="font-bold text-white">{simResult.item?.name}</div>
                  <div className="text-sm text-gray-400">Rarity: {simResult.rarity}</div>
                </div>
              </div>
            ) : (
              <p className="text-gray-400">No loot drop</p>
            )}
            <Button
              onClick={() => setSimResult(null)}
              variant="outline"
              size="sm"
              className="mt-2"
            >
              Close
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Loot Tables */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Loot Tables ({tables.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : tables.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No loot tables found. Seed base tables to get started.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tables.map((table) => (
                <Card key={table.id} className="bg-gray-900 border-gray-700">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-white">{table.name}</h3>
                        <p className="text-sm text-gray-400">
                          Enemy Type: {table.enemyType || 'N/A'}
                        </p>
                      </div>
                      <Button
                        onClick={() => simulateRoll(table.id)}
                        disabled={simulating === table.id}
                        size="sm"
                        variant="outline"
                        className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                      >
                        {simulating === table.id ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Rolling...
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 mr-2" />
                            Simulate Roll
                          </>
                        )}
                      </Button>
                    </div>

                    {/* Weights */}
                    <div className="mb-3">
                      <h4 className="text-sm font-semibold text-gray-300 mb-2">Rarity Weights:</h4>
                      <div className="flex gap-4 flex-wrap">
                        {Object.entries(table.weights).map(([rarity, weight]) => (
                          <div key={rarity} className="text-sm">
                            <span className="text-gray-400">{rarity}:</span>{' '}
                            <span className="text-white font-bold">{weight}%</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Items by Rarity */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-300 mb-2">Items:</h4>
                      <div className="space-y-2">
                        {Object.entries(table.items).map(([rarity, itemIds]) => (
                          <div key={rarity} className="text-sm">
                            <span className="text-gray-400 font-semibold">{rarity}:</span>{' '}
                            <span className="text-white">
                              {Array.isArray(itemIds) ? itemIds.length : 0} items
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

