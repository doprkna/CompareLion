'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { QuestCard } from '@/components/quest/QuestCard';
import { QuestClaimPopup } from '@/components/quest/QuestClaimPopup';
import { QuestCompletionModal } from '@/components/quest/QuestCompletionModal';
import { useQuests, useClaimQuest, Quest } from '@parel/core/hooks/useQuests';
import { useQuestClaimWithLore } from '@parel/core/hooks/useQuestLore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Target, Loader2, Calendar, BookOpen, Map } from 'lucide-react';

export default function QuestsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);
  const [showClaimPopup, setShowClaimPopup] = useState(false);
  const [filter, setFilter] = useState<'all' | 'daily' | 'weekly' | 'story' | 'side'>('all');

  const { quests, loading, error, reload } = useQuests();
  const { claimWithLore, loading: claiming, error: claimError, lore: claimLore } = useQuestClaimWithLore();
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [completedQuest, setCompletedQuest] = useState<Quest | null>(null);
  const [claimRewards, setClaimRewards] = useState<any>(null);

  // Filter quests
  const filteredQuests = filter === 'all' 
    ? quests 
    : quests.filter(q => q.type === filter);

  const handleClaimClick = (quest: Quest) => {
    setSelectedQuest(quest);
    setShowClaimPopup(true);
  };

  const handleConfirmClaim = async () => {
    if (!selectedQuest) return;

    if (!selectedQuest.userQuestId) {
      alert('Unable to claim: Quest not started');
      return;
    }

    try {
      const data = await claimWithLore(selectedQuest.userQuestId);
      
      // Show completion modal with lore
      setCompletedQuest(selectedQuest);
      setClaimRewards(data.rewards || {
        xp: selectedQuest.rewardXP,
        gold: selectedQuest.rewardGold,
        karma: selectedQuest.rewardKarma,
        badge: selectedQuest.rewardBadge,
        item: selectedQuest.rewardItem,
      });
      setShowClaimPopup(false);
      setShowCompletionModal(true);
      setSelectedQuest(null);
      reload();
    } catch (err) {
      // Error handled by hook
    }
  };

  const handleCloseCompletionModal = () => {
    setShowCompletionModal(false);
    setCompletedQuest(null);
    setClaimRewards(null);
  };

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  if (status === 'loading' || loading) {
    return (
      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-subtle" />
        </div>
      </div>
    );
  }

  // Group quests by type for display
  const groupedQuests = {
    daily: filteredQuests.filter(q => q.type === 'daily'),
    weekly: filteredQuests.filter(q => q.type === 'weekly'),
    story: filteredQuests.filter(q => q.type === 'story'),
    side: filteredQuests.filter(q => q.type === 'side'),
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-text mb-2 flex items-center gap-2">
          <Target className="w-8 h-8" />
          Quests & Missions
        </h1>
        <p className="text-subtle">Complete objectives and earn rewards</p>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
        >
          All
        </Button>
        <Button
          variant={filter === 'daily' ? 'default' : 'outline'}
          onClick={() => setFilter('daily')}
        >
          <Calendar className="w-4 h-4 mr-2" />
          Daily
        </Button>
        <Button
          variant={filter === 'weekly' ? 'default' : 'outline'}
          onClick={() => setFilter('weekly')}
        >
          <Calendar className="w-4 h-4 mr-2" />
          Weekly
        </Button>
        <Button
          variant={filter === 'story' ? 'default' : 'outline'}
          onClick={() => setFilter('story')}
        >
          <BookOpen className="w-4 h-4 mr-2" />
          Story
        </Button>
        <Button
          variant={filter === 'side' ? 'default' : 'outline'}
          onClick={() => setFilter('side')}
        >
          <Map className="w-4 h-4 mr-2" />
          Side
        </Button>
      </div>

      {/* Error State */}
      {error && (
        <Card className="bg-card border-red-500/20 mb-6">
          <CardContent className="p-4">
            <p className="text-red-500">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Quests by Type */}
      <div className="space-y-8">
        {/* Daily Quests */}
        {groupedQuests.daily.length > 0 && (
          <section>
            <h2 className="text-2xl font-semibold text-text mb-4 flex items-center gap-2">
              <Calendar className="w-6 h-6" />
              Daily Quests
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groupedQuests.daily.map((quest) => (
                <QuestCard
                  key={quest.id}
                  quest={quest}
                  onClaim={quest.canClaim ? () => handleClaimClick(quest) : undefined}
                  claiming={claiming && selectedQuest?.id === quest.id}
                />
              ))}
            </div>
          </section>
        )}

        {/* Weekly Quests */}
        {groupedQuests.weekly.length > 0 && (
          <section>
            <h2 className="text-2xl font-semibold text-text mb-4 flex items-center gap-2">
              <Calendar className="w-6 h-6" />
              Weekly Quests
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groupedQuests.weekly.map((quest) => (
                <QuestCard
                  key={quest.id}
                  quest={quest}
                  onClaim={quest.canClaim ? () => handleClaimClick(quest) : undefined}
                  claiming={claiming && selectedQuest?.id === quest.id}
                />
              ))}
            </div>
          </section>
        )}

        {/* Story Quests */}
        {groupedQuests.story.length > 0 && (
          <section>
            <h2 className="text-2xl font-semibold text-text mb-4 flex items-center gap-2">
              <BookOpen className="w-6 h-6" />
              Story Quests
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groupedQuests.story.map((quest) => (
                <QuestCard
                  key={quest.id}
                  quest={quest}
                  onClaim={quest.canClaim ? () => handleClaimClick(quest) : undefined}
                  claiming={claiming && selectedQuest?.id === quest.id}
                />
              ))}
            </div>
          </section>
        )}

        {/* Side Quests */}
        {groupedQuests.side.length > 0 && (
          <section>
            <h2 className="text-2xl font-semibold text-text mb-4 flex items-center gap-2">
              <Map className="w-6 h-6" />
              Side Quests
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groupedQuests.side.map((quest) => (
                <QuestCard
                  key={quest.id}
                  quest={quest}
                  onClaim={quest.canClaim ? () => handleClaimClick(quest) : undefined}
                  claiming={claiming && selectedQuest?.id === quest.id}
                />
              ))}
            </div>
          </section>
        )}

        {/* No Quests Message */}
        {filteredQuests.length === 0 && !loading && (
          <Card className="bg-card border-border">
            <CardContent className="p-8 text-center">
              <Target className="w-12 h-12 mx-auto mb-4 text-subtle" />
              <h3 className="text-xl font-semibold text-text mb-2">No Quests Available</h3>
              <p className="text-subtle">Quests will appear here as they become available.</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Claim Popup */}
      {showClaimPopup && selectedQuest && (
        <QuestClaimPopup
          quest={selectedQuest}
          isOpen={showClaimPopup}
          onClose={() => {
            setShowClaimPopup(false);
            setSelectedQuest(null);
          }}
          onConfirm={handleConfirmClaim}
          claiming={claiming}
        />
      )}

      {/* Completion Modal with Lore */}
      {showCompletionModal && completedQuest && claimRewards && (
        <QuestCompletionModal
          quest={completedQuest}
          lore={claimLore}
          isOpen={showCompletionModal}
          onClose={handleCloseCompletionModal}
          rewards={claimRewards}
        />
      )}
    </div>
  );
}

