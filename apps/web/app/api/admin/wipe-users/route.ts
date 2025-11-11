import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";


// Force Node.js runtime for Prisma (v0.35.16d)
export const runtime = 'nodejs';
export async function POST() {
  try {
    // Delete only auto-generated demo users, not the main demo user
    const deleted = await prisma.user.deleteMany({
      where: {
        email: {
          startsWith: "auto",
        },
      },
    });

    return NextResponse.json({ ok: true, deleted: deleted.count });
  } catch (err: any) {
    console.error('[Admin] wipe-users error:', err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}













