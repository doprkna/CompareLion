/**
 * Referrals API (v0.11.8)
 * 
 * PLACEHOLDER: Referral statistics and leaderboard.
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import {
  getUserReferralStats,
  getTopReferrers,
} from "@/lib/beta/invite-system";

/**
 * GET - Get referral stats or leaderboard
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const action = searchParams.get("action");
    
    if (action === "leaderboard") {
      // Get top referrers
      const limit = parseInt(searchParams.get("limit") || "10", 10);
      const topReferrers = await getTopReferrers(limit);
      
      return NextResponse.json({
        leaderboard: topReferrers,
      });
    }
    
    // Get user's referral stats
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // PLACEHOLDER: Get user ID
    const userId = "placeholder";
    
    const stats = await getUserReferralStats(userId);
    
    return NextResponse.json({
      stats,
    });
  } catch (error) {
    console.error("[Referrals API] GET failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch referral data" },
      { status: 500 }
    );
  }
}











