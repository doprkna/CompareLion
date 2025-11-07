import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { safeAsync } from '@/lib/api-handler';

export const GET = safeAsync(async (req: NextRequest) => {
  const regionParam = req.nextUrl.searchParams.get('region');

  const influences = await prisma.factionInfluence.findMany({
    where: regionParam ? { region: regionParam } : undefined,
    include: {
      faction: {
        select: {
          id: true,
          key: true,
          name: true,
          colorPrimary: true,
          colorSecondary: true,
          regionScope: true,
        },
      },
    },
    orderBy: [{ region: 'asc' }, { influenceScore: 'desc' }],
  });

  // Group by region and get top faction per region
  const regionMap: Record<string, any> = {};
  
  influences.forEach((inf) => {
    if (!regionMap[inf.region]) {
      regionMap[inf.region] = {
        region: inf.region,
        factions: [],
      };
    }
    regionMap[inf.region].factions.push({
      factionId: inf.factionId,
      factionName: inf.faction.name,
      factionKey: inf.faction.key,
      colorPrimary: inf.faction.colorPrimary,
      colorSecondary: inf.faction.colorSecondary,
      influenceScore: inf.influenceScore,
      contributionsCount: inf.contributionsCount,
    });
  });

  // Find top faction per region
  const topFactions: Record<string, any> = {};
  Object.entries(regionMap).forEach(([region, data]) => {
    if (data.factions.length > 0) {
      const top = data.factions[0];
      topFactions[region] = {
        region,
        topFaction: {
          factionId: top.factionId,
          name: top.factionName,
          key: top.factionKey,
          colorPrimary: top.colorPrimary,
          colorSecondary: top.colorSecondary,
          influenceScore: top.influenceScore,
        },
        allFactions: data.factions.map((f: any) => ({
          name: f.factionName,
          influence: f.influenceScore,
          contributions: f.contributionsCount,
        })),
      };
    }
  });

  return NextResponse.json({
    success: true,
    map: topFactions,
    regions: Object.keys(topFactions),
  });
});

