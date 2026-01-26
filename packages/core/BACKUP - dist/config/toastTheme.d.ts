/**
 * Toast Theme Configuration
 * v0.26.9 - Reward & Event Toast Expansion
 *
 * Defines color schemes, icons, and animations for all toast types
 */
export type ToastType = 'xp' | 'gold' | 'item' | 'boss' | 'crit' | 'achievement' | 'craft' | 'shop' | 'rest' | 'info' | 'error';
export interface ToastTheme {
    color: string;
    icon: string;
    animation?: 'shake' | 'fade' | 'bounce' | 'slide';
    duration?: number;
}
export declare const TOAST_THEME: Record<ToastType, ToastTheme>;
/**
 * Get Tailwind classes for a toast type
 */
export declare function getToastStyles(type: ToastType): string;
