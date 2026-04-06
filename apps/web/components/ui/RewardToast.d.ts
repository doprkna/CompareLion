/**
 * RewardToast Component
 * v0.26.9 - Expanded with Framer Motion animations and unified theme system
 */
import React from 'react';
import { RewardToast } from '@parel/core/hooks/useRewardToast';
interface RewardToastProps {
    toast: RewardToast;
    index: number;
    onDismiss: (id: string) => void;
}
export declare function RewardToastComponent({ toast, index, onDismiss }: RewardToastProps): React.JSX.Element;
interface RewardToastContainerProps {
    toasts: RewardToast[];
    onDismiss: (id: string) => void;
}
export declare function RewardToastContainer({ toasts, onDismiss }: RewardToastContainerProps): React.JSX.Element | null;
export {};
