import { NextResponse } from "next/server";
import { prisma } from "@parel/db/src/client";

export async function GET() {
  if (!process.env.DATABASE_URL) {
    // temporary fallback so Vercel build doesn’t die
    return NextResponse.json({ success: true, languages: [] });
  }

  const languages = await prisma.language.findMany();
  return NextResponse.json({ success: true, languages });
}
