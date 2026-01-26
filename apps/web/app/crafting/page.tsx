/**
 * Crafting Table Page
 * Materials & Crafting UI
 * v0.36.40 - Materials & Crafting 1.0
 */

'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Hammer, Package, CheckCircle2, XCircle } from 'lucide-react';
import { apiFetch } from '@/lib/apiBase';
import { toast } from 'sonner';
import { MaterialCategory, getMaterialCategoryDisplayName, getRarityDisplayName } from '@/lib/crafting/types';
import { getRarityColorClass } from '@/lib/rpg/rarity';

interface Material {
  id: string;
  materialId: string;
  quantity: number;
  material: {
    id: string;
    name: string;
    description?: string | null;
    rarity: string;
    category: string;
    icon?: string | null;
    emoji?: string | null;
  };
}

interface Recipe {
  id: string;
  name: string;
  description?: string | null;
  outputItemId: string;
  ingredients: Array<{
    materialId: string;
    quantity: number;
    userQuantity?: number;
    hasEnough?: boolean;
  }>;
  craftTime: number;
  unlockLevel?: number | null;
  goldCost?: number | null;
  outputItem: {
    id: string;
    name: string;
    rarity: string;
    type: string;
    emoji?: string | null;
    icon?: string | null;
  };
  canCraft?: boolean;
}

export default function CraftingPage() {
  const { data: session } = useSession();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [crafting, setCrafting] = useState<string | null>(null);

  useEffect(() => {
    if (session) {
      loadData();
    }
  }, [session]);

  async function loadData() {
    setLoading(true);
    try {
      const [materialsRes, recipesRes] = await Promise.all([
        apiFetch('/api/materials'),
        apiFetch('/api/crafting/recipes?includeUserMaterials=true'),
      ]);

      if ((materialsRes as any).ok) {
        setMaterials((materialsRes as any).data.materials);
      }

      if ((recipesRes as any).ok) {
        setRecipes((recipesRes as any).data.recipes);
      }
    } catch (error) {
      console.error('Failed to load crafting data', error);
      toast.error('Failed to load crafting data');
    } finally {
      setLoading(false);
    }
  }

  async function handleCraft(recipeId: string) {
    if (crafting) return;

    setCrafting(recipeId);
    try {
      const res = await apiFetch('/api/crafting/craft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipeId, quantity: 1 }),
      });

      if ((res as any).ok) {
        toast.success('Item crafted successfully!');
        loadData(); // Reload materials and recipes
      } else {
        throw new Error((res as any).error || 'Crafting failed');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to craft item');
    } finally {
      setCrafting(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Group materials by category
  const materialsByCategory = materials.reduce((acc, mat) => {
    const category = mat.material.category as MaterialCategory;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(mat);
    return acc;
  }, {} as Record<MaterialCategory, Material[]>);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Hammer className="w-8 h-8" />
          Crafting Table
        </h1>
        <p className="text-gray-400">Craft items using materials from combat</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Materials Inventory */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Materials ({materials.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {materials.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">
                  No materials yet. Defeat enemies to collect materials!
                </p>
              ) : (
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {Object.entries(materialsByCategory).map(([category, mats]) => (
                    <div key={category}>
                      <h3 className="text-sm font-semibold text-gray-400 mb-2 uppercase">
                        {getMaterialCategoryDisplayName(category as MaterialCategory)}
                      </h3>
                      <div className="space-y-2">
                        {mats.map((mat) => (
                          <div
                            key={mat.id}
                            className={`p-2 rounded border ${getRarityColorClass(mat.material.rarity)}`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-lg">
                                  {mat.material.emoji || mat.material.icon || '📦'}
                                </span>
                                <div>
                                  <div className="text-sm font-medium">{mat.material.name}</div>
                                  <div className="text-xs text-gray-400">
                                    {getRarityDisplayName(mat.material.rarity as any)}
                                  </div>
                                </div>
                              </div>
                              <div className="text-sm font-bold">x{mat.quantity}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recipes */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Recipes ({recipes.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {recipes.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">
                  No recipes available yet.
                </p>
              ) : (
                <div className="space-y-4">
                  {recipes.map((recipe) => {
                    const isCrafting = crafting === recipe.id;
                    const canCraft = recipe.canCraft === true;

                    return (
                      <Card key={recipe.id} className="bg-gray-800 border-gray-700">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-2xl">
                                  {recipe.outputItem.emoji || recipe.outputItem.icon || '📦'}
                                </span>
                                <h3 className="font-bold text-lg">{recipe.name}</h3>
                                {canCraft ? (
                                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                                ) : (
                                  <XCircle className="w-5 h-5 text-gray-500" />
                                )}
                              </div>
                              {recipe.description && (
                                <p className="text-sm text-gray-400 mb-2">{recipe.description}</p>
                              )}
                              <div className="text-sm text-gray-400">
                                Output: <span className="font-medium">{recipe.outputItem.name}</span>
                                {' • '}
                                <span className={`${getRarityColorClass(recipe.outputItem.rarity)} px-2 py-0.5 rounded text-xs`}>
                                  {recipe.outputItem.rarity}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Ingredients */}
                          <div className="mb-4">
                            <div className="text-xs font-semibold text-gray-400 mb-2">Ingredients:</div>
                            <div className="grid grid-cols-2 gap-2">
                              {recipe.ingredients.map((ing, idx) => {
                                const material = materials.find(m => m.materialId === ing.materialId);
                                const hasEnough = ing.hasEnough !== false;
                                
                                return (
                                  <div
                                    key={idx}
                                    className={`p-2 rounded text-sm ${
                                      hasEnough ? 'bg-gray-700' : 'bg-red-900/20 border border-red-700'
                                    }`}
                                  >
                                    <div className="flex items-center justify-between">
                                      <span>
                                        {material?.material.emoji || material?.material.icon || '📦'}{' '}
                                        {material?.material.name || 'Unknown'}
                                      </span>
                                      <span className={hasEnough ? '' : 'text-red-400'}>
                                        {ing.userQuantity || 0} / {ing.quantity}
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Recipe Info */}
                          <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
                            <div>
                              {recipe.unlockLevel && (
                                <span>Level {recipe.unlockLevel} required</span>
                              )}
                              {recipe.goldCost && recipe.goldCost > 0 && (
                                <span className="ml-2">🪙 {recipe.goldCost} gold</span>
                              )}
                            </div>
                            {recipe.craftTime > 0 && (
                              <span>⏱️ {recipe.craftTime}s</span>
                            )}
                          </div>

                          {/* Craft Button */}
                          <Button
                            onClick={() => handleCraft(recipe.id)}
                            disabled={!canCraft || isCrafting}
                            className={`w-full ${
                              canCraft
                                ? 'bg-green-600 hover:bg-green-700'
                                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                            }`}
                          >
                            {isCrafting ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Crafting...
                              </>
                            ) : canCraft ? (
                              'Craft'
                            ) : (
                              'Insufficient Materials'
                            )}
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

