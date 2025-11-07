'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Recipe } from '@/hooks/useRecipes';
import { Hammer, Clock, Star, Package } from 'lucide-react';
import { useCrafting } from '@/hooks/useCrafting';
import { useState } from 'react';
import { toast } from 'sonner';

interface RecipeCardProps {
  recipe: Recipe;
  userInventory: Record<string, number>; // itemId -> quantity
  onCraftSuccess?: () => void;
}

export function RecipeCard({ recipe, userInventory, onCraftSuccess }: RecipeCardProps) {
  const { craft, loading } = useCrafting();
  const [isNewDiscovery, setIsNewDiscovery] = useState(false);

  const canCraft = recipe.ingredients.every(
    (ing) => (userInventory[ing.itemId] || 0) >= ing.quantity
  );

  const handleCraft = async () => {
    try {
      const result = await craft(recipe.id);
      if (result.isNewDiscovery) {
        setIsNewDiscovery(true);
        toast.success('✨ New discovery! ' + result.message);
        setTimeout(() => setIsNewDiscovery(false), 3000);
      } else {
        toast.success(result.message);
      }
      onCraftSuccess?.();
    } catch (e: any) {
      toast.error(e.message || 'Failed to craft item');
    }
  };

  return (
    <Card className={`bg-card border-border ${isNewDiscovery ? 'border-2 border-yellow-500 shadow-lg' : ''}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="w-5 h-5 text-primary" />
          {recipe.item.name}
        </CardTitle>
        <CardDescription>
          {recipe.item.description || 'No description available.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{(recipe.craftTime / 1000).toFixed(1)}s</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-500" />
            <span>+{recipe.xpReward} XP</span>
          </div>
          <div className="flex items-center gap-1">
            <Package className="w-4 h-4" />
            <span className="capitalize">{recipe.item.rarity}</span>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-semibold">Ingredients:</h4>
          <ul className="space-y-1">
            {recipe.ingredients.map((ing, index) => {
              const hasEnough = (userInventory[ing.itemId] || 0) >= ing.quantity;
              return (
                <li key={index} className={`text-sm flex items-center gap-2 ${hasEnough ? 'text-foreground' : 'text-muted-foreground'}`}>
                  <span>{ing.quantity}x</span>
                  <span>Item {ing.itemId}</span>
                  {hasEnough ? (
                    <span className="text-green-500">✓</span>
                  ) : (
                    <span className="text-red-500">✗</span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        <Button
          onClick={handleCraft}
          disabled={!canCraft || loading}
          className="w-full"
        >
          <Hammer className="w-4 h-4 mr-2" />
          {loading ? 'Crafting...' : 'Craft Item'}
        </Button>

        {isNewDiscovery && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 text-sm text-yellow-800 dark:text-yellow-200">
            ✨ New Discovery!
          </div>
        )}
      </CardContent>
    </Card>
  );
}

