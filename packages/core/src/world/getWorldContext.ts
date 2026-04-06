/**
 * World Context (Wiki Seeds) loader.
 * Static, versioned data. No runtime fetches.
 * TODO: Wiki Seeds are static placeholders; update values when validated.
 *
 * To add regions: add entry to regionMap below. Schema: key, label, value, unit, year, region, sourceName, sourceUrl, lastVerifiedAt.
 */

export interface WorldContextEntry {
  key: string;
  label: string;
  value: number;
  unit: string;
  year: number;
  region: string;
  sourceName: string;
  sourceUrl: string;
  lastVerifiedAt: string;
}

/** PLACEHOLDER: Update value/source when validated. See packages/core/src/world/wiki-seeds/cz.json for schema. */
const czData: { version: string; region: string; entries: WorldContextEntry[] } = {
  version: '1',
  region: 'CZ',
  entries: [
    {
      key: 'income_monthly_avg',
      label: 'Average monthly income',
      value: 75000, // PLACEHOLDER
      unit: 'CZK',
      year: 2024,
      region: 'CZ',
      sourceName: 'TODO',
      sourceUrl: '',
      lastVerifiedAt: '2026-03-02',
    },
    {
      key: 'sleep_hours_avg',
      label: 'Average sleep hours',
      value: 7.2, // PLACEHOLDER
      unit: 'h',
      year: 2024,
      region: 'CZ',
      sourceName: 'TODO',
      sourceUrl: '',
      lastVerifiedAt: '2026-03-02',
    },
    {
      key: 'screen_time_hours_avg',
      label: 'Average screen time per day',
      value: 3.5, // PLACEHOLDER
      unit: 'h',
      year: 2024,
      region: 'CZ',
      sourceName: 'TODO',
      sourceUrl: '',
      lastVerifiedAt: '2026-03-02',
    },
  ],
};

const regionMap: Record<string, { entries: WorldContextEntry[] }> = { cz: czData };

/**
 * Get a world context entry by region and key.
 * Returns null if data missing or parsing fails.
 */
export function getWorldContext(region: string, key: string): WorldContextEntry | null {
  if (!region?.trim() || !key?.trim()) return null;
  const data = regionMap[region.toLowerCase()];
  if (!data?.entries?.length) return null;
  const entry = data.entries.find((e) => e.key === key);
  return entry ? { ...entry } : null;
}

/** All known wiki seed keys for enrichment script. */
export const WIKI_SEED_KEYS: string[] = czData.entries.map((e) => e.key);
