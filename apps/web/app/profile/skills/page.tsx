/**
 * Skills Page
 * /profile/skills - View and manage skills
 * v0.36.33 - Skills & Abilities v1
 */

'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Zap, Shield, Heart, Target, Coins, Lock, Check } from 'lucide-react';
import { toast } from 'sonner';

interface Skill {
  id: string;
  skillId: string;
  name: string;
  type: 'active' | 'passive';
  description: string;
  power: number;
  cooldown: number | null;
  icon: string | null;
  level: number;
  equipped: boolean;
  cooldownRemaining: number;
}

const TYPE_COLORS: Record<string, string> = {
  active: 'border-blue-400 bg-blue-50',
  passive: 'border-green-400 bg-green-50',
};

const TYPE_LABELS: Record<string, string> = {
  active: 'Active',
  passive: 'Passive',
};

export default function SkillsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [equipping, setEquipping] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    
    if (status === 'authenticated') {
      loadSkills();
    }
  }, [status, router]);

  async function loadSkills() {
    setLoading(true);
    try {
      const res = await fetch('/api/skills');
      const data = await res.json();
      if (data.success) {
        setSkills(data.skills || []);
      }
    } catch (error) {
      console.error('Error loading skills:', error);
      toast.error('Failed to load skills');
    } finally {
      setLoading(false);
    }
  }

  async function handleEquip(userSkillId: string) {
    setEquipping(userSkillId);
    try {
      const res = await fetch('/api/skills/equip-active', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userSkillId }),
      });
      const data = await res.json();
      
      if (data.success) {
        toast.success('Skill equipped');
        await loadSkills();
      } else {
        toast.error(data.message || 'Failed to equip skill');
      }
    } catch (error) {
      console.error('Error equipping skill:', error);
      toast.error('Failed to equip skill');
    } finally {
      setEquipping(null);
    }
  }

  const activeSkills = skills.filter((s) => s.type === 'active');
  const passiveSkills = skills.filter((s) => s.type === 'passive');
  const equippedActive = activeSkills.find((s) => s.equipped);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Skills & Abilities</h1>
        <p className="text-muted-foreground">
          Manage your active and passive skills. Active skills can be used in combat.
        </p>
      </div>

      {/* Active Skill Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Active Skill
        </h2>
        <p className="text-sm text-muted-foreground">
          You can equip one active skill at a time. Use it in combat for special effects.
        </p>

        {equippedActive ? (
          <Card className={`${TYPE_COLORS.active} border-2 ring-2 ring-yellow-400 ring-offset-2`}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-3xl">{equippedActive.icon || '⚔️'}</span>
                    <div>
                      <CardTitle className="text-lg">{equippedActive.name}</CardTitle>
                      <p className="text-xs text-muted-foreground">Level {equippedActive.level}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs px-2 py-0.5 rounded bg-blue-400 text-blue-900">
                      {TYPE_LABELS.active}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-yellow-400 text-yellow-900">
                      ⭐ Equipped
                    </span>
                    {equippedActive.cooldownRemaining > 0 && (
                      <span className="text-xs px-2 py-0.5 rounded bg-red-400 text-red-900">
                        Cooldown: {equippedActive.cooldownRemaining} rounds
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm">{equippedActive.description}</p>
              {equippedActive.cooldown && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Cooldown: {equippedActive.cooldown} rounds</span>
                </div>
              )}
              <div className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEquip(equippedActive.id)}
                  disabled={equipping === equippedActive.id}
                >
                  {equipping === equippedActive.id ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Unequipping...
                    </>
                  ) : (
                    'Unequip'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-2 border-dashed">
            <CardContent className="py-8 text-center">
              <Lock className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
              <p className="text-muted-foreground">No active skill equipped</p>
              <p className="text-sm text-muted-foreground mt-1">
                Equip an active skill below to use it in combat
              </p>
            </CardContent>
          </Card>
        )}

        {/* Available Active Skills */}
        {activeSkills.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Available Active Skills</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeSkills.map((skill) => {
                if (skill.equipped) return null; // Skip equipped skill (shown above)

                return (
                  <Card
                    key={skill.id}
                    className={`${TYPE_COLORS.active} ${skill.equipped ? 'ring-2 ring-yellow-400 ring-offset-2' : ''}`}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-3xl">{skill.icon || '⚔️'}</span>
                            <div>
                              <CardTitle className="text-lg">{skill.name}</CardTitle>
                              <p className="text-xs text-muted-foreground">Level {skill.level}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs px-2 py-0.5 rounded bg-blue-400 text-blue-900">
                              {TYPE_LABELS.active}
                            </span>
                            {skill.cooldownRemaining > 0 && (
                              <span className="text-xs px-2 py-0.5 rounded bg-red-400 text-red-900">
                                Cooldown: {skill.cooldownRemaining}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm">{skill.description}</p>
                      {skill.cooldown && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>Cooldown: {skill.cooldown} rounds</span>
                        </div>
                      )}
                      <div className="pt-2">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleEquip(skill.id)}
                          disabled={equipping === skill.id || skill.cooldownRemaining > 0}
                          className="w-full"
                        >
                          {equipping === skill.id ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Equipping...
                            </>
                          ) : (
                            <>
                              <Check className="h-4 w-4 mr-2" />
                              Equip
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Passive Skills Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Passive Skills
        </h2>
        <p className="text-sm text-muted-foreground">
          Passive skills are automatically active once unlocked. No need to equip them.
        </p>

        {passiveSkills.length === 0 ? (
          <Card className="border-2 border-dashed">
            <CardContent className="py-8 text-center">
              <Lock className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
              <p className="text-muted-foreground">No passive skills unlocked</p>
              <p className="text-sm text-muted-foreground mt-1">
                Unlock passive skills by leveling up (every 5 levels)
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {passiveSkills.map((skill) => {
              return (
                <Card
                  key={skill.id}
                  className={`${TYPE_COLORS.passive} border-2`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-3xl">{skill.icon || '🛡️'}</span>
                          <div>
                            <CardTitle className="text-lg">{skill.name}</CardTitle>
                            <p className="text-xs text-muted-foreground">Level {skill.level}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs px-2 py-0.5 rounded bg-green-400 text-green-900">
                            {TYPE_LABELS.passive}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded bg-blue-400 text-blue-900">
                            ✓ Active
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm">{skill.description}</p>
                    <div className="pt-2">
                      <div className="text-xs text-muted-foreground">
                        Automatically applied to your stats
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Locked Skills Placeholder */}
      {skills.length === 0 && (
        <Card className="border-2 border-dashed">
          <CardContent className="py-12 text-center">
            <Lock className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No Skills Unlocked</h3>
            <p className="text-muted-foreground mb-4">
              You haven't unlocked any skills yet.
            </p>
            <p className="text-sm text-muted-foreground">
              Skills are unlocked automatically every 5 levels (Level 5, 10, 15, etc.)
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

