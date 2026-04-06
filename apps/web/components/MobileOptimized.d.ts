import { ReactNode } from 'react';
interface MobileOptimizedProps {
    children: ReactNode;
    className?: string;
}
/**
 * Wrapper component for mobile-optimized layouts
 * Adds mobile-specific padding and spacing
 */
export declare function MobileOptimized({ children, className }: MobileOptimizedProps): import("react").JSX.Element;
/**
 * Mobile-optimized card component
 */
interface MobileCardProps {
    children: ReactNode;
    className?: string;
    onClick?: () => void;
}
export declare function MobileCard({ children, className, onClick }: MobileCardProps): import("react").JSX.Element;
/**
 * Mobile-optimized grid layout
 */
interface MobileGridProps {
    children: ReactNode;
    cols?: 1 | 2 | 3;
    gap?: 'sm' | 'md' | 'lg';
    className?: string;
}
export declare function MobileGrid({ children, cols, gap, className }: MobileGridProps): import("react").JSX.Element;
/**
 * Mobile-optimized stack layout
 */
interface MobileStackProps {
    children: ReactNode;
    gap?: 'sm' | 'md' | 'lg';
    className?: string;
}
export declare function MobileStack({ children, gap, className }: MobileStackProps): import("react").JSX.Element;
/**
 * Mobile bottom action bar
 */
interface MobileBottomBarProps {
    children: ReactNode;
    className?: string;
}
export declare function MobileBottomBar({ children, className }: MobileBottomBarProps): import("react").JSX.Element;
/**
 * Mobile pull-to-refresh indicator
 */
interface PullToRefreshProps {
    onRefresh: () => Promise<void>;
    children: ReactNode;
}
export declare function PullToRefresh({ onRefresh, children }: PullToRefreshProps): import("react").JSX.Element;
export {};
