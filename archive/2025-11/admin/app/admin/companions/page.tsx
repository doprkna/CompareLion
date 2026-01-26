'use client';

/**
 * Admin Companions Page
 * v0.36.17 - Companions + Pets System v0.1
 */

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/apiBase';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RefreshCw, Plus, Edit, Sparkles, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { getRarityColorClass, getRarityDisplayName } from '@/lib/rpg/rarity';

interface Companion {
  id: string;
  name: string;
  type: string;
  rarity: string;
  icon: string | null;
  description?: string | null;
  atkBonus: number;
  defBonus: number;
  hpBonus: number;
  critBonus: number;
  speedBonus: number;
  xpBonus: number;
  goldBonus: number;
  travelBonus?: number;
}

export default function AdminCompanionsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [companions, setCompanions] = useState<Companion[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Companion | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'pet',
    rarity: 'common',
    icon: '',
    description: '',
    atkBonus: 0,
    defBonus: 0,
    hpBonus: 0,
    critBonus: 0,
    speedBonus: 0,
    xpBonus: 0,
    goldBonus: 0,
    travelBonus: 0,
  });
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    
    if (status === 'authenticated') {
      loadCompanions();
    }
  }, [status, router]);

  async function loadCompanions() {
    setLoading(true);
    try {
      const res = await apiFetch('/api/admin/companions');
      if ((res as any).ok && (res as any).data?.companions) {
        setCompanions((res as any).data.companions);
      }
    } catch (error) {
      console.error('Error loading companions:', error);
      toast.error('Failed to load companions');
    } finally {
      setLoading(false);
    }
  }

  async function seedCompanions() {
    try {
      const res = await apiFetch('/api/admin/companions', {
        method: 'PUT',
      });

      if ((res as any).ok) {
        toast.success(`Seeded ${(res as any).data?.count || 0} companions`);
        loadCompanions();
      } else {
        throw new Error((res as any).error || 'Failed to seed companions');
      }
    } catch (error: any) {
      toast.error(error?.message || 'Failed to seed companions');
    }
  }

  function startEdit(companion: Companion) {
    setEditing(companion);
    setFormData({
      name: companion.name,
      type: companion.type,
      rarity: companion.rarity,
      icon: companion.icon || '',
      description: companion.description || '',
      atkBonus: companion.atkBonus,
      defBonus: companion.defBonus,
      hpBonus: companion.hpBonus,
      critBonus: companion.critBonus,
      speedBonus: companion.speedBonus,
      xpBonus: companion.xpBonus,
      goldBonus: companion.goldBonus,
      travelBonus: companion.travelBonus || 0,
    });
    setShowForm(true);
  }

  function startCreate() {
    setEditing(null);
    setFormData({
      name: '',
      type: 'pet',
      rarity: 'common',
      icon: '',
      description: '',
      atkBonus: 0,
      defBonus: 0,
      hpBonus: 0,
      critBonus: 0,
      speedBonus: 0,
      xpBonus: 0,
      goldBonus: 0,
      travelBonus: 0,
    });
    setShowForm(true);
  }

  async function saveCompanion() {
    try {
      const res = await apiFetch('/api/admin/companions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editing?.id,
          ...formData,
        }),
      });

      if ((res as any).ok) {
        toast.success(editing ? 'Companion updated!' : 'Companion created!');
        setShowForm(false);
        setEditing(null);
        loadCompanions();
      } else {
        throw new Error((res as any).error || 'Failed to save companion');
      }
    } catch (error: any) {
      toast.error(error?.message || 'Failed to save companion');
    }
  }

  async function deleteCompanion(id: string) {
    if (!confirm('Are you sure you want to delete this companion?')) {
      return;
    }

    setDeleting(id);
    try {
      const res = await apiFetch(`/api/admin/companions/${id}`, {
        method: 'DELETE',
      });

      if ((res as any).ok) {
        toast.success('Companion deleted!');
        loadCompanions();
      } else {
        throw new Error((res as any).error || 'Failed to delete companion');
      }
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete companion');
    } finally {
      setDeleting(null);
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-accent" />
          <p className="text-muted-foreground">Loading companions...</p>
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
            <h1 className="text-3xl font-bold text-text mb-2">🐾 Companions</h1>
            <p className="text-subtle">Manage companion stats and rarities</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={startCreate} variant="default">
              <Plus className="h-4 w-4 mr-2" />
              Create Companion
            </Button>
            <Button onClick={seedCompanions} variant="outline">
              <Sparkles className="h-4 w-4 mr-2" />
              Seed Companions
            </Button>
            <Button onClick={loadCompanions} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Companions List */}
        <Card className="bg-card border-2 border-border">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">All Companions</CardTitle>
          </CardHeader>
          <CardContent>
            {companions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {companions.map((companion) => (
                  <Card
                    key={companion.id}
                    className={`bg-bg border-2 ${getRarityBgClass(companion.rarity)}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="text-3xl">{companion.icon || '🐾'}</div>
                          <div>
                            <div className="font-bold text-text">{companion.name}</div>
                            <div className={`text-xs font-bold px-2 py-0.5 rounded ${getRarityColorClass(companion.rarity)}`}>
                              {getRarityDisplayName(companion.rarity)} {companion.type}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-1 text-xs text-muted-foreground mb-3">
                        {companion.description && (
                          <div className="text-subtle italic mb-2">{companion.description}</div>
                        )}
                        {companion.atkBonus > 0 && <div>+{companion.atkBonus} ATK</div>}
                        {companion.defBonus > 0 && <div>+{companion.defBonus} DEF</div>}
                        {companion.hpBonus > 0 && <div>+{companion.hpBonus} HP</div>}
                        {companion.critBonus > 0 && <div>+{companion.critBonus}% CRIT</div>}
                        {companion.speedBonus > 0 && <div>+{companion.speedBonus} SPEED</div>}
                        {companion.xpBonus > 0 && <div>+{companion.xpBonus}% XP</div>}
                        {companion.goldBonus > 0 && <div>+{companion.goldBonus}% Gold</div>}
                        {companion.travelBonus > 0 && <div>+{companion.travelBonus} Travel</div>}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => startEdit(companion)}
                          variant="outline"
                          size="sm"
                          className="flex-1"
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          onClick={() => deleteCompanion(companion.id)}
                          variant="outline"
                          size="sm"
                          className="flex-1 text-destructive"
                          disabled={deleting === companion.id}
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          {deleting === companion.id ? 'Deleting...' : 'Delete'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-subtle">
                <p>No companions found. Click "Seed Companions" to create default companions.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create/Edit Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="bg-card border-2 border-border p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <CardTitle>{editing ? 'Edit Companion' : 'Create Companion'}</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Name</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Companion name"
                    />
                  </div>
                  <div>
                    <Label>Type</Label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-3 py-2 bg-bg border border-border rounded"
                    >
                      <option value="pet">Pet</option>
                      <option value="companion">Companion</option>
                      <option value="mount">Mount</option>
                    </select>
                  </div>
                  <div>
                    <Label>Rarity</Label>
                    <select
                      value={formData.rarity}
                      onChange={(e) => setFormData({ ...formData, rarity: e.target.value })}
                      className="w-full px-3 py-2 bg-bg border border-border rounded"
                    >
                      <option value="common">Common</option>
                      <option value="uncommon">Uncommon</option>
                      <option value="rare">Rare</option>
                      <option value="epic">Epic</option>
                      <option value="legendary">Legendary</option>
                    </select>
                  </div>
                  <div>
                    <Label>Icon (emoji)</Label>
                    <Input
                      value={formData.icon}
                      onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                      placeholder="🐾"
                    />
                  </div>
                </div>
                <div>
                  <Label>Description</Label>
                  <Input
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Companion description"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>ATK Bonus</Label>
                    <Input
                      type="number"
                      value={formData.atkBonus}
                      onChange={(e) => setFormData({ ...formData, atkBonus: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <Label>DEF Bonus</Label>
                    <Input
                      type="number"
                      value={formData.defBonus}
                      onChange={(e) => setFormData({ ...formData, defBonus: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <Label>HP Bonus</Label>
                    <Input
                      type="number"
                      value={formData.hpBonus}
                      onChange={(e) => setFormData({ ...formData, hpBonus: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <Label>CRIT Bonus</Label>
                    <Input
                      type="number"
                      value={formData.critBonus}
                      onChange={(e) => setFormData({ ...formData, critBonus: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <Label>SPEED Bonus</Label>
                    <Input
                      type="number"
                      value={formData.speedBonus}
                      onChange={(e) => setFormData({ ...formData, speedBonus: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <Label>XP Bonus %</Label>
                    <Input
                      type="number"
                      value={formData.xpBonus}
                      onChange={(e) => setFormData({ ...formData, xpBonus: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <Label>Gold Bonus %</Label>
                    <Input
                      type="number"
                      value={formData.goldBonus}
                      onChange={(e) => setFormData({ ...formData, goldBonus: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <Label>Travel Bonus</Label>
                    <Input
                      type="number"
                      value={formData.travelBonus}
                      onChange={(e) => setFormData({ ...formData, travelBonus: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={saveCompanion} className="flex-1" disabled={!formData.name}>
                    {editing ? 'Update' : 'Create'}
                  </Button>
                  <Button onClick={() => setShowForm(false)} variant="outline" className="flex-1">
                    Cancel
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

