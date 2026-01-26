export type Region = 'us' | 'eu' | 'asia' | 'latam';

export const REGIONS: Record<Region, { label: string; timezone: string }> = {
  us:    { label: 'United States', timezone: 'America/New_York' },
  eu:    { label: 'Europe',        timezone: 'Europe/Prague' },
  asia:  { label: 'Asia',          timezone: 'Asia/Tokyo' },
  latam: { label: 'Latin America', timezone: 'America/Sao_Paulo' },
};

export const DEFAULT_REGION: Region = 'eu';

