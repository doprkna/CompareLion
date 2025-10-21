import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

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










