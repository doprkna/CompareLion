import { NextResponse } from 'next/server';
import { prisma } from '@parel/db/src/client';
import { toVersionDTO, VersionDTO } from '@/lib/dto/versionDTO';

export async function GET() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ success: true, version: 'dev' });
  }

  const v = await prisma.version.findFirst();
  if (!v) {
    return NextResponse.json({ success: true, version: null });
  }
  const versionDTO: VersionDTO = toVersionDTO(v);
  return NextResponse.json({ success: true, version: versionDTO });
}
