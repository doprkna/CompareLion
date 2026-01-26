/**
 * Admin Missions Page
 * CRUD for mission management
 * v0.36.36 - Missions & Quests 1.0
 */

"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, Edit, Trash2, Target } from "lucide-react";
import { apiFetch } from "@/lib/apiBase";
import { toast } from "sonner";
import { MissionType, ObjectiveType, getMissionTypeDisplayName, getObjectiveTypeDisplayName } from "@/lib/missions/types";

interface Mission {
  id: string;
  type: MissionType;
  objectiveType: ObjectiveType;
  targetValue: number;
  title: string;
  description: string;
  reward: {
    xp?: number;
    gold?: number;
    diamonds?: number;
    battlepassXP?: number;
    items?: Array<{ itemId: string; quantity: number }>;
  };
  isActive: boolean;
  isRepeatable: boolean;
  sortOrder: number;
  category?: string | null;
  icon?: string | null;
  questChainId?: string | null;
  questStep?: number | null;
  prerequisiteMissionId?: string | null;
}

export default function AdminMissionsPage() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    type: MissionType.DAILY,
    objectiveType: ObjectiveType.ANSWER_QUESTIONS,
    targetValue: 5,
    title: "",
    description: "",
    reward: {
      xp: 50,
      gold: 25,
      diamonds: 0,
      battlepassXP: 10,
      items: [] as Array<{ itemId: string; quantity: number }>,
    },
    isActive: true,
    isRepeatable: true,
    sortOrder: 0,
    category: "",
    icon: "",
    questChainId: null as string | null,
    questStep: null as number | null,
    prerequisiteMissionId: null as string | null,
  });

  useEffect(() => {
    loadMissions();
  }, []);

  const loadMissions = async () => {
    try {
      const res = await apiFetch("/api/admin/missions");
      if ((res as any).ok && (res as any).data) {
        setMissions((res as any).data.missions || []);
      }
    } catch (error) {
      console.error("[AdminMissions] Failed to load:", error);
      toast.error("Failed to load missions");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (editingId) {
        // Update
        const res = await apiFetch(`/api/admin/missions/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        
        if ((res as any).ok) {
          toast.success("Mission updated");
          setShowForm(false);
          loadMissions();
        } else {
          throw new Error((res as any).error || "Update failed");
        }
      } else {
        // Create
        const res = await apiFetch("/api/admin/missions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        
        if ((res as any).ok) {
          toast.success("Mission created");
          setShowForm(false);
          setFormData({
            type: MissionType.DAILY,
            objectiveType: ObjectiveType.ANSWER_QUESTIONS,
            targetValue: 5,
            title: "",
            description: "",
            reward: { xp: 50, gold: 25, diamonds: 0, battlepassXP: 10, items: [] },
            isActive: true,
            isRepeatable: true,
            sortOrder: 0,
            category: "",
            icon: "",
            questChainId: null,
            questStep: null,
            prerequisiteMissionId: null,
          });
          loadMissions();
        } else {
          throw new Error((res as any).error || "Create failed");
        }
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to save mission");
    }
  };

  const handleDelete = async (missionId: string) => {
    if (!confirm("Are you sure you want to delete this mission?")) return;
    
    try {
      const res = await apiFetch(`/api/admin/missions/${missionId}`, {
        method: "DELETE",
      });
      
      if ((res as any).ok) {
        toast.success("Mission deleted");
        loadMissions();
      } else {
        throw new Error((res as any).error || "Delete failed");
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete mission");
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
          <h1 className="text-3xl font-bold mb-2">Mission Management</h1>
          <p className="text-muted-foreground">Manage daily, weekly, and quest missions</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => { 
            setShowForm(!showForm); 
            setEditingId(null); 
            setFormData({
              type: MissionType.DAILY,
              objectiveType: ObjectiveType.ANSWER_QUESTIONS,
              targetValue: 5,
              title: "",
              description: "",
              reward: { xp: 50, gold: 25, diamonds: 0, battlepassXP: 10, items: [] },
              isActive: true,
              isRepeatable: true,
              sortOrder: 0,
              category: "",
              icon: "",
              questChainId: null,
              questStep: null,
              prerequisiteMissionId: null,
            });
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Mission
          </Button>
        </div>
      </div>

      {showForm && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{editingId ? "Edit Mission" : "Create Mission"}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Type</label>
                <select
                  className="w-full px-3 py-2 border rounded-md"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as MissionType })}
                >
                  {Object.values(MissionType).map((t) => (
                    <option key={t} value={t}>{getMissionTypeDisplayName(t)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Objective Type</label>
                <select
                  className="w-full px-3 py-2 border rounded-md"
                  value={formData.objectiveType}
                  onChange={(e) => setFormData({ ...formData, objectiveType: e.target.value as ObjectiveType })}
                >
                  {Object.values(ObjectiveType).map((ot) => (
                    <option key={ot} value={ot}>{getObjectiveTypeDisplayName(ot)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Target Value</label>
                <Input
                  type="number"
                  value={formData.targetValue}
                  onChange={(e) => setFormData({ ...formData, targetValue: parseInt(e.target.value) || 1 })}
                />
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium mb-1 block">Title</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium mb-1 block">Description</label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Reward XP</label>
                <Input
                  type="number"
                  value={formData.reward.xp || 0}
                  onChange={(e) => setFormData({
                    ...formData,
                    reward: { ...formData.reward, xp: parseInt(e.target.value) || 0 },
                  })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Reward Gold</label>
                <Input
                  type="number"
                  value={formData.reward.gold || 0}
                  onChange={(e) => setFormData({
                    ...formData,
                    reward: { ...formData.reward, gold: parseInt(e.target.value) || 0 },
                  })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Battlepass XP</label>
                <Input
                  type="number"
                  value={formData.reward.battlepassXP || 0}
                  onChange={(e) => setFormData({
                    ...formData,
                    reward: { ...formData.reward, battlepassXP: parseInt(e.target.value) || 0 },
                  })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Sort Order</label>
                <Input
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Category</label>
                <Input
                  value={formData.category || ""}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Icon</label>
                <Input
                  value={formData.icon || ""}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  placeholder="🎯"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
                <label className="text-sm font-medium">Active</label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isRepeatable}
                  onChange={(e) => setFormData({ ...formData, isRepeatable: e.target.checked })}
                />
                <label className="text-sm font-medium">Repeatable</label>
              </div>
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
          <CardTitle>Missions ({missions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Icon</th>
                  <th className="text-left py-2">Title</th>
                  <th className="text-left py-2">Type</th>
                  <th className="text-left py-2">Objective</th>
                  <th className="text-left py-2">Target</th>
                  <th className="text-left py-2">Rewards</th>
                  <th className="text-left py-2">Status</th>
                  <th className="text-left py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {missions.map((mission) => (
                  <tr key={mission.id} className="border-b">
                    <td className="py-2">{mission.icon || '🎯'}</td>
                    <td className="py-2 font-medium">{mission.title}</td>
                    <td className="py-2">
                      <span className="px-2 py-1 rounded text-xs bg-muted">
                        {getMissionTypeDisplayName(mission.type)}
                      </span>
                    </td>
                    <td className="py-2 text-xs">
                      {getObjectiveTypeDisplayName(mission.objectiveType)}
                    </td>
                    <td className="py-2">{mission.targetValue}</td>
                    <td className="py-2 text-xs">
                      {mission.reward.xp && `+${mission.reward.xp} XP `}
                      {mission.reward.gold && `+${mission.reward.gold} Gold `}
                      {mission.reward.battlepassXP && `+${mission.reward.battlepassXP} BP`}
                    </td>
                    <td className="py-2">
                      {mission.isActive ? (
                        <span className="px-2 py-1 rounded text-xs bg-green-900/30 text-green-400">Active</span>
                      ) : (
                        <span className="px-2 py-1 rounded text-xs bg-muted">Inactive</span>
                      )}
                    </td>
                    <td className="py-2">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setFormData({
                              type: mission.type,
                              objectiveType: mission.objectiveType,
                              targetValue: mission.targetValue,
                              title: mission.title,
                              description: mission.description,
                              reward: mission.reward,
                              isActive: mission.isActive,
                              isRepeatable: mission.isRepeatable,
                              sortOrder: mission.sortOrder,
                              category: mission.category || "",
                              icon: mission.icon || "",
                              questChainId: mission.questChainId,
                              questStep: mission.questStep,
                              prerequisiteMissionId: mission.prerequisiteMissionId,
                            });
                            setEditingId(mission.id);
                            setShowForm(true);
                          }}
                          title="Edit"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(mission.id)}
                          title="Delete"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {missions.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-muted-foreground">
                      No missions found. Create one to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

