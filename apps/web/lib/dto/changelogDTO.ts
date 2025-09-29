// DTO for changelog entries parsed from CHANGELOG.md
export function toChangelogDTO(c: any): {
  id: string;
  version: string;
  changes: { type: string; text: string }[];
  releasedAt: Date;
} {
  return {
    id: c.version,
    version: c.version,
    changes: c.changes,
    releasedAt: new Date(),
  };
}

export type ChangelogDTO = ReturnType<typeof toChangelogDTO>;
