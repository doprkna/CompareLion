export const REGIONS = ["EU", "US", "JP", "KR", "CN"] as const;

export type Region = (typeof REGIONS)[number];

export const DEFAULT_REGION: Region = "EU";

export const REGION_SETTINGS: Record<Region, { locale: string; theme: string }> = {
  EU: { locale: "en", theme: "default" },
  US: { locale: "en", theme: "modern" },
  JP: { locale: "ja", theme: "kawaii" },
  KR: { locale: "ko", theme: "neon" },
  CN: { locale: "zh", theme: "classic" },
};

