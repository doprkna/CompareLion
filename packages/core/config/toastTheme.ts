/**
 * Toast Theme Configuration
 * v0.26.9 - Reward & Event Toast Expansion
 * 
 * Defines color schemes, icons, and animations for all toast types
 */

export type ToastType =
  | 'xp'
  | 'gold'
  | 'item'
  | 'boss'
  | 'crit'
  | 'achievement'
  | 'craft'
  | 'shop'
  | 'rest'
  | 'info'
  | 'error';

export interface ToastTheme {
  color: string; // Tailwind color name (purple, yellow, etc.)
  icon: string; // Emoji icon
  animation?: 'shake' | 'fade' | 'bounce' | 'slide'; // Animation type
  duration?: number; // Auto-dismiss duration in ms
}

export const TOAST_THEME: Record<ToastType, ToastTheme> = {
  xp: {
    color: 'purple',
    icon: '💫',
    animation: 'fade',
    duration: 5000,
  },
  gold: {
    color: 'yellow',
    icon: '🪙',
    animation: 'fade',
    duration: 5000,
  },
  item: {
    color: 'teal',
    icon: '🎁',
    animation: 'bounce',
    duration: 5000,
  },
  boss: {
    color: 'red',
    icon: '👑',
    animation: 'shake',
    duration: 6000,
  },
  crit: {
    color: 'orange',
    icon: '💥',
    animation: 'shake',
    duration: 4000,
  },
  craft: {
    color: 'gray',
    icon: '⚒️',
    animation: 'slide',
    duration: 5000,
  },
  shop: {
    color: 'amber',
    icon: '💰',
    animation: 'slide',
    duration: 5000,
  },
  achievement: {
    color: 'emerald',
    icon: '🏅',
    animation: 'bounce',
    duration: 6000,
  },
  rest: {
    color: 'amber',
    icon: '🔥',
    animation: 'fade',
    duration: 5000,
  },
  info: {
    color: 'sky',
    icon: '💬',
    animation: 'fade',
    duration: 5000,
  },
  error: {
    color: 'rose',
    icon: '⛔',
    animation: 'shake',
    duration: 6000,
  },
};

/**
 * Get Tailwind classes for a toast type
 */
export function getToastStyles(type: ToastType): string {
  const theme = TOAST_THEME[type];
  const colorMap: Record<string, string> = {
    purple: 'border-purple-500/50 bg-purple-900/30 shadow-purple-500/20',
    yellow: 'border-yellow-500/50 bg-yellow-900/30 shadow-yellow-500/20',
    teal: 'border-teal-500/50 bg-teal-900/30 shadow-teal-500/20',
    red: 'border-red-500/80 bg-red-900/40 shadow-red-500/30 border-2',
    orange: 'border-orange-500/70 bg-orange-900/35 shadow-orange-500/25',
    gray: 'border-gray-500/50 bg-gray-900/30 shadow-gray-500/20',
    amber: 'border-amber-500/50 bg-amber-900/30 shadow-amber-500/20',
    emerald: 'border-emerald-500/80 bg-emerald-900/40 shadow-emerald-500/30 border-2',
    sky: 'border-sky-500/50 bg-sky-900/30 shadow-sky-500/20',
    rose: 'border-rose-500/80 bg-rose-900/40 shadow-rose-500/30 border-2',
  };
  
  return colorMap[theme.color] || 'border-border bg-card';
}









