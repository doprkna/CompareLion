import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";


// Force Node.js runtime for Prisma (v0.35.16d)
export const runtime = 'nodejs';
export async function POST() {
  try {
    // Delete only flow questions (options cascade via onDelete)
    const deleted = await prisma.flowQuestion.deleteMany();
    return NextResponse.json({ ok: true, deleted: deleted.count });
  } catch (err: any) {
    console.error('[Admin] wipe-questions error:', err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}













