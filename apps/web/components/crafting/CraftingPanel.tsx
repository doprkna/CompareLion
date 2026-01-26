'use client';

import { useState } from 'react';
import { useRecipes } from '@parel/core/hooks/useRecipes';
import { RecipeCard } from './RecipeCard';
import { Loader2, Package, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useInventory } from '@parel/core/hooks/useInventory';

export function CraftingPanel() {
  const { recipes, loading, error, reload } = useRecipes();
  const { inventory, loading: inventoryLoading } = useInventory();
  const [searchTerm, setSearchTerm] = useState('');

  // Build inventory map (itemId -> quantity)
  const inventoryMap: Record<string, number> = {};
  inventory.forEach((item) => {
    inventoryMap[item.itemId] = (inventoryMap[item.itemId] || 0) + item.quantity;
  });

  // Filter recipes by search term
  const filteredRecipes = recipes.filter((recipe) =>
    recipe.item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading || inventoryLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-destructive/10 text-destructive rounded-lg p-4">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Package className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-bold">Crafting</h2>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search recipes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {filteredRecipes.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          {searchTerm ? 'No recipes found matching your search.' : 'No recipes available.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              userInventory={inventoryMap}
              onCraftSuccess={reload}
            />
          ))}
        </div>
      )}
    </div>
  );
}

