import { NextResponse } from "next/server";
import { prisma } from "@parel/db/src/client";

export async function GET() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ success: true, version: "dev" });
  }

  const version = await prisma.version.findFirst();
  return NextResponse.json({ success: true, version: version?.value || "unknown" });
}
