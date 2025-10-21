import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

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










