/**
 * Admin Enemies Page
 * CRUD for enemy management
 * v0.36.0 - Full Fighting System MVP
 */

"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, Edit, Trash2, Swords } from "lucide-react";
import { apiFetch } from "@/lib/apiBase";
import { useFightStore } from "@/hooks/useFightStore";

interface Enemy {
  id: string;
  name: string;
  hp: number;
  str: number;
  def: number;
  speed: number;
  rarity: string;
  xpReward: number;
  goldReward: number;
  sprite?: string | null;
}

export default function AdminEnemiesPage() {
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { runFight } = useFightStore();

  const [formData, setFormData] = useState({
    name: "",
    hp: 50,
    str: 10,
    def: 5,
    speed: 5,
    rarity: "common",
    xpReward: 10,
    goldReward: 5,
    sprite: "",
  });

  useEffect(() => {
    loadEnemies();
  }, []);

  const loadEnemies = async () => {
    try {
      const res = await apiFetch("/api/fight/enemies?limit=100");
      if ((res as any).ok && (res as any).data) {
        // Get all enemies (would need a proper admin endpoint)
        setEnemies((res as any).data.enemies || []);
      }
    } catch (error) {
      console.error("[AdminEnemies] Failed to load:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePreviewFight = async (enemyId: string) => {
    // Preview fight with a test hero
    alert("Preview fight feature - would simulate fight with test hero");
  };

  const handleAddRandom = () => {
    const randomEnemy = {
      name: `Random Enemy ${Math.floor(Math.random() * 1000)}`,
      hp: Math.floor(Math.random() * 100) + 20,
      str: Math.floor(Math.random() * 20) + 5,
      def: Math.floor(Math.random() * 15) + 2,
      speed: Math.floor(Math.random() * 8) + 3,
      rarity: ["common", "uncommon", "rare", "epic", "legendary"][
        Math.floor(Math.random() * 5)
      ],
      xpReward: Math.floor(Math.random() * 50) + 10,
      goldReward: Math.floor(Math.random() * 30) + 5,
      sprite: null,
    };
    setFormData(randomEnemy);
    setShowForm(true);
    setEditingId(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Enemy Management</h1>
          <p className="text-muted-foreground">Manage combat enemies</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleAddRandom} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Random Enemy
          </Button>
          <Button onClick={() => { setShowForm(!showForm); setEditingId(null); setFormData({ name: "", hp: 50, str: 10, def: 5, speed: 5, rarity: "common", xpReward: 10, goldReward: 5, sprite: "" }); }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Enemy
          </Button>
        </div>
      </div>

      {showForm && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{editingId ? "Edit Enemy" : "Create Enemy"}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">HP</label>
                <Input
                  type="number"
                  value={formData.hp}
                  onChange={(e) => setFormData({ ...formData, hp: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">STR</label>
                <Input
                  type="number"
                  value={formData.str}
                  onChange={(e) => setFormData({ ...formData, str: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">DEF</label>
                <Input
                  type="number"
                  value={formData.def}
                  onChange={(e) => setFormData({ ...formData, def: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Speed</label>
                <Input
                  type="number"
                  value={formData.speed}
                  onChange={(e) => setFormData({ ...formData, speed: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Rarity</label>
                <select
                  className="w-full px-3 py-2 border rounded-md"
                  value={formData.rarity}
                  onChange={(e) => setFormData({ ...formData, rarity: e.target.value })}
                >
                  <option value="common">Common</option>
                  <option value="uncommon">Uncommon</option>
                  <option value="rare">Rare</option>
                  <option value="epic">Epic</option>
                  <option value="legendary">Legendary</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">XP Reward</label>
                <Input
                  type="number"
                  value={formData.xpReward}
                  onChange={(e) => setFormData({ ...formData, xpReward: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Gold Reward</label>
                <Input
                  type="number"
                  value={formData.goldReward}
                  onChange={(e) => setFormData({ ...formData, goldReward: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button onClick={() => { /* Save logic */ alert("Save functionality - would call API"); setShowForm(false); }}>
                Save
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Enemies ({enemies.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Name</th>
                  <th className="text-left py-2">HP</th>
                  <th className="text-left py-2">STR</th>
                  <th className="text-left py-2">DEF</th>
                  <th className="text-left py-2">SPD</th>
                  <th className="text-left py-2">Rarity</th>
                  <th className="text-left py-2">XP</th>
                  <th className="text-left py-2">Gold</th>
                  <th className="text-left py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {enemies.map((enemy) => (
                  <tr key={enemy.id} className="border-b">
                    <td className="py-2 font-medium">{enemy.name}</td>
                    <td className="py-2">{enemy.hp}</td>
                    <td className="py-2">{enemy.str}</td>
                    <td className="py-2">{enemy.def}</td>
                    <td className="py-2">{enemy.speed}</td>
                    <td className="py-2">
                      <span className="px-2 py-1 rounded text-xs bg-muted">
                        {enemy.rarity}
                      </span>
                    </td>
                    <td className="py-2">{enemy.xpReward}</td>
                    <td className="py-2">{enemy.goldReward}</td>
                    <td className="py-2">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handlePreviewFight(enemy.id)}
                        >
                          <Swords className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setFormData({ ...enemy, sprite: enemy.sprite || "" });
                            setEditingId(enemy.id);
                            setShowForm(true);
                          }}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => alert("Delete - would call API")}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

