import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST() {
  try {
    const deleted = await prisma.message.deleteMany();
    return NextResponse.json({ ok: true, deleted: deleted.count });
  } catch (err: any) {
    console.error('[Admin] wipe-messages error:', err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}













