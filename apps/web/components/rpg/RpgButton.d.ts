/**
 * RPG Button Component
 * Unified button styling for Profile, Inventory, and Shop screens
 * v0.26.11 - UI Cohesion & Inventory Sync
 */
import { ReactNode, ButtonHTMLAttributes } from 'react';
interface RpgButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'disabled';
    children: ReactNode;
    className?: string;
}
export declare function RpgButton({ variant, children, className, disabled, ...props }: RpgButtonProps): import("react").JSX.Element;
export {};
