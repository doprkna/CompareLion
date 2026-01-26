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
