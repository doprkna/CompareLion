'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { BadgeGrid } from '@/components/badge/BadgeGrid';
import { BadgePopup } from '@/components/badge/BadgePopup';
import { BadgeToast } from '@/components/badge/BadgeToast';
import { useBadges, useUserBadges, Badge } from '@/hooks/useBadges';
import { useBadgeNotification } from '@/hooks/useBadgeNotification';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, CheckCircle, Sparkles } from 'lucide-react';

export default function BadgesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');

  const { badges: allBadges, loading: loadingAll, reload: reloadAll } = useBadges();
  const { 
    badges: userBadges, 
    loading: loadingUser,
    claimedCount,
    unclaimedCount,
    reload: reloadUser 
  } = useUserBadges();

  const { pendingUnlock, clearPending } = useBadgeNotification((badge) => {
    // Reload badges when new badge is unlocked
    reloadAll();
    reloadUser();
  });

  // Show toast when badge is unlocked
  const handleToastClose = () => {
    clearPending();
  };

  // Combine all badges with user unlock status
  const badgesWithStatus: Badge[] = allBadges.map((badge) => {
    const userBadge = userBadges.find((ub) => ub.badgeId === badge.id);
    return {
      ...badge,
      isUnlocked: !!userBadge,
      unlockedAt: userBadge?.unlockedAt,
      claimedAt: userBadge?.claimedAt,
      isClaimed: userBadge?.isClaimed,
      canClaim: !userBadge?.isClaimed && badge.rewardType !== null,
      userBadgeId: userBadge?.userBadgeId, // Pass UserBadge.id for claiming
    };
  });

  // Filter badges
  let filteredBadges = badgesWithStatus;
  if (filter === 'unlocked') {
    filteredBadges = badgesWithStatus.filter((b) => b.isUnlocked);
  } else if (filter === 'locked') {
    filteredBadges = badgesWithStatus.filter((b) => !b.isUnlocked);
  }

  const handleBadgeClick = (badge: Badge) => {
    setSelectedBadge(badge);
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    setSelectedBadge(null);
  };

  const handleClaimed = () => {
    reloadUser();
    reloadAll();
  };

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  if (status === 'loading' || loadingAll || loadingUser) {
    return (
      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        <div className="text-center py-12">Loading badges...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-text mb-2 flex items-center gap-2">
          <Trophy className="w-8 h-8" />
          Badges
        </h1>
        <p className="text-subtle">Unlock and claim rewards for your achievements</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-subtle">Total Badges</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-text">{badgesWithStatus.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-subtle flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Unlocked
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-text">
              {badgesWithStatus.filter((b) => b.isUnlocked).length}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-accent border-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-subtle flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Unclaimed Rewards
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">{unclaimedCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
        >
          All
        </Button>
        <Button
          variant={filter === 'unlocked' ? 'default' : 'outline'}
          onClick={() => setFilter('unlocked')}
        >
          Unlocked
        </Button>
        <Button
          variant={filter === 'locked' ? 'default' : 'outline'}
          onClick={() => setFilter('locked')}
        >
          Locked
        </Button>
      </div>

      {/* Badges Grid */}
      <BadgeGrid
        badges={filteredBadges}
        onBadgeClick={handleBadgeClick}
        loading={loadingAll || loadingUser}
      />

      {/* Badge Popup */}
      {showPopup && selectedBadge && (
        <BadgePopup
          badge={selectedBadge}
          onClose={handleClosePopup}
          onClaimed={handleClaimed}
        />
      )}

      {/* Badge Unlock Toast */}
      {pendingUnlock && (
        <BadgeToast badge={pendingUnlock} onClose={handleToastClose} />
      )}
    </div>
  );
}

