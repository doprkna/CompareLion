/**
 * Admin Enemies Page
 * CRUD for enemy management
 * v0.36.35 - Combat Engine 2.0
 */

"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, Edit, Trash2, Swords, Play, BarChart3, Calculator } from "lucide-react";
import { apiFetch } from "@/lib/apiBase";
import { toast } from "sonner";
import { EnemyTier, EnemyRegion, StatPreset, STAT_PRESETS, REGION_MULTIPLIERS, TIER_MULTIPLIERS } from "@/lib/rpg/enemy/types";
import { previewStatCalculation } from "@/lib/rpg/enemy/statCalculator";

interface Enemy {
  id: string;
  name: string;
  level: number;
  power: number;
  defense: number;
  maxHp: number;
  rarity: 'common' | 'elite' | 'boss';
  region?: EnemyRegion;
  statPreset?: StatPreset;
  baseStats?: {
    hp: number;
    atk: number;
    def: number;
    speed: number;
    abilities?: string[];
  };
  lootTable: {
    common?: string[];
    rare?: string[];
    epic?: string[];
    gold: { min: number; max: number };
  };
  icon?: string | null;
}

export default function AdminEnemiesPage() {
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    level: 1,
    power: 10,
    defense: 5,
    maxHp: 50,
    rarity: "common" as 'common' | 'elite' | 'boss',
    region: EnemyRegion.PLAINS,
    statPreset: StatPreset.BALANCED,
    baseStats: {
      hp: 50,
      atk: 10,
      def: 8,
      speed: 7,
      abilities: [] as string[],
    },
    lootTable: {
      common: [] as string[],
      rare: [] as string[],
      epic: [] as string[],
      gold: { min: 5, max: 15 },
    },
    icon: "",
  });
  
  const [showStatPreview, setShowStatPreview] = useState(false);

  useEffect(() => {
    loadEnemies();
  }, []);

  const loadEnemies = async () => {
    try {
      const res = await apiFetch("/api/admin/enemies");
      if ((res as any).ok && (res as any).data) {
        setEnemies((res as any).data.enemies || []);
      }
    } catch (error) {
      console.error("[AdminEnemies] Failed to load:", error);
      toast.error("Failed to load enemies");
    } finally {
      setLoading(false);
    }
  };

  const handleTestFight = async (enemyId: string) => {
    try {
      const res = await apiFetch("/api/admin/enemies/test-fight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enemyId }),
      });
      
      if ((res as any).ok) {
        const result = (res as any).data.fightResult;
        toast.success(`${result.result.toUpperCase()} in ${result.rounds} rounds`);
      } else {
        throw new Error((res as any).error || "Test fight failed");
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to test fight");
    }
  };

  const handleSimulate = async (enemyId: string) => {
    try {
      const res = await apiFetch("/api/admin/enemies/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enemyId, count: 1000 }),
      });
      
      if ((res as any).ok) {
        const stats = (res as any).data;
        toast.success(`Win rate: ${stats.winRate.toFixed(1)}% (${stats.results.wins}/${stats.simulations} wins)`);
      } else {
        throw new Error((res as any).error || "Simulation failed");
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to simulate");
    }
  };

  const handleSave = async () => {
    try {
      if (editingId) {
        // Update
        const res = await apiFetch(`/api/admin/enemies/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        
        if ((res as any).ok) {
          toast.success("Enemy updated");
          setShowForm(false);
          loadEnemies();
        } else {
          throw new Error((res as any).error || "Update failed");
        }
      } else {
        // Create
        const res = await apiFetch("/api/admin/enemies", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        
        if ((res as any).ok) {
          toast.success("Enemy created");
          setShowForm(false);
          setFormData({
            name: "",
            level: 1,
            power: 10,
            defense: 5,
            maxHp: 50,
            rarity: "common",
            region: EnemyRegion.PLAINS,
            statPreset: StatPreset.BALANCED,
            baseStats: { hp: 50, atk: 10, def: 8, speed: 7, abilities: [] },
            lootTable: { common: [], rare: [], epic: [], gold: { min: 5, max: 15 } },
            icon: "",
          });
          loadEnemies();
        } else {
          throw new Error((res as any).error || "Create failed");
        }
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to save enemy");
    }
  };

  const handleDelete = async (enemyId: string) => {
    if (!confirm("Are you sure you want to delete this enemy?")) return;
    
    try {
      const res = await apiFetch(`/api/admin/enemies/${enemyId}`, {
        method: "DELETE",
      });
      
      if ((res as any).ok) {
        toast.success("Enemy deleted");
        loadEnemies();
      } else {
        throw new Error((res as any).error || "Delete failed");
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete enemy");
    }
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
          <Button onClick={() => { 
            setShowForm(!showForm); 
            setEditingId(null); 
            setFormData({
              name: "",
              level: 1,
              power: 10,
              defense: 5,
              maxHp: 50,
              rarity: "common",
              region: EnemyRegion.PLAINS,
              statPreset: StatPreset.BALANCED,
              baseStats: { hp: 50, atk: 10, def: 8, speed: 7, abilities: [] },
              lootTable: { common: [], rare: [], epic: [], gold: { min: 5, max: 15 } },
              icon: "",
            });
          }}>
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
                <label className="text-sm font-medium mb-1 block">Level</label>
                <Input
                  type="number"
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) || 1 })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Power (Attack)</label>
                <Input
                  type="number"
                  value={formData.power}
                  onChange={(e) => setFormData({ ...formData, power: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Defense</label>
                <Input
                  type="number"
                  value={formData.defense}
                  onChange={(e) => setFormData({ ...formData, defense: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Max HP</label>
                <Input
                  type="number"
                  value={formData.maxHp}
                  onChange={(e) => setFormData({ ...formData, maxHp: parseInt(e.target.value) || 1 })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Rarity</label>
                <select
                  className="w-full px-3 py-2 border rounded-md"
                  value={formData.rarity}
                  onChange={(e) => setFormData({ ...formData, rarity: e.target.value as 'common' | 'elite' | 'boss' })}
                >
                  <option value="common">Common</option>
                  <option value="elite">Elite</option>
                  <option value="boss">Boss</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Region</label>
                <select
                  className="w-full px-3 py-2 border rounded-md"
                  value={formData.region}
                  onChange={(e) => setFormData({ ...formData, region: e.target.value as EnemyRegion })}
                >
                  {Object.values(EnemyRegion).map((r) => (
                    <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Stat Preset</label>
                <select
                  className="w-full px-3 py-2 border rounded-md"
                  value={formData.statPreset}
                  onChange={(e) => {
                    const preset = e.target.value as StatPreset;
                    const presetTemplate = STAT_PRESETS[preset];
                    setFormData({
                      ...formData,
                      statPreset: preset,
                      baseStats: presetTemplate.baseStats,
                    });
                  }}
                >
                  {Object.values(StatPreset).map((p) => (
                    <option key={p} value={p}>{STAT_PRESETS[p].displayName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Icon (emoji)</label>
                <Input
                  value={formData.icon || ""}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  placeholder="👹"
                />
              </div>
            </div>
            
            {/* Base Stats Editor */}
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium block">Base Stats (from preset)</label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowStatPreview(!showStatPreview)}
                >
                  <Calculator className="h-4 w-4 mr-2" />
                  {showStatPreview ? "Hide" : "Show"} Preview
                </Button>
              </div>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">HP</label>
                  <Input
                    type="number"
                    value={formData.baseStats.hp}
                    onChange={(e) => setFormData({
                      ...formData,
                      baseStats: { ...formData.baseStats, hp: parseInt(e.target.value) || 1 },
                    })}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Attack</label>
                  <Input
                    type="number"
                    value={formData.baseStats.atk}
                    onChange={(e) => setFormData({
                      ...formData,
                      baseStats: { ...formData.baseStats, atk: parseInt(e.target.value) || 1 },
                    })}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Defense</label>
                  <Input
                    type="number"
                    value={formData.baseStats.def}
                    onChange={(e) => setFormData({
                      ...formData,
                      baseStats: { ...formData.baseStats, def: parseInt(e.target.value) || 0 },
                    })}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Speed</label>
                  <Input
                    type="number"
                    value={formData.baseStats.speed}
                    onChange={(e) => setFormData({
                      ...formData,
                      baseStats: { ...formData.baseStats, speed: parseInt(e.target.value) || 1 },
                    })}
                  />
                </div>
              </div>
            </div>
            
            {/* Stat Calculation Preview */}
            {showStatPreview && (
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <h4 className="text-sm font-semibold mb-2">Stat Calculation Preview</h4>
                {(() => {
                  const preview = previewStatCalculation(
                    formData.baseStats,
                    formData.rarity as EnemyTier,
                    formData.region
                  );
                  const regionMult = REGION_MULTIPLIERS[formData.region];
                  const tierMult = TIER_MULTIPLIERS[formData.rarity as EnemyTier];
                  
                  return (
                    <div className="space-y-2 text-sm">
                      <div className="grid grid-cols-4 gap-2">
                        <div className="font-medium">Stat</div>
                        <div className="font-medium">Base</div>
                        <div className="font-medium">After Region</div>
                        <div className="font-medium">Final (×{tierMult.toFixed(1)})</div>
                      </div>
                      {(['hp', 'atk', 'def', 'speed'] as const).map((stat) => (
                        <div key={stat} className="grid grid-cols-4 gap-2">
                          <div className="text-muted-foreground">{stat.toUpperCase()}</div>
                          <div>{preview.base[stat]}</div>
                          <div>
                            {preview.afterRegion[stat]}
                            <span className="text-xs text-muted-foreground ml-1">
                              ({regionMult[`${stat}Mult` as keyof typeof regionMult].toFixed(2)}×)
                            </span>
                          </div>
                          <div className="font-semibold">{preview.final[stat]}</div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            )}
            
            <div className="mt-4 space-y-2">
              <label className="text-sm font-medium block">Loot Table - Gold Range</label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Min Gold</label>
                  <Input
                    type="number"
                    value={formData.lootTable.gold.min}
                    onChange={(e) => setFormData({
                      ...formData,
                      lootTable: {
                        ...formData.lootTable,
                        gold: { ...formData.lootTable.gold, min: parseInt(e.target.value) || 0 },
                      },
                    })}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Max Gold</label>
                  <Input
                    type="number"
                    value={formData.lootTable.gold.max}
                    onChange={(e) => setFormData({
                      ...formData,
                      lootTable: {
                        ...formData.lootTable,
                        gold: { ...formData.lootTable.gold, max: parseInt(e.target.value) || 0 },
                      },
                    })}
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Item drops configured via lootTable JSON (common/rare/epic arrays of itemIds)
              </p>
            </div>
            
            <div className="mt-4 flex gap-2">
              <Button onClick={handleSave}>
                {editingId ? "Update" : "Create"}
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
                  <th className="text-left py-2">Level</th>
                  <th className="text-left py-2">Power</th>
                  <th className="text-left py-2">Defense</th>
                  <th className="text-left py-2">Max HP</th>
                  <th className="text-left py-2">Rarity</th>
                  <th className="text-left py-2">Region</th>
                  <th className="text-left py-2">Preset</th>
                  <th className="text-left py-2">Gold Range</th>
                  <th className="text-left py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {enemies.map((enemy) => (
                  <tr key={enemy.id} className="border-b">
                    <td className="py-2 font-medium">{enemy.icon || '👹'} {enemy.name}</td>
                    <td className="py-2">{enemy.level}</td>
                    <td className="py-2">{enemy.power}</td>
                    <td className="py-2">{enemy.defense}</td>
                    <td className="py-2">{enemy.maxHp}</td>
                    <td className="py-2">
                      <span className="px-2 py-1 rounded text-xs bg-muted">
                        {enemy.rarity}
                      </span>
                    </td>
                    <td className="py-2 text-xs">
                      {enemy.region ? enemy.region.charAt(0).toUpperCase() + enemy.region.slice(1) : '-'}
                    </td>
                    <td className="py-2 text-xs">
                      {enemy.statPreset ? STAT_PRESETS[enemy.statPreset]?.displayName || enemy.statPreset : '-'}
                    </td>
                    <td className="py-2 text-xs">
                      {enemy.lootTable.gold.min}-{enemy.lootTable.gold.max}
                    </td>
                    <td className="py-2">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleTestFight(enemy.id)}
                          title="Test Fight"
                        >
                          <Play className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSimulate(enemy.id)}
                          title="Simulate 1000 Fights"
                        >
                          <BarChart3 className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setFormData({
                              name: enemy.name,
                              level: enemy.level,
                              power: enemy.power,
                              defense: enemy.defense,
                              maxHp: enemy.maxHp,
                              rarity: enemy.rarity,
                              region: enemy.region || EnemyRegion.PLAINS,
                              statPreset: enemy.statPreset || StatPreset.BALANCED,
                              baseStats: enemy.baseStats || { hp: 50, atk: 10, def: 8, speed: 7, abilities: [] },
                              lootTable: enemy.lootTable,
                              icon: enemy.icon || "",
                            });
                            setEditingId(enemy.id);
                            setShowForm(true);
                          }}
                          title="Edit"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(enemy.id)}
                          title="Delete"
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

