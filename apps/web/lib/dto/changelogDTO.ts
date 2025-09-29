import type { Changelog as PrismaChangelog } from '@parel/db/src/client';

export function toChangelogDTO(c: PrismaChangelog): {
  id: string;
  version: string;
  changes: { type: string; text: string }[];
  releasedAt: Date;
} {
  return {
    id: c.id,
    version: c.version,
    changes: c.changes as { type: string; text: string }[],
    releasedAt: c.createdAt,
  };
}

export type ChangelogDTO = ReturnType<typeof toChangelogDTO>;
