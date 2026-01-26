'use client';

/**
 * Adventure Mode Page
 * v0.36.16 - Adventure Mode v0.1
 */

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Swords, Coins, FlaskConical, Sparkles, Skull, RefreshCw, Map } from 'lucide-react';
import { apiFetch } from '@/lib/apiBase';
import { toast } from 'sonner';

interface AdventureNode {
  id: string;
  stage: number;
  type: 'fight' | 'reward' | 'shop' | 'event';
  data: any;
}

interface AdventureState {
  runId: string;
  currentStage: number;
  currentNode: AdventureNode | null;
  isFinished: boolean;
  totalStages: number;
}

export default function AdventurePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [state, setState] = useState<AdventureState | null>(null);
  const [allNodes, setAllNodes] = useState<AdventureNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showShopModal, setShowShopModal] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    
    if (status === 'authenticated') {
      loadAdventure();
    }
  }, [status, router]);

  async function loadAdventure() {
    setLoading(true);
    try {
      const res = await apiFetch('/api/adventure');
      if ((res as any).ok && (res as any).data) {
        setState((res as any).data.state);
        setAllNodes((res as any).data.allNodes || []);
      }
    } catch (error) {
      console.error('Error loading adventure:', error);
      toast.error('Failed to load adventure');
    } finally {
      setLoading(false);
    }
  }

  async function handleStart() {
    setProcessing(true);
    try {
      const res = await apiFetch('/api/adventure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start' }),
      });

      if ((res as any).ok && (res as any).data) {
        setState((res as any).data.state);
        setAllNodes((res as any).data.allNodes || []);
        toast.success('Adventure started!');
      } else {
        throw new Error((res as any).error || 'Failed to start adventure');
      }
    } catch (error: any) {
      toast.error(error?.message || 'Failed to start adventure');
    } finally {
      setProcessing(false);
    }
  }

  async function handleClaimReward() {
    setProcessing(true);
    try {
      const res = await apiFetch('/api/adventure/reward', {
        method: 'POST',
      });

      if ((res as any).ok && (res as any).data) {
        const rewards = (res as any).data.rewards;
        if (rewards.gold) {
          toast.success(`Claimed ${rewards.gold} gold!`);
        }
        if (rewards.xp) {
          toast.success(`Gained ${rewards.xp} XP!`);
        }
        setState((res as any).data.nextState);
        loadAdventure();
      } else {
        throw new Error((res as any).error || 'Failed to claim reward');
      }
    } catch (error: any) {
      toast.error(error?.message || 'Failed to claim reward');
    } finally {
      setProcessing(false);
    }
  }

  async function handleActivateEvent() {
    setProcessing(true);
    try {
      const res = await apiFetch('/api/adventure/event', {
        method: 'POST',
      });

      if ((res as any).ok && (res as any).data) {
        const event = (res as any).data.event;
        if (event) {
          toast.success(`Event "${event.name}" activated for 1 hour!`);
        }
        setState((res as any).data.nextState);
        loadAdventure();
      } else {
        throw new Error((res as any).error || 'Failed to activate event');
      }
    } catch (error: any) {
      toast.error(error?.message || 'Failed to activate event');
    } finally {
      setProcessing(false);
    }
  }

  async function handleReset() {
    if (!confirm('Are you sure you want to reset your adventure? This will start from the beginning.')) {
      return;
    }

    setProcessing(true);
    try {
      const res = await apiFetch('/api/adventure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset' }),
      });

      if ((res as any).ok && (res as any).data) {
        setState((res as any).data.state);
        setAllNodes((res as any).data.allNodes || []);
        toast.success('Adventure reset!');
      } else {
        throw new Error((res as any).error || 'Failed to reset adventure');
      }
    } catch (error: any) {
      toast.error(error?.message || 'Failed to reset adventure');
    } finally {
      setProcessing(false);
    }
  }

  function getNodeIcon(type: string, data?: any) {
    if (data?.boss) return '💀';
    switch (type) {
      case 'fight': return '⚔️';
      case 'reward': return '💰';
      case 'shop': return '🧪';
      case 'event': return '✨';
      default: return '📍';
    }
  }

  function getNodeStatus(nodeStage: number): 'completed' | 'current' | 'locked' {
    if (!state) return 'locked';
    if (state.isFinished) return 'completed';
    if (nodeStage < state.currentStage) return 'completed';
    if (nodeStage === state.currentStage) return 'current';
    return 'locked';
  }

  if (status === 'loading' || loading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-accent" />
          <p className="text-muted-foreground">Loading adventure...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Map className="h-8 w-8" />
            Adventure Mode
          </h1>
          {state && !state.isFinished && (
            <Button onClick={handleReset} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          )}
        </div>
        <p className="text-muted-foreground">Chapter 1: The Beginning</p>
      </div>

      {!state ? (
        <Card className="bg-card border-2 border-border">
          <CardContent className="p-12 text-center">
            <Map className="h-16 w-16 mx-auto mb-4 text-accent opacity-50" />
            <h2 className="text-2xl font-bold mb-2">Start Your Adventure</h2>
            <p className="text-muted-foreground mb-6">
              Embark on a journey through 10 challenging nodes
            </p>
            <Button onClick={handleStart} disabled={processing} size="lg">
              {processing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Starting...
                </>
              ) : (
                <>
                  <Swords className="h-4 w-4 mr-2" />
                  Start Adventure
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      ) : state.isFinished ? (
        <Card className="bg-card border-2 border-border border-accent">
          <CardContent className="p-12 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-3xl font-bold mb-2">Chapter 1 Complete!</h2>
            <p className="text-muted-foreground mb-6">
              You've completed all 10 nodes. More chapters coming soon!
            </p>
            <Button onClick={handleReset} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Play Again
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Node Map */}
          <Card className="bg-card border-2 border-border mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Map className="h-5 w-5" />
                Stage {state.currentStage} / {state.totalStages}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4 justify-center">
                {allNodes.map((node) => {
                  const status = getNodeStatus(node.stage);
                  const isCurrent = status === 'current';
                  const isCompleted = status === 'completed';
                  const isLocked = status === 'locked';

                  return (
                    <div
                      key={node.id}
                      className={`relative flex flex-col items-center p-4 rounded-lg border-2 transition-all ${
                        isCurrent
                          ? 'border-accent bg-accent/10 scale-110'
                          : isCompleted
                          ? 'border-green-500 bg-green-500/10 opacity-75'
                          : isLocked
                          ? 'border-border bg-bg opacity-50'
                          : 'border-border bg-card'
                      }`}
                    >
                      <div className="text-4xl mb-2">{getNodeIcon(node.type, node.data)}</div>
                      <div className="text-xs font-bold mb-1">{node.stage}</div>
                      {isCurrent && (
                        <div className="absolute -top-2 -right-2 w-4 h-4 bg-accent rounded-full animate-pulse" />
                      )}
                      {isCompleted && (
                        <div className="absolute -top-2 -right-2 w-4 h-4 bg-green-500 rounded-full" />
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Current Node Action */}
          {state.currentNode && (
            <Card className="bg-card border-2 border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {state.currentNode.type === 'fight' && <Swords className="h-5 w-5" />}
                  {state.currentNode.type === 'reward' && <Coins className="h-5 w-5" />}
                  {state.currentNode.type === 'shop' && <FlaskConical className="h-5 w-5" />}
                  {state.currentNode.type === 'event' && <Sparkles className="h-5 w-5" />}
                  Stage {state.currentStage}: {state.currentNode.type.charAt(0).toUpperCase() + state.currentNode.type.slice(1)} Node
                </CardTitle>
              </CardHeader>
              <CardContent>
                {state.currentNode.type === 'fight' && (
                  <div className="space-y-4">
                    <p className="text-muted-foreground">
                      Prepare for battle! Tier: {state.currentNode.data.tier || 'normal'}
                      {state.currentNode.data.boss && ' (BOSS)'}
                    </p>
                    <Button
                      onClick={() => router.push(`/play?adventure=true&tier=${state.currentNode?.data.tier || 'normal'}`)}
                      disabled={processing}
                      size="lg"
                      className="w-full"
                    >
                      <Swords className="h-4 w-4 mr-2" />
                      Fight!
                    </Button>
                  </div>
                )}

                {state.currentNode.type === 'reward' && (
                  <div className="space-y-4">
                    <p className="text-muted-foreground">
                      Claim your reward!
                      {state.currentNode.data.gold && ` ${state.currentNode.data.gold} gold`}
                      {state.currentNode.data.xp && ` ${state.currentNode.data.xp} XP`}
                      {state.currentNode.data.epicChance && ' Epic item chance!'}
                    </p>
                    <Button
                      onClick={handleClaimReward}
                      disabled={processing}
                      size="lg"
                      className="w-full"
                    >
                      {processing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Claiming...
                        </>
                      ) : (
                        <>
                          <Coins className="h-4 w-4 mr-2" />
                          Claim Reward
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {state.currentNode.type === 'shop' && (
                  <div className="space-y-4">
                    <p className="text-muted-foreground">
                      Visit the shop to purchase potions
                    </p>
                    <Button
                      onClick={() => router.push('/inventory')}
                      disabled={processing}
                      size="lg"
                      className="w-full"
                    >
                      <FlaskConical className="h-4 w-4 mr-2" />
                      Visit Shop
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                      After purchasing, return here to continue
                    </p>
                  </div>
                )}

                {state.currentNode.type === 'event' && (
                  <div className="space-y-4">
                    <p className="text-muted-foreground">
                      Activate a special event: {state.currentNode.data.code}
                    </p>
                    <Button
                      onClick={handleActivateEvent}
                      disabled={processing}
                      size="lg"
                      className="w-full"
                    >
                      {processing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Activating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Activate Event
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

