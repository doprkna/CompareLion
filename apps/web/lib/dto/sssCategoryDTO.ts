// Accept any shape matching the SssCategory record until Prisma client is updated
export function toSssCategoryDTO(sssc: any): {
  id: string;
  label: string;
  status: string;
  sizeTag: string | null;
  lastRun: Date | null;
  version: number;
} {
  return {
    id: sssc.id,
    label: sssc.label,
    status: sssc.status,
    sizeTag: sssc.sizeTag ?? null,
    lastRun: sssc.lastRun ?? null,
    version: parseInt(sssc.version, 10),
  };
}

export type SssCategoryDTO = ReturnType<typeof toSssCategoryDTO>;
