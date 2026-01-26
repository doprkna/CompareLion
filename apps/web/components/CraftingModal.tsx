'use client';

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { apiFetch } from "@/lib/apiBase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Hammer, Sparkles, AlertTriangle } from "lucide-react";
import { useRewardToast } from '@parel/core/hooks/useRewardToast"; // v0.26.9
import { useCombatPreferences } from '@parel/core/hooks/useCombatPreferences"; // v0.26.13
import { useSfx } from '@parel/core/hooks/useSfx"; // v0.26.13

interface CraftingModalProps {
  show: boolean;
  onClose: () => void;
  onCraftComplete?: () => void;
}

export default function CraftingModal({ show, onClose, onCraftComplete }: CraftingModalProps) {
  const { pushToast } = useRewardToast(); // v0.26.9
  const { preferences } = useCombatPreferences(); // v0.26.13
  const { play, vibrate } = useSfx(preferences.soundEnabled, preferences.hapticsEnabled); // v0.26.13
  const [recipes, setRecipes] = useState<any[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null);
  const [crafting, setCrafting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (show) {
      loadRecipes();
      setResult(null);
    }
  }, [show]);

  async function loadRecipes() {
    setLoading(true);
    const res = await apiFetch("/api/crafting/recipes");
    if ((res as any).ok && (res as any).data) {
      setRecipes((res as any).data.recipes || []);
    }
    setLoading(false);
  }

  async function performCraft() {
    if (!selectedRecipe) return;

    setCrafting(true);
    const res = await apiFetch("/api/crafting/perform", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipeId: selectedRecipe.id }),
    });

    if ((res as any).ok && (res as any).data?.result) {
      const craftResult = (res as any).data.result;
      setResult(craftResult);
      
      if (craftResult.success) {
        // v0.26.9 - Use unified toast system
        pushToast({
          type: 'craft',
          message: `⚒️ Crafted ${craftResult.outputItem?.name || 'item'} successfully!`,
        });
        // Craft success sound (v0.26.13)
        play('craft', 0.4);
        vibrate([30, 20, 30]);
      } else {
        pushToast({
          type: 'error',
          message: 'Crafting failed - materials lost!',
        });
      }

      if (onCraftComplete) onCraftComplete();
      loadRecipes(); // Refresh available recipes
    } else {
      pushToast({
        type: 'error',
        message: (res as any).error || "Crafting failed",
      });
    }
    setCrafting(false);
  }

  const rarityColors: Record<string, string> = {
    common: "border-zinc-500 text-zinc-300",
    uncommon: "border-green-500 text-green-300",
    rare: "border-blue-500 text-blue-300",
    epic: "border-purple-500 text-purple-300",
    legendary: "border-yellow-500 text-yellow-300",
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-4xl max-h-[90vh] overflow-y-auto"
          >
            <Card className="bg-card border-accent text-text">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <Hammer className="h-6 w-6 text-accent" />
                    Crafting Workshop
                  </CardTitle>
                  <button onClick={onClose} className="text-subtle hover:text-text">
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Result Screen */}
                {result && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="space-y-4"
                  >
                    <div className={`p-6 rounded-lg border-2 text-center ${
                      result.success ? "border-green-500 bg-green-500/10" : "border-red-500 bg-red-500/10"
                    }`}>
                      <div className="text-6xl mb-4">
                        {result.success ? "✅" : "❌"}
                      </div>
                      <h3 className="text-2xl font-bold mb-2">
                        {result.success ? "Crafting Successful!" : "Crafting Failed"}
                      </h3>
                      <p className="text-subtle">{result.message}</p>
                      
                      {result.success && result.outputItem && (
                        <div className="mt-4 p-4 bg-bg rounded-lg">
                          <div className="text-4xl mb-2">
                            {result.outputItem.type === "weapon" ? "⚔️" : 
                             result.outputItem.type === "armor" ? "🛡️" : "💎"}
                          </div>
                          <div className="font-bold text-lg">{result.outputItem.name}</div>
                          <div className={`text-sm ${rarityColors[result.rarityAchieved || "common"]}`}>
                            {result.rarityAchieved?.toUpperCase()}
                          </div>
                          {result.outputItem.power && (
                            <div className="text-xs text-accent mt-2">⚔️ Power: {result.outputItem.power}</div>
                          )}
                          {result.outputItem.defense && (
                            <div className="text-xs text-accent mt-1">🛡️ Defense: {result.outputItem.defense}</div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={() => { setResult(null); setSelectedRecipe(null); }} className="flex-1">
                        Craft Again
                      </Button>
                      <Button variant="outline" onClick={onClose} className="flex-1">
                        Close
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* Recipe Selection */}
                {!result && (
                  <>
                    {loading ? (
                      <div className="text-center py-12 text-subtle">Loading recipes...</div>
                    ) : recipes.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="text-6xl mb-4">🔨</div>
                        <h3 className="text-xl font-bold text-text mb-2">No Recipes Available</h3>
                        <p className="text-subtle">Level up to unlock crafting recipes!</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <h3 className="font-semibold text-lg">Select Recipe</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                          {recipes.map((recipe) => (
                            <button
                              key={recipe.id}
                              onClick={() => setSelectedRecipe(recipe)}
                              className={`p-4 rounded-lg border-2 text-left transition-all ${
                                selectedRecipe?.id === recipe.id
                                  ? "border-accent bg-accent/10"
                                  : recipe.canCraft
                                  ? "border-border hover:border-accent/50"
                                  : "border-border opacity-50 cursor-not-allowed"
                              }`}
                              disabled={!recipe.canCraft}
                            >
                              <div className="font-bold mb-2">{recipe.name}</div>
                              {recipe.description && (
                                <p className="text-xs text-subtle mb-3">{recipe.description}</p>
                              )}
                              
                              <div className="space-y-2">
                                <div className="text-xs text-muted">Materials:</div>
                                <div className="flex gap-2 flex-wrap">
                                  {recipe.inputItems.map((item: any) => (
                                    <span key={item.id} className="text-xs px-2 py-1 bg-bg rounded border border-border">
                                      {item.icon} {item.name}
                                    </span>
                                  ))}
                                </div>
                                
                                <div className="text-xs text-accent">
                                  Result: {recipe.outputItem?.name} ({recipe.outputItem?.rarity})
                                </div>
                                
                                <div className="flex items-center justify-between text-xs mt-2 pt-2 border-t border-border">
                                  <span className="text-yellow-500">💰 {recipe.goldCost}g</span>
                                  <span className="text-muted">{recipe.successRate}% success</span>
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>

                        {/* Crafting Panel */}
                        {selectedRecipe && (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-6 bg-bg rounded-lg border-2 border-accent"
                          >
                            <h4 className="font-bold text-lg mb-4">Crafting: {selectedRecipe.name}</h4>
                            
                            <div className="grid md:grid-cols-3 gap-4 mb-6">
                              {/* Input Items */}
                              <div className="md:col-span-1">
                                <div className="text-sm text-subtle mb-2">Materials Required</div>
                                <div className="space-y-2">
                                  {selectedRecipe.inputItems.map((item: any) => (
                                    <div key={item.id} className="flex items-center gap-2 p-2 bg-card rounded border border-border">
                                      <span className="text-xl">{item.icon}</span>
                                      <span className="text-sm">{item.name}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Arrow */}
                              <div className="flex items-center justify-center">
                                <div className="text-4xl text-accent">→</div>
                              </div>

                              {/* Output Item */}
                              <div className="md:col-span-1">
                                <div className="text-sm text-subtle mb-2">Result</div>
                                {selectedRecipe.outputItem && (
                                  <div className={`p-4 rounded-lg border-2 text-center ${
                                    rarityColors[selectedRecipe.outputItem.rarity]
                                  }`}>
                                    <div className="text-3xl mb-2">
                                      {selectedRecipe.outputItem.type === "weapon" ? "⚔️" : 
                                       selectedRecipe.outputItem.type === "armor" ? "🛡️" : "💎"}
                                    </div>
                                    <div className="font-bold">{selectedRecipe.outputItem.name}</div>
                                    <div className="text-xs mt-1 uppercase">{selectedRecipe.outputItem.rarity}</div>
                                    {selectedRecipe.rarityBoost > 0 && (
                                      <div className="text-xs text-accent mt-2">
                                        <Sparkles className="h-3 w-3 inline mr-1" />
                                        Rarity Boost!
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-card rounded">
                              <div className="text-center">
                                <div className="text-sm text-subtle mb-1">Cost</div>
                                <div className="font-bold text-yellow-500">💰 {selectedRecipe.goldCost}g</div>
                              </div>
                              <div className="text-center">
                                <div className="text-sm text-subtle mb-1">Success Rate</div>
                                <div className="font-bold text-green-500">{selectedRecipe.successRate}%</div>
                              </div>
                              <div className="text-center">
                                <div className="text-sm text-subtle mb-1">Variance</div>
                                <div className="font-bold text-purple-500">±10%</div>
                              </div>
                            </div>

                            {/* Warning */}
                            {selectedRecipe.successRate < 100 && (
                              <div className="flex items-start gap-2 p-3 bg-orange-500/10 border border-orange-500/30 rounded mb-4">
                                <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5" />
                                <div className="text-sm text-orange-200">
                                  <div className="font-semibold">Crafting Risk</div>
                                  {100 - selectedRecipe.successRate}% chance of failure - materials will be lost!
                                </div>
                              </div>
                            )}

                            {/* Craft Button */}
                            <Button
                              onClick={performCraft}
                              disabled={crafting || !selectedRecipe.canCraft}
                              className="w-full gap-2"
                              size="lg"
                            >
                              <Hammer className="h-5 w-5" />
                              {crafting ? "Crafting..." : "Craft Item"}
                            </Button>

                            {!selectedRecipe.canCraft && (
                              <p className="text-xs text-destructive text-center mt-2">
                                Missing materials or insufficient gold
                              </p>
                            )}
                          </motion.div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}













