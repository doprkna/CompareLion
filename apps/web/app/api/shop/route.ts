import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ensurePrismaClient } from "@/lib/prisma-guard";
import { handleApiError } from "@/lib/api-error-handler";

/**
 * Shop API - Fetch all available items for purchase
 * Public endpoint (no auth required to browse)
 */
export async function GET() {
  try {
    ensurePrismaClient();
    
    const items = await prisma.item.findMany({
      orderBy: [
        { rarity: 'desc' }, // Legendary first
        { name: 'asc' },
      ],
    });

    // Add pricing logic (simple formula based on rarity and stats)
    const itemsWithPrices = items.map(item => {
      let basePrice = 0;
      
      // Base price by rarity
      const rarityPrices: Record<string, number> = {
        common: 10,
        uncommon: 25,
        rare: 50,
        epic: 100,
        legendary: 500,
      };
      basePrice = rarityPrices[item.rarity] || 10;
      
      // Add stat bonuses
      if (item.power) basePrice += item.power * 2;
      if (item.defense) basePrice += item.defense * 3;
      
      return {
        ...item,
        price: basePrice,
        currency: 'funds' as const,
      };
    });

    return NextResponse.json({
      success: true,
      items: itemsWithPrices,
      count: items.length,
    });
  } catch (error) {
    console.error("[API Error][shop]", error);
    return handleApiError(error, "Failed to fetch shop items");
  }
}



