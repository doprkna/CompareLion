// DTO for SssCategory
export type SssCategoryDTO = {
  id: number;
  label: string;
  status: string;
  sizeTag: string;
  lastRun: string | null;
  version: string;
};
export function toSssCategoryDTO(s: any): SssCategoryDTO {
  return {
    id: s.id,
    label: s.label,
    status: s.status,
    sizeTag: s.sizeTag,
    lastRun: s.lastRun ? s.lastRun.toISOString() : null,
    version: s.version,
  };
}
