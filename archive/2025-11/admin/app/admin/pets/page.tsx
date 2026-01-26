/**
 * Admin Pets Management Page
 * /admin/pets - View pet catalog, spawn pets, manage pets
 * v0.36.32 - Companions & Pets 1.0
 */

'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Loader2, Plus, Users } from 'lucide-react';
import { toast } from 'sonner';

interface Pet {
  id: string;
  name: string;
  type: 'pet' | 'companion';
  rarity: string;
  bonus: any;
  icon: string | null;
  description: string | null;
  userCount: number;
}

export default function AdminPetsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [spawning, setSpawning] = useState<string | null>(null);
  const [spawnUserId, setSpawnUserId] = useState('');
  const [spawnPetId, setSpawnPetId] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    loadPets();
  }, [status]);

  const loadPets = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/pets');
      const data = await res.json();
      if (data.success) {
        setPets(data.pets || []);
      }
    } catch (error) {
      console.error('Failed to load pets', error);
      toast.error('Failed to load pets');
    } finally {
      setLoading(false);
    }
  };

  const handleSpawnPet = async (petId: string) => {
    if (!spawnUserId.trim()) {
      toast.error('Please enter a user ID');
      return;
    }

    setSpawning(petId);
    try {
      const res = await fetch('/api/admin/pets/spawn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: spawnUserId, petId }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(`Pet spawned for user!`);
        setSpawnUserId('');
        loadPets();
      } else {
        throw new Error(data.error || 'Failed to spawn pet');
      }
    } catch (error: any) {
      toast.error(error?.message || 'Failed to spawn pet');
    } finally {
      setSpawning(null);
    }
  };

  const handleSeedPets = async () => {
    try {
      const res = await fetch('/api/admin/pets/seed', {
        method: 'POST',
      });

      const data = await res.json();
      if (data.success) {
        toast.success('Pets seeded!');
        loadPets();
      }
    } catch (error: any) {
      toast.error('Failed to seed pets');
    }
  };

  function formatBonus(bonus: any): string {
    if (!bonus) return 'None';
    const parts: string[] = [];
    if (bonus.attack) parts.push(`⚔️ +${bonus.attack}`);
    if (bonus.defense) parts.push(`🛡️ +${bonus.defense}`);
    if (bonus.luck) parts.push(`🍀 +${bonus.luck}`);
    if (bonus.dodge) parts.push(`💨 +${bonus.dodge}`);
    if (bonus.critChance) parts.push(`🎯 +${bonus.critChance}%`);
    if (bonus.speed) parts.push(`⚡ +${bonus.speed}`);
    return parts.join(', ') || 'None';
  }

  const RARITY_COLORS: Record<string, string> = {
    common: 'border-gray-400',
    uncommon: 'border-green-400',
    rare: 'border-blue-400',
    epic: 'border-purple-400',
    legendary: 'border-yellow-400',
  };

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
          <h1 className="text-3xl font-bold">Pet Catalog</h1>
          <div className="flex gap-2">
            <Button onClick={handleSeedPets} variant="outline">
              Seed Pets
            </Button>
            <Button onClick={() => router.push('/admin')} variant="outline">
              Back to Admin
            </Button>
          </div>
        </div>

        {/* Spawn Pet Section */}
        <Card>
          <CardHeader>
            <CardTitle>Spawn Pet for User</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="User ID"
                value={spawnUserId}
                onChange={(e) => setSpawnUserId(e.target.value)}
                className="flex-1"
              />
            </div>
          </CardContent>
        </Card>

        {/* Pet Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {pets.map((pet) => {
            const rarityColor = RARITY_COLORS[pet.rarity] || RARITY_COLORS.common;

            return (
              <Card key={pet.id} className={`${rarityColor} border-2`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-3xl">{pet.icon || '🐾'}</span>
                        <div>
                          <CardTitle className="text-lg">{pet.name}</CardTitle>
                          <p className="text-xs text-muted-foreground capitalize">
                            {pet.rarity} • {pet.type}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {pet.description && (
                    <p className="text-sm text-muted-foreground">{pet.description}</p>
                  )}

                  <div className="text-xs">
                    <strong>Bonuses:</strong> {formatBonus(pet.bonus)}
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4" />
                    <span>{pet.userCount} users have this pet</span>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleSpawnPet(pet.id)}
                    disabled={spawning === pet.id || !spawnUserId.trim()}
                    className="w-full"
                  >
                    {spawning === pet.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-1" />
                        Spawn for User
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {pets.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">No pets found. Click "Seed Pets" to create the MVP set.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

