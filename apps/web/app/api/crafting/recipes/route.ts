import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/db";
import { getAvailableRecipes } from "@/lib/crafting";
import { safeAsync, successResponse, unauthorizedError, notFoundError } from "@/lib/api-handler";

/**
 * GET /api/crafting/recipes
 * Get available crafting recipes for current user
 */
export const GET = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return unauthorizedError('Unauthorized');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return notFoundError('User');
  }

    const recipes = await getAvailableRecipes(user.id);

    // Enrich recipes with item details
    const enrichedRecipes = await Promise.all(
      recipes.map(async (recipe) => {
        const inputItems = await prisma.item.findMany({
          where: { id: { in: recipe.inputItemIds } },
        });

        const outputItem = await prisma.item.findUnique({
          where: { id: recipe.outputItemId },
        });

        // Check if user has materials
        const inventory = await prisma.inventoryItem.findMany({
          where: {
            userId: user.id,
            itemId: { in: recipe.inputItemIds },
          },
          include: { item: true },
        });

        const canCraft =
          inventory.length === recipe.inputItemIds.length &&
          (user.funds || 0) >= recipe.goldCost;

        return {
          id: recipe.id,
          name: recipe.name,
          description: recipe.description,
          goldCost: recipe.goldCost,
          requiresToken: recipe.requiresToken,
          rarityBoost: recipe.rarityBoost,
          successRate: recipe.successRate,
          unlockLevel: recipe.unlockLevel,
          inputItems: inputItems.map((item) => ({
            id: item.id,
            name: item.name,
            rarity: item.rarity,
            icon: item.type === "weapon" ? "⚔️" : item.type === "armor" ? "🛡️" : "💎",
          })),
          outputItem: outputItem
            ? {
                id: outputItem.id,
                name: outputItem.name,
                rarity: outputItem.rarity,
                type: outputItem.type,
                power: outputItem.power,
                defense: outputItem.defense,
              }
            : null,
          canCraft,
          userHasMaterials: inventory.map((inv) => ({
            itemId: inv.itemId,
            name: inv.item.name,
            quantity: inv.quantity,
          })),
        };
      })
  );

  return successResponse({
    recipes: enrichedRecipes,
    userLevel: user.level || 1,
    userGold: user.funds || 0,
  });
});













