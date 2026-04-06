/**
 * RPG Panel Layout
 * Unified layout wrapper for Profile, Inventory, and Shop screens
 * v0.26.11 - UI Cohesion & Inventory Sync
 */
import { ReactNode } from 'react';
interface RpgPanelLayoutProps {
    title: string;
    icon?: ReactNode;
    children: ReactNode;
    className?: string;
}
export declare function RpgPanelLayout({ title, icon, children, className }: RpgPanelLayoutProps): import("react").JSX.Element;
export {};
