/**
 * PareL Multi-Theme System
 * Modular theme definitions with seasonal and pattern support
 */

export interface ThemeColors {
  bg: string;
  card: string;
  accent: string;
  text: string;
  subtle: string;
  border: string;
  success?: string;
  warning?: string;
  destructive?: string;
}

export interface Theme {
  id: string;
  name: string;
  description?: string;
  colors: Partial<ThemeColors>;
  pattern?: string;
  season?: 'spring' | 'summer' | 'autumn' | 'winter';
  emoji?: string;
}

// Base colors (default theme)
export const BASE_COLORS: ThemeColors = {
  bg: '#0f172a',        // slate-900
  card: '#1e293b',      // slate-800
  accent: '#3b82f6',    // blue-500
  text: '#f1f5f9',      // slate-50
  subtle: '#94a3b8',    // slate-400
  border: '#334155',    // slate-700
  success: '#16a34a',   // green-600
  warning: '#ea580c',   // orange-600
  destructive: '#dc2626' // red-600
};

export const THEMES: Theme[] = [
  {
    id: 'default',
    name: 'Default Dark',
    description: 'Classic navy blue theme',
    colors: BASE_COLORS,
    pattern: 'none',
    emoji: '🌙'
  },
  {
    id: 'teal',
    name: 'Teal Flow',
    description: 'Calm ocean vibes',
    colors: {
      accent: '#14b8a6',  // teal-500
      bg: '#0f172a',
      card: '#1e293b',
    },
    pattern: 'linear-gradient(135deg, #0f172a 0%, #134e4a 100%)',
    emoji: '🌊'
  },
  {
    id: 'sunset',
    name: 'Sunset Horizon',
    description: 'Warm amber glow',
    colors: {
      accent: '#f59e0b',  // amber-500
      bg: '#0f172a',
      card: '#1e293b',
    },
    pattern: 'linear-gradient(135deg, #7c2d12 0%, #f97316 50%, #fbbf24 100%)',
    season: 'summer',
    emoji: '🌅'
  },
  {
    id: 'snow',
    name: 'Winter Snow',
    description: 'Cool icy blues',
    colors: {
      accent: '#60a5fa',  // blue-400
      bg: '#0c1221',
      card: '#1a2332',
      subtle: '#9ca3af',
    },
    pattern: 'radial-gradient(circle at 20% 50%, rgba(96, 165, 250, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(147, 197, 253, 0.08) 0%, transparent 50%)',
    season: 'winter',
    emoji: '❄️'
  },
  {
    id: 'cyber',
    name: 'Cyber Pulse',
    description: 'Neon purple energy',
    colors: {
      accent: '#a855f7',  // purple-500
      bg: '#0f0a1a',
      card: '#1a103d',
      border: '#3b1e6b',
    },
    pattern: 'radial-gradient(circle at 50% 50%, rgba(168, 85, 247, 0.15) 0%, #0f0a1a 50%)',
    emoji: '⚡'
  },
  {
    id: 'forest',
    name: 'Forest Depth',
    description: 'Deep emerald greens',
    colors: {
      accent: '#10b981',  // emerald-500
      bg: '#0a1810',
      card: '#14291f',
      border: '#1e3a2a',
    },
    pattern: 'linear-gradient(135deg, #0a1810 0%, #14532d 100%)',
    season: 'spring',
    emoji: '🌲'
  },
  {
    id: 'autumn',
    name: 'Autumn Leaves',
    description: 'Warm orange and brown',
    colors: {
      accent: '#ea580c',  // orange-600
      bg: '#1a0f0a',
      card: '#2d1810',
      border: '#3d241a',
    },
    pattern: 'linear-gradient(135deg, #1a0f0a 0%, #78350f 50%, #92400e 100%)',
    season: 'autumn',
    emoji: '🍂'
  },
  {
    id: 'sakura',
    name: 'Sakura Bloom',
    description: 'Soft pink cherry blossoms',
    colors: {
      accent: '#ec4899',  // pink-500
      bg: '#1a0f14',
      card: '#2d1a24',
      border: '#3d2433',
      subtle: '#d8b4fe',
    },
    pattern: 'radial-gradient(circle at 30% 30%, rgba(236, 72, 153, 0.1) 0%, transparent 50%), radial-gradient(circle at 70% 70%, rgba(244, 114, 182, 0.08) 0%, transparent 50%)',
    season: 'spring',
    emoji: '🌸'
  },
  {
    id: 'midnight',
    name: 'Midnight Abyss',
    description: 'Pure dark indigo',
    colors: {
      accent: '#6366f1',  // indigo-500
      bg: '#0a0a1a',
      card: '#14142d',
      border: '#1e1e3d',
    },
    pattern: 'linear-gradient(180deg, #0a0a1a 0%, #1e1b4b 100%)',
    emoji: '🌌'
  },
  {
    id: 'rose',
    name: 'Rose Gold',
    description: 'Elegant rose and gold',
    colors: {
      accent: '#fb7185',  // rose-400
      bg: '#1a0d12',
      card: '#2d1a22',
      border: '#3d2433',
    },
    pattern: 'linear-gradient(135deg, #1a0d12 0%, #4c1d24 50%, #881337 100%)',
    emoji: '🌹'
  },
  {
    id: 'matrix',
    name: 'Matrix Code',
    description: 'Green terminal vibes',
    colors: {
      accent: '#22c55e',  // green-500
      bg: '#0a140a',
      card: '#14241a',
      border: '#1e3a2a',
      text: '#86efac',
      subtle: '#4ade80',
    },
    pattern: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(34, 197, 94, 0.03) 2px, rgba(34, 197, 94, 0.03) 4px)',
    emoji: '💚'
  },
  {
    id: 'lava',
    name: 'Lava Flow',
    description: 'Hot red and orange',
    colors: {
      accent: '#ef4444',  // red-500
      bg: '#1a0a0a',
      card: '#2d1414',
      border: '#3d1e1e',
    },
    pattern: 'radial-gradient(circle at 50% 100%, rgba(239, 68, 68, 0.2) 0%, transparent 50%), linear-gradient(180deg, #1a0a0a 0%, #7f1d1d 100%)',
    emoji: '🔥'
  }
];

// Get theme by ID with fallback to default
export function getTheme(themeId: string): Theme {
  return THEMES.find(t => t.id === themeId) || THEMES[0];
}

// Get current season (for auto-theme suggestion)
export function getCurrentSeason(): 'spring' | 'summer' | 'autumn' | 'winter' {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'autumn';
  return 'winter';
}

// Get seasonal theme suggestions
export function getSeasonalThemes(): Theme[] {
  const season = getCurrentSeason();
  return THEMES.filter(t => t.season === season);
}

// Merge partial colors with base colors
export function mergeColors(partial: Partial<ThemeColors>): ThemeColors {
  return { ...BASE_COLORS, ...partial };
}











