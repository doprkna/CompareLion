// sanity-fix: Minimal stub for TOAST_THEME to make @parel/core independent of web app
export type ToastType = 'xp' | 'gold' | 'item' | 'crit' | 'craft' | 'shop' | 'achievement' | 'rest' | 'info' | 'error' | 'boss';

export const TOAST_THEME: Record<ToastType, { icon: string; duration: number }> = {
  xp: { icon: '✨', duration: 3000 },
  gold: { icon: '💰', duration: 3000 },
  item: { icon: '📦', duration: 3000 },
  crit: { icon: '⚡', duration: 2000 },
  craft: { icon: '🔨', duration: 3000 },
  shop: { icon: '🛒', duration: 3000 },
  achievement: { icon: '🏅', duration: 5000 },
  rest: { icon: '💤', duration: 3000 },
  info: { icon: 'ℹ️', duration: 5000 },
  error: { icon: '❌', duration: 5000 },
  boss: { icon: '👹', duration: 5000 },
};

