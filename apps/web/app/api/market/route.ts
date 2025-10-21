import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/market
 * Browse marketplace listings with filters
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const filter = searchParams.get("filter") || "all"; // all, weapons, armor, accessories
    const sort = searchParams.get("sort") || "recent"; // recent, price_low, price_high
    const currency = searchParams.get("currency"); // gold, diamonds, or null for all

    let whereClause: any = { status: "active" };

    // Currency filter
    if (currency) {
      whereClause.currency = currency;
    }

    // Get listings
    const listings = await prisma.marketListing.findMany({
      where: whereClause,
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
            level: true,
          },
        },
      },
      orderBy:
        sort === "price_low"
          ? { price: "asc" }
          : sort === "price_high"
          ? { price: "desc" }
          : { listedAt: "desc" },
      take: 100,
    });

    // Enrich with item details
    const enrichedListings = await Promise.all(
      listings.map(async (listing) => {
        const item = await prisma.item.findUnique({
          where: { id: listing.itemId },
        });

        // Apply filter
        if (filter !== "all") {
          if (filter === "weapons" && item?.type !== "weapon") return null;
          if (filter === "armor" && item?.type !== "armor") return null;
          if (filter === "accessories" && item?.type !== "accessory") return null;
        }

        return {
          id: listing.id,
          seller: {
            id: listing.seller.id,
            name: listing.seller.name || listing.seller.email.split("@")[0],
            level: listing.seller.level,
          },
          item: item
            ? {
                id: item.id,
                name: item.name,
                type: item.type,
                rarity: item.rarity,
                power: item.power,
                defense: item.defense,
              }
            : null,
          price: listing.price,
          currency: listing.currency,
          listedAt: listing.listedAt,
        };
      })
    );

    const filteredListings = enrichedListings.filter((l) => l !== null);

    return NextResponse.json({
      success: true,
      listings: filteredListings,
      count: filteredListings.length,
      taxRate: 5, // 5%
    });
  } catch (error) {
    console.error("[API] Error fetching market:", error);
    return NextResponse.json(
      { error: "Failed to fetch market" },
      { status: 500 }
    );
  }
}










