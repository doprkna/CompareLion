export type ToastType = 'xp' | 'gold' | 'item' | 'crit' | 'craft' | 'shop' | 'achievement' | 'rest' | 'info' | 'error' | 'boss';
export declare const TOAST_THEME: Record<ToastType, {
    icon: string;
    duration: number;
}>;
