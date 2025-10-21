/**
 * Manual Self-Healing Trigger (v0.11.3)
 * 
 * Admin endpoint to manually trigger healing routines.
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { runAllHealingRoutines } from "@/lib/monitoring/self-healing";

export async function POST() {
  try {
    // Check authentication
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // TODO: Check admin role
    
    // Run healing routines
    const results = await runAllHealingRoutines();
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      results,
    });
  } catch (error) {
    console.error("[Heal] Manual healing failed:", error);
    return NextResponse.json(
      {
        error: "Healing routines failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}










