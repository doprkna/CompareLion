import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const adminUser = await prisma.user.findUnique({
      where: { email: "admin@example.com" },
      select: {
        id: true,
        email: true,
        name: true,
        passwordHash: true,
        level: true,
        xp: true,
        createdAt: true,
      },
    });

    if (!adminUser) {
      return NextResponse.json({
        success: false,
        message: "Admin user not found in database",
        suggestion: "Run 'pnpm db:seed' to create the admin user"
      });
    }

    return NextResponse.json({
      success: true,
      adminUser: {
        id: adminUser.id,
        email: adminUser.email,
        name: adminUser.name,
        level: adminUser.level,
        xp: adminUser.xp,
        createdAt: adminUser.createdAt,
        hasPasswordHash: !!adminUser.passwordHash,
        passwordHashLength: adminUser.passwordHash?.length || 0,
        passwordHashPrefix: adminUser.passwordHash?.substring(0, 10) || "none",
      }
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      message: "Database connection failed"
    }, { status: 500 });
  }
}
