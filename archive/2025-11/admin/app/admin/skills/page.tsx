/**
 * Admin Skills Page
 * /admin/skills - Manage skills catalog
 * v0.36.33 - Skills & Abilities v1
 */

'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Zap, Shield, Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { toast } from 'sonner';

interface Skill {
  id: string;
  name: string;
  type: 'active' | 'passive';
  description: string;
  power: number;
  cooldown: number | null;
  icon: string | null;
  scaling: any;
}

const TYPE_COLORS: Record<string, string> = {
  active: 'border-blue-400 bg-blue-50',
  passive: 'border-green-400 bg-green-50',
};

const TYPE_LABELS: Record<string, string> = {
  active: 'Active',
  passive: 'Passive',
};

export default function AdminSkillsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Skill>>({});

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
      // Fetch all skills from database
      const res = await fetch('/api/admin/skills');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setSkills(data.skills || []);
        }
      } else {
        // Fallback: try to seed first
        toast.info('Skills not found. Seeding...');
        await handleSeed();
      }
    } catch (error) {
      console.error('Error loading skills:', error);
      toast.error('Failed to load skills');
    } finally {
      setLoading(false);
    }
  }

  async function handleSeed() {
    setSeeding(true);
    try {
      const res = await fetch('/api/admin/skills/seed', {
        method: 'POST',
      });
      const data = await res.json();
      
      if (data.success) {
        toast.success('Skills seeded successfully');
        await loadSkills();
      } else {
        toast.error(data.message || 'Failed to seed skills');
      }
    } catch (error) {
      console.error('Error seeding skills:', error);
      toast.error('Failed to seed skills');
    } finally {
      setSeeding(false);
    }
  }

  async function handleUnlockSkill(userId: string, skillId: string) {
    try {
      const res = await fetch('/api/skills/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, skillId }),
      });
      const data = await res.json();
      
      if (data.success) {
        toast.success(`Unlocked ${skills.find(s => s.id === skillId)?.name} for user`);
      } else {
        toast.error(data.message || 'Failed to unlock skill');
      }
    } catch (error) {
      console.error('Error unlocking skill:', error);
      toast.error('Failed to unlock skill');
    }
  }

  function startEdit(skill: Skill) {
    setEditing(skill.id);
    setEditForm({
      name: skill.name,
      description: skill.description,
      power: skill.power,
      cooldown: skill.cooldown,
      icon: skill.icon,
    });
  }

  function cancelEdit() {
    setEditing(null);
    setEditForm({});
  }

  async function saveEdit(skillId: string) {
    try {
      const res = await fetch(`/api/admin/skills/${skillId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      
      if (data.success) {
        toast.success('Skill updated');
        await loadSkills();
        cancelEdit();
      } else {
        toast.error(data.message || 'Failed to update skill');
      }
    } catch (error) {
      console.error('Error updating skill:', error);
      toast.error('Failed to update skill');
    }
  }

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Admin - Skills Catalog</h1>
          <p className="text-muted-foreground">
            Manage the skills catalog and unlock skills for users
          </p>
        </div>
        <Button onClick={handleSeed} disabled={seeding}>
          {seeding ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Seeding...
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Seed Skills
            </>
          )}
        </Button>
      </div>

      {skills.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">No skills found</p>
            <Button onClick={handleSeed} disabled={seeding}>
              {seeding ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Seeding...
                </>
              ) : (
                'Seed MVP Skills'
              )}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {skills.map((skill) => {
            const typeColor = TYPE_COLORS[skill.type] || TYPE_COLORS.active;
            const isEditing = editing === skill.id;

            return (
              <Card key={skill.id} className={`${typeColor} border-2`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-3xl">{skill.icon || (skill.type === 'active' ? '⚔️' : '🛡️')}</span>
                        <div>
                          {isEditing ? (
                            <Input
                              value={editForm.name || ''}
                              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                              className="text-lg font-semibold"
                            />
                          ) : (
                            <CardTitle className="text-lg">{skill.name}</CardTitle>
                          )}
                          <p className="text-xs text-muted-foreground capitalize">
                            {skill.type} • Power: {skill.power}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`text-xs px-2 py-0.5 rounded ${typeColor}`}>
                          {TYPE_LABELS[skill.type]}
                        </span>
                        {skill.cooldown && (
                          <span className="text-xs px-2 py-0.5 rounded bg-gray-200">
                            CD: {skill.cooldown}
                          </span>
                        )}
                      </div>
                    </div>
                    {!isEditing && (
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEdit(skill)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {isEditing ? (
                    <>
                      <div className="space-y-2">
                        <label className="text-xs font-medium">Description</label>
                        <Input
                          value={editForm.description || ''}
                          onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-xs font-medium">Power</label>
                          <Input
                            type="number"
                            value={editForm.power || 0}
                            onChange={(e) => setEditForm({ ...editForm, power: parseInt(e.target.value) || 0 })}
                          />
                        </div>
                        {skill.type === 'active' && (
                          <div className="space-y-1">
                            <label className="text-xs font-medium">Cooldown</label>
                            <Input
                              type="number"
                              value={editForm.cooldown || 0}
                              onChange={(e) => setEditForm({ ...editForm, cooldown: parseInt(e.target.value) || null })}
                            />
                          </div>
                        )}
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium">Icon</label>
                        <Input
                          value={editForm.icon || ''}
                          onChange={(e) => setEditForm({ ...editForm, icon: e.target.value })}
                          placeholder="⚔️"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => saveEdit(skill.id)}
                          className="flex-1"
                        >
                          <Save className="h-4 w-4 mr-2" />
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={cancelEdit}
                          className="flex-1"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-sm">{skill.description}</p>
                      <div className="pt-2 border-t">
                        <p className="text-xs text-muted-foreground mb-2">Admin Actions:</p>
                        <div className="flex gap-2">
                          <Input
                            placeholder="User ID"
                            className="text-xs flex-1"
                            id={`unlock-${skill.id}`}
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const input = document.getElementById(`unlock-${skill.id}`) as HTMLInputElement;
                              const userId = input?.value;
                              if (userId) {
                                handleUnlockSkill(userId, skill.id);
                                input.value = '';
                              } else {
                                toast.error('Please enter a user ID');
                              }
                            }}
                          >
                            Unlock
                          </Button>
                        </div>
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
  );
}

