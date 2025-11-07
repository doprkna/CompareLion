import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/db";
import { ensurePrismaClient } from "@/lib/prisma-guard";
import { safeAsync } from "@/lib/api-handler";

/**
 * Preload API - Returns essential data for app initialization
 */
export const GET = safeAsync(async (req: NextRequest) => {
  ensurePrismaClient();
  
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return NextResponse.json({ 
      success: true,
      user: null 
    });
  }

  // Fetch user summary for preload
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
    },
  });

  if (!user) {
    return NextResponse.json({ 
      success: true,
      user: null 
    });
  }

  return NextResponse.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
    },
  });
});

