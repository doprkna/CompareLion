import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { safeAsync, successResponse } from "@/lib/api-handler";

export const GET = safeAsync(async (_req: NextRequest) => {
  const stats = await prisma.reportStat.findMany();
  return successResponse({ stats });
});
