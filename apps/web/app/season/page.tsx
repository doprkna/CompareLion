/**
 * Season Pass Page
 * v0.36.23 - Season Pass System
 */

'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { apiFetch } from '@/lib/apiBase';
import { useToast } from '@/components/ui/use-toast';
import { Crown, Lock, Check, Gift } from 'lucide-react';

interface SeasonTier {
  id: string;
  tier: number;
  xpRequired: number;
  freeReward: any;
  premiumReward: any;
}

interface SeasonProgress {
  season: {
    id: string;
    name: string;
    seasonNumber: number;
    startsAt: string;
    endsAt: string;
    isActive: boolean;
  };
  tiers: SeasonTier[];
  userProgress: {
    xp: number;
    currentTier: number;
    claimedFreeRewards: number[];
    claimedPremiumRewards: number[];
  };
}

export default function SeasonPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [progress, setProgress] = useState<SeasonProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState<string | null>(null);

  useEffect(() => {
    loadSeason();
  }, [session]);

  async function loadSeason() {
    setLoading(true);
    try {
      const res = await apiFetch('/api/season/current');
      if ((res as any).ok && (res as any).data) {
        if ((res as any).data.season) {
          setProgress((res as any).data);
        } else {
          setProgress(null);
        }
      }
    } catch (error) {
      console.error('Failed to load season', error);
    } finally {
      setLoading(false);
    }
  }

  async function claimReward(tier: number, track: 'free' | 'premium') {
    if (!progress) return;

    setClaiming(`${tier}-${track}`);
    try {
      const res = await apiFetch('/api/season/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier,
          track,
          seasonId: progress.season.id,
        }),
      });

      if ((res as any).ok) {
        toast({
          title: 'Reward Claimed!',
          description: `Tier ${tier} ${track} reward claimed successfully.`,
        });
        loadSeason(); // Reload to update claimed status
      } else {
        toast({
          title: 'Failed to Claim',
          description: (res as any).error || 'An error occurred',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to claim reward',
        variant: 'destructive',
      });
    } finally {
      setClaiming(null);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-white">Loading season pass...</div>
        </div>
      </div>
    );
  }

  if (!progress) {
    return (
      <div className="min-h-screen bg-gray-900 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-gray-800 rounded-lg p-8 text-center">
            <h1 className="text-2xl font-bold text-white mb-4">No Active Season</h1>
            <p className="text-gray-400">Check back soon for the next season!</p>
          </div>
        </div>
      </div>
    );
  }

  const { season, tiers, userProgress } = progress;
  const isPremium = session?.user?.isPremium || false;
  const daysLeft = Math.ceil((new Date(season.endsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  // Find current tier's XP requirement
  const currentTierData = tiers.find(t => t.tier === userProgress.currentTier);
  const nextTierData = tiers.find(t => t.tier === userProgress.currentTier + 1);
  const xpToNextTier = nextTierData 
    ? nextTierData.xpRequired - userProgress.xp 
    : 0;
  const xpProgress = nextTierData 
    ? (userProgress.xp - (currentTierData?.xpRequired || 0)) / (nextTierData.xpRequired - (currentTierData?.xpRequired || 0))
    : 1;

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{season.name}</h1>
              <p className="text-gray-400">Season {season.seasonNumber}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-white">{daysLeft}</div>
              <div className="text-sm text-gray-400">Days Remaining</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-400">
              <span>Tier {userProgress.currentTier}</span>
              <span>{nextTierData ? `Tier ${nextTierData.tier}` : 'Max Tier'}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-4">
              <div
                className="bg-purple-600 h-4 rounded-full transition-all"
                style={{ width: `${Math.min(100, xpProgress * 100)}%` }}
              />
            </div>
            <div className="text-sm text-gray-400 text-center">
              {xpToNextTier > 0 ? `${xpToNextTier} XP to next tier` : 'Max tier reached!'}
            </div>
          </div>
        </div>

        {/* Tiers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tiers.map((tier) => {
            const isUnlocked = userProgress.currentTier >= tier.tier;
            const freeClaimed = userProgress.claimedFreeRewards.includes(tier.tier);
            const premiumClaimed = userProgress.claimedPremiumRewards.includes(tier.tier);
            const canClaimFree = isUnlocked && !freeClaimed;
            const canClaimPremium = isUnlocked && isPremium && !premiumClaimed;

            return (
              <div
                key={tier.id}
                className={`bg-gray-800 rounded-lg p-4 border-2 ${
                  isUnlocked ? 'border-purple-600' : 'border-gray-700 opacity-50'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-white">Tier {tier.tier}</span>
                    {!isUnlocked && <Lock className="h-4 w-4 text-gray-500" />}
                  </div>
                  <span className="text-sm text-gray-400">{tier.xpRequired} XP</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Free Reward */}
                  <div className="bg-gray-700 rounded p-3">
                    <div className="text-xs text-gray-400 mb-2">FREE</div>
                    {tier.freeReward ? (
                      <div>
                        <div className="text-white font-semibold mb-2">
                          {getRewardDisplay(tier.freeReward)}
                        </div>
                        {canClaimFree ? (
                          <button
                            onClick={() => claimReward(tier.tier, 'free')}
                            disabled={claiming === `${tier.tier}-free`}
                            className="w-full px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-white text-sm"
                          >
                            {claiming === `${tier.tier}-free` ? 'Claiming...' : 'Claim'}
                          </button>
                        ) : freeClaimed ? (
                          <div className="flex items-center gap-1 text-green-500 text-sm">
                            <Check className="h-4 w-4" />
                            Claimed
                          </div>
                        ) : (
                          <div className="text-gray-500 text-sm">Locked</div>
                        )}
                      </div>
                    ) : (
                      <div className="text-gray-500 text-sm">No reward</div>
                    )}
                  </div>

                  {/* Premium Reward */}
                  <div className="bg-gray-700 rounded p-3 border-2 border-yellow-600">
                    <div className="flex items-center gap-1 text-xs text-yellow-400 mb-2">
                      <Crown className="h-3 w-3" />
                      PREMIUM
                    </div>
                    {tier.premiumReward ? (
                      <div>
                        <div className="text-white font-semibold mb-2">
                          {getRewardDisplay(tier.premiumReward)}
                        </div>
                        {!isPremium ? (
                          <a
                            href="/profile/premium"
                            className="block w-full px-3 py-1 bg-yellow-600 hover:bg-yellow-700 rounded text-white text-sm text-center"
                          >
                            Upgrade
                          </a>
                        ) : canClaimPremium ? (
                          <button
                            onClick={() => claimReward(tier.tier, 'premium')}
                            disabled={claiming === `${tier.tier}-premium`}
                            className="w-full px-3 py-1 bg-yellow-600 hover:bg-yellow-700 rounded text-white text-sm"
                          >
                            {claiming === `${tier.tier}-premium` ? 'Claiming...' : 'Claim'}
                          </button>
                        ) : premiumClaimed ? (
                          <div className="flex items-center gap-1 text-yellow-500 text-sm">
                            <Check className="h-4 w-4" />
                            Claimed
                          </div>
                        ) : (
                          <div className="text-gray-500 text-sm">Locked</div>
                        )}
                      </div>
                    ) : (
                      <div className="text-gray-500 text-sm">No reward</div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function getRewardDisplay(reward: any): string {
  if (!reward) return 'No reward';

  switch (reward.type) {
    case 'gold':
      return `💰 ${reward.amount || 0} Gold`;
    case 'diamonds':
      return `💎 ${reward.amount || 0} Diamonds`;
    case 'item':
      return `🎒 Item`;
    case 'companion':
      return `🐾 Companion`;
    case 'theme':
      return `🎨 Theme`;
    case 'xp-boost':
      return `⚡ ${reward.amount || 1}h XP Boost`;
    default:
      return reward.type || 'Reward';
  }
}


