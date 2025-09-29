import type { Version as PrismaVersion } from '@parel/db';

export function toVersionDTO(ver: PrismaVersion): {
  id: string;
  number: string;
  releasedAt: Date;
  notes: string | null;
} {
  return {
    id: ver.id,
    number: (ver as any).value ?? ver.name,
    releasedAt: ver.createdAt,
    notes: (ver as any).changelog ?? null,
  };
}

export type VersionDTO = ReturnType<typeof toVersionDTO>;
