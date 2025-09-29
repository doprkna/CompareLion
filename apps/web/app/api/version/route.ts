import { NextResponse } from 'next/server';
import { getLatestVersion } from '@/lib/services/versionService';
import { toVersionDTO, VersionDTO } from '@/lib/dto/versionDTO';

export async function GET() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ success: true, version: 'dev' });
  }

  const v = await getLatestVersion();
  if (!v) return NextResponse.json({ success: true, version: null });
  const version: VersionDTO = toVersionDTO(v);
  return NextResponse.json({ success: true, version });
}
