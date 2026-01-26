/**
 * Pets Page
 * /profile/pets - View and manage pets/companions
 * v0.36.32 - Companions & Pets 1.0
 */

'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Loader2, Sparkles, Shield, Zap, Heart, Target, Coins, TrendingUp, Edit2, Check, X } from 'lucide-react';
import { toast } from 'sonner';

interface Pet {
  id: string;
  petId: string;
  level: number;
  xp: number;
  equipped: boolean;
  nickname: string | null;
  createdAt: Date;
  xpNeeded: number;
  pet: {
    id: string;
    name: string;
    type: 'pet' | 'companion';
    rarity: string;
    bonus: any;
    icon: string | null;
    description: string | null;
  };
}

const RARITY_COLORS: Record<string, string> = {
  common: 'border-gray-400 bg-gray-50',
  uncommon: 'border-green-400 bg-green-50',
  rare: 'border-blue-400 bg-blue-50',
  epic: 'border-purple-400 bg-purple-50',
  legendary: 'border-yellow-400 bg-yellow-50',
};

const RARITY_LABELS: Record<string, string> = {
  common: 'Common',
  uncommon: 'Uncommon',
  rare: 'Rare',
  epic: 'Epic',
  legendary: 'Legendary',
};

export default function PetsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [equipping, setEquipping] = useState<string | null>(null);
  const [renaming, setRenaming] = useState<string | null>(null);
  const [nickname, setNickname] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    
    if (status === 'authenticated') {
      loadPets();
    }
  }, [status, router]);

  async function loadPets() {
    setLoading(true);
    try {
      const res = await fetch('/api/pets');
      const data = await res.json();
      if (data.success) {
        setPets(data.pets || []);
      }
    } catch (error) {
      console.error('Error loading pets:', error);
      toast.error('Failed to load pets');
    } finally {
      setLoading(false);
    }
  }

  async function handleEquip(userPetId: string) {
    setEquipping(userPetId);
    try {
      const res = await fetch('/api/pets/equip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userPetId }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success('Companion equipped!');
        loadPets();
      } else {
        throw new Error(data.error || 'Failed to equip companion');
      }
    } catch (error: any) {
      toast.error(error?.message || 'Failed to equip companion');
    } finally {
      setEquipping(null);
    }
  }

  async function handleRename(userPetId: string, currentNickname: string | null) {
    setRenaming(userPetId);
    setNickname(currentNickname || '');
  }

  async function saveRename(userPetId: string) {
    try {
      const res = await fetch('/api/pets/rename', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userPetId, nickname: nickname.trim() || null }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success('Pet renamed!');
        setRenaming(null);
        setNickname('');
        loadPets();
      } else {
        throw new Error(data.error || 'Failed to rename pet');
      }
    } catch (error: any) {
      toast.error(error?.message || 'Failed to rename pet');
    } finally {
      setRenaming(null);
    }
  }

  function cancelRename() {
    setRenaming(null);
    setNickname('');
  }

  function formatBonus(bonus: any): string {
    if (!bonus) return 'No bonuses';
    const parts: string[] = [];
    if (bonus.attack) parts.push(`⚔️ +${bonus.attack} Attack`);
    if (bonus.defense) parts.push(`🛡️ +${bonus.defense} Defense`);
    if (bonus.luck) parts.push(`🍀 +${bonus.luck} Luck`);
    if (bonus.dodge) parts.push(`💨 +${bonus.dodge} Dodge`);
    if (bonus.critChance) parts.push(`🎯 +${bonus.critChance}% Crit`);
    if (bonus.speed) parts.push(`⚡ +${bonus.speed} Speed`);
    return parts.length > 0 ? parts.join(', ') : 'No bonuses';
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg p-4 sm:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">My Pets & Companions</h1>
          <Button variant="outline" onClick={() => router.push('/profile')}>
            Back to Profile
          </Button>
        </div>

        {pets.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Sparkles className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold mb-2">You haven't met any companions yet.</h2>
              <p className="text-muted-foreground">
                Complete quests, win fights, or find pet eggs in loot to unlock companions!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pets.map((pet) => {
              const rarityColor = RARITY_COLORS[pet.pet.rarity] || RARITY_COLORS.common;
              const rarityLabel = RARITY_LABELS[pet.pet.rarity] || pet.pet.rarity;
              const displayName = pet.nickname || pet.pet.name;
              const xpPercent = (pet.xp / pet.xpNeeded) * 100;

              return (
                <Card
                  key={pet.id}
                  className={`${rarityColor} ${pet.equipped ? 'ring-2 ring-yellow-400 ring-offset-2' : ''}`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-3xl">{pet.pet.icon || '🐾'}</span>
                          <div>
                            <CardTitle className="text-lg">{displayName}</CardTitle>
                            <p className="text-xs text-muted-foreground">{pet.pet.name}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`text-xs px-2 py-0.5 rounded ${rarityColor}`}>
                            {rarityLabel}
                          </span>
                          {pet.equipped && (
                            <span className="text-xs px-2 py-0.5 rounded bg-yellow-400 text-yellow-900">
                              ⭐ Equipped
                            </span>
                          )}
                        </div>
                      </div>
                      {renaming === pet.id ? (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => saveRename(pet.id)}
                            className="h-6 w-6 p-0"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={cancelRename}
                            className="h-6 w-6 p-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRename(pet.id, pet.nickname)}
                          className="h-6 w-6 p-0"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {renaming === pet.id ? (
                      <div className="space-y-2">
                        <Input
                          value={nickname}
                          onChange={(e) => setNickname(e.target.value)}
                          placeholder="Enter nickname"
                          maxLength={50}
                          className="h-8"
                        />
                      </div>
                    ) : (
                      <>
                        {pet.pet.description && (
                          <p className="text-sm text-muted-foreground">{pet.pet.description}</p>
                        )}

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>Level {pet.level}</span>
                            <span className="text-muted-foreground">
                              {pet.xp} / {pet.xpNeeded} XP
                            </span>
                          </div>
                          <Progress value={xpPercent} className="h-2" />
                        </div>

                        <div className="text-xs text-muted-foreground">
                          {formatBonus(pet.pet.bonus)}
                        </div>

                        <div className="flex gap-2 pt-2">
                          {pet.pet.type === 'companion' && (
                            <Button
                              size="sm"
                              variant={pet.equipped ? 'secondary' : 'default'}
                              onClick={() => handleEquip(pet.id)}
                              disabled={equipping === pet.id}
                              className="flex-1"
                            >
                              {equipping === pet.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : pet.equipped ? (
                                'Unequip'
                              ) : (
                                'Equip'
                              )}
                            </Button>
                          )}
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

