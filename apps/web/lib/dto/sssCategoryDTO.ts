import type { SssCategory as PrismaSssCategory } from '@parel/db/src/client';

export function toSssCategoryDTO(sssc: PrismaSssCategory): {
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
