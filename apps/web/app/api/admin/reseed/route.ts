import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import { prisma } from "@/lib/db";
import { ensurePrismaClient } from "@/lib/prisma-guard";
import { handleApiError } from "@/lib/api-error-handler";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function POST() {
  try {
    // Only allow in development
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "Reseed not allowed in production" },
        { status: 403 }
      );
    }

    ensurePrismaClient();
    
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true },
    });

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    // Run the reseed command
    console.log("🌱 Admin reseed requested by:", session.user.email);
    
    const { stdout, stderr } = await execAsync("pnpm db:reset-seed", {
      cwd: process.cwd(),
    });

    if (stderr) {
      console.error("Reseed stderr:", stderr);
    }

    console.log("Reseed stdout:", stdout);

    return NextResponse.json({
      success: true,
      message: "Database reseeded successfully",
      output: stdout,
    });
  } catch (error) {
    console.error("[API Error][admin/reseed]", error);
    return handleApiError(error, "Failed to reseed database");
  }
}







