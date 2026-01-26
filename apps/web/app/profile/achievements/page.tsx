"use client";

import { useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAchievements } from '@parel/core/hooks/useAchievements';
import AchievementBadge from '@/components/achievements/AchievementBadge';
import Link from 'next/link';
import { Trophy, Swords, Brain, MessageCircle, DollarSign, Globe } from 'lucide-react';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';

const CATEGORY_INFO = {
  combat: { icon: Swords, label: 'Combat', emoji: '🗡️', color: 'text-red-400' },
  mind: { icon: Brain, label: 'Mind', emoji: '🧠', color: 'text-purple-400' },
  social: { icon: MessageCircle, label: 'Social', emoji: '💬', color: 'text-blue-400' },
  commerce: { icon: DollarSign, label: 'Commerce', emoji: '💰', color: 'text-yellow-400' },
  integration: { icon: Globe, label: 'Integration', emoji: '🌐', color: 'text-green-400' },
} as const;

export default function AchievementsPage() {
  const { achievements, categories, loading, error } = useAchievements();
  const [activeCategory, setActiveCategory] = useState<string>('combat');

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <Link href="/profile" className="text-accent hover:underline mb-2 inline-block">
            ← Back to Profile
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="h-8 w-8 text-accent" />
            <h1 className="text-4xl font-bold text-text">Achievements</h1>
          </div>
        </div>
        <SkeletonLoader variant="card" count={3} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Card className="bg-card border border-destructive">
          <CardContent className="p-6 text-center">
            <p className="text-destructive">Error loading achievements: {error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get unlocked count per category
  const getCategoryStats = (category: string) => {
    const categoryAchievements = categories[category] || [];
    const unlocked = categoryAchievements.filter((a) => a.unlocked).length;
    return { total: categoryAchievements.length, unlocked };
  };

  // Convert achievement format for AchievementBadge component
  const formatForBadge = (achievement: typeof achievements[0]) => ({
    id: achievement.id,
    title: achievement.name || achievement.title,
    description: achievement.description,
    icon: achievement.emoji || achievement.icon || '🏅',
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <Link href="/profile" className="text-accent hover:underline mb-2 inline-block">
          ← Back to Profile
        </Link>
        <div className="flex items-center gap-3 mb-2">
          <Trophy className="h-8 w-8 text-accent" />
          <h1 className="text-4xl font-bold text-text">Achievements</h1>
        </div>
        <p className="text-subtle">Collect badges by completing challenges and milestones</p>
      </div>

      {/* Category Tabs */}
      <Card className="mb-6">
        <CardContent className="p-0">
          <Tabs value={activeCategory} onValueChange={setActiveCategory}>
            <TabsList className="grid w-full grid-cols-5 h-auto p-2 bg-bg">
              {Object.entries(CATEGORY_INFO).map(([key, info]) => {
                const stats = getCategoryStats(key);
                const Icon = info.icon;
                return (
                  <TabsTrigger
                    key={key}
                    value={key}
                    className="flex flex-col items-center gap-1 py-3 data-[state=active]:bg-card"
                  >
                    <Icon className={`h-5 w-5 ${info.color}`} />
                    <span className="text-xs font-medium">{info.label}</span>
                    {stats.total > 0 && (
                      <span className="text-xs text-subtle">
                        {stats.unlocked}/{stats.total}
                      </span>
                    )}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {Object.keys(CATEGORY_INFO).map((category) => {
              const categoryAchievements = categories[category] || [];
              const stats = getCategoryStats(category);

              return (
                <TabsContent key={category} value={category} className="p-6">
                  <div className="mb-4">
                    <h2 className="text-2xl font-bold text-text mb-1">
                      {CATEGORY_INFO[category as keyof typeof CATEGORY_INFO].emoji}{' '}
                      {CATEGORY_INFO[category as keyof typeof CATEGORY_INFO].label}
                    </h2>
                    <p className="text-subtle">
                      {stats.unlocked} of {stats.total} unlocked
                    </p>
                  </div>

                  {categoryAchievements.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                      {categoryAchievements.map((achievement) => (
                        <div key={achievement.id} className="relative">
                          <AchievementBadge
                            a={formatForBadge(achievement)}
                            locked={!achievement.unlocked}
                          />
                          {/* Tier Badge */}
                          {achievement.tier > 1 && (
                            <div
                              className={`absolute top-2 right-2 px-1.5 py-0.5 rounded text-xs font-bold ${
                                achievement.unlocked
                                  ? 'bg-amber-500 text-white'
                                  : 'bg-gray-600 text-gray-300'
                              }`}
                            >
                              {achievement.tier === 2 ? 'II' : achievement.tier === 3 ? 'III' : achievement.tier}
                            </div>
                          )}
                          {/* Rewards Tooltip */}
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/60 rounded-2xl">
                            <div className="text-center p-2 text-white text-xs">
                              <div className="font-semibold mb-1">{achievement.description}</div>
                              {achievement.points > 0 && (
                                <div className="text-blue-300 font-bold">{achievement.points} pts</div>
                              )}
                              {achievement.xpReward > 0 && (
                                <div className="text-purple-300">+{achievement.xpReward} XP</div>
                              )}
                              {achievement.rewardGold > 0 && (
                                <div className="text-yellow-300">+{achievement.rewardGold} gold</div>
                              )}
                              {achievement.unlockedAt && (
                                <div className="text-gray-300 text-xs mt-1">
                                  {new Date(achievement.unlockedAt).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-subtle">
                      <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No achievements in this category yet</p>
                    </div>
                  )}
                </TabsContent>
              );
            })}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

