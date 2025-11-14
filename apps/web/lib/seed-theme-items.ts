/**
 * Theme Items Seed Data
 * v0.35.17a - Region-specific theme items
 */

export const THEME_ITEMS = [
  // EU Region - Default Theme
  {
    key: 'theme_eu_default',
    name: 'European Classic',
    type: 'theme',
    emoji: '🏛️',
    icon: '🏛️',
    rarity: 'common',
    goldPrice: 0,
    description: 'The original PAREL theme with balanced neutral tones',
    isShopItem: true,
    region: 'EU',
    power: null,
    defense: null,
  },
  
  // US Region - Modern Theme
  {
    key: 'theme_us_modern',
    name: 'Modern Minimalist',
    type: 'theme',
    emoji: '🗽',
    icon: '🗽',
    rarity: 'uncommon',
    goldPrice: 500,
    description: 'Clean, crisp design with pure whites and blacks',
    isShopItem: true,
    region: 'US',
    power: null,
    defense: null,
  },
  
  // JP Region - Kawaii Theme
  {
    key: 'theme_jp_kawaii',
    name: 'Kawaii Dream',
    type: 'theme',
    emoji: '🌸',
    icon: '🌸',
    rarity: 'rare',
    goldPrice: 1000,
    description: 'Soft pink pastels inspired by Japanese pop culture',
    isShopItem: true,
    region: 'JP',
    power: null,
    defense: null,
  },
  
  // KR Region - Neon Theme
  {
    key: 'theme_kr_neon',
    name: 'Neon Cyber',
    type: 'theme',
    emoji: '🌃',
    icon: '🌃',
    rarity: 'epic',
    goldPrice: 2000,
    description: 'Cyberpunk-inspired dark theme with neon cyan accents',
    isShopItem: true,
    region: 'KR',
    power: null,
    defense: null,
  },
  
  // CN Region - Classic Theme
  {
    key: 'theme_cn_classic',
    name: 'Imperial Heritage',
    type: 'theme',
    emoji: '🏮',
    icon: '🏮',
    rarity: 'epic',
    goldPrice: 2000,
    description: 'Traditional aesthetics with warm gray tones',
    isShopItem: true,
    region: 'CN',
    power: null,
    defense: null,
  },
  
  // Global Themes (region: null)
  {
    key: 'theme_global_dark',
    name: 'Midnight Mode',
    type: 'theme',
    emoji: '🌙',
    icon: '🌙',
    rarity: 'legendary',
    goldPrice: 5000,
    description: 'Universal dark theme available in all regions',
    isShopItem: true,
    region: null,
    power: null,
    defense: null,
  },
  {
    key: 'theme_global_light',
    name: 'Daylight Pro',
    type: 'theme',
    emoji: '☀️',
    icon: '☀️',
    rarity: 'legendary',
    goldPrice: 5000,
    description: 'Universal light theme available in all regions',
    isShopItem: true,
    region: null,
    power: null,
    defense: null,
  },
];

