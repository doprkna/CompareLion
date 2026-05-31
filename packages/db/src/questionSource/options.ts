import type { Prisma } from '@prisma/client';

export interface ImportOption {
  label: string;
  value: string;
  order: number;
}

/** Parse pipe-separated Options column (e.g. Yes|No, 1|2|3|4|5). */
export function parseOptionsColumn(raw: unknown): ImportOption[] {
  if (raw === undefined || raw === null) return [];
  const text = String(raw).trim();
  if (!text) return [];

  return text
    .split('|')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((label, order) => ({
      label,
      value: normalizeOptionValue(label, order),
      order,
    }));
}

export function normalizeOptionValue(label: string, index = 0): string {
  const slug = label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return slug || `option-${index + 1}`;
}

export function getImportOptionsFromMetadata(metadata: unknown): ImportOption[] | null {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) return null;
  const raw = (metadata as Record<string, unknown>).importOptions;
  if (!Array.isArray(raw) || raw.length === 0) return null;

  const parsed: ImportOption[] = [];
  for (let i = 0; i < raw.length; i++) {
    const item = raw[i];
    if (!item || typeof item !== 'object') continue;
    const label = String((item as Record<string, unknown>).label ?? '').trim();
    if (!label) continue;
    const order =
      typeof (item as Record<string, unknown>).order === 'number'
        ? ((item as Record<string, unknown>).order as number)
        : i;
    const value =
      String((item as Record<string, unknown>).value ?? '').trim() ||
      normalizeOptionValue(label, order);
    parsed.push({ label, value, order });
  }

  return parsed.length ? parsed.sort((a, b) => a.order - b.order) : null;
}

function existingMetadataToInputRecord(
  existingMetadata: unknown
): Record<string, Prisma.InputJsonValue> {
  if (
    !existingMetadata ||
    typeof existingMetadata !== 'object' ||
    Array.isArray(existingMetadata)
  ) {
    return {};
  }
  const base: Record<string, Prisma.InputJsonValue> = {};
  for (const [key, value] of Object.entries(existingMetadata)) {
    if (value !== undefined) {
      base[key] = value as Prisma.InputJsonValue;
    }
  }
  return base;
}

export function buildQuestionImportMetadata(
  normalized: { relatedToId?: string; importOptions?: ImportOption[] },
  existingMetadata?: unknown
): Prisma.InputJsonValue | undefined {
  const base = existingMetadataToInputRecord(existingMetadata);

  if (normalized.relatedToId) {
    base.relatedToId = normalized.relatedToId;
  }
  if (normalized.importOptions?.length) {
    base.importOptions = normalized.importOptions.map((opt) => ({
      label: opt.label,
      value: opt.value,
      order: opt.order,
    }));
  }

  return Object.keys(base).length > 0 ? base : undefined;
}
