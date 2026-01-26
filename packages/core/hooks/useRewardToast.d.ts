/**
 * useRewardToast Hook
 *
 * v0.26.9 - Unified toast system for all event types
 *
 * Manages toast notifications for combat, rewards, achievements, crafting, shop, rest, etc.
 * Provides a queue system with auto-dismiss and smart stacking.
 *
 * Usage:
 * ```tsx
 * const { pushToast } = useRewardToast();
 *
 * pushToast({ type: 'xp', amount: 50, message: 'Gained XP!' });
 * pushToast({ type: 'gold', amount: 25 });
 * pushToast({ type: 'crit', message: 'Critical hit!' });
 * pushToast({ type: 'craft', message: 'Forged Epic Sword' });
 * pushToast({ type: 'error', message: 'Not enough gold', persist: true });
 * ```
 */
import { ToastType } from './toastTheme';
export type RewardType = ToastType;
export interface RewardToast {
    id: string;
    type: ToastType;
    amount?: number;
    xp?: number;
    gold?: number;
    message: string;
    timestamp: number;
    persist?: boolean;
    icon?: string;
}
export interface PushToastParams {
    type: ToastType;
    amount?: number;
    xp?: number;
    gold?: number;
    message?: string;
    multiplier?: number;
    persist?: boolean;
    icon?: string;
}
export declare function useRewardToast(): {
    toasts: any;
    pushToast: any;
    dismissToast: any;
};
