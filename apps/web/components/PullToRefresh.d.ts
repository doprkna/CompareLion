import { ReactNode } from 'react';
interface PullToRefreshProps {
    onRefresh: () => Promise<void>;
    children: ReactNode;
    threshold?: number;
}
export declare function PullToRefresh({ onRefresh, children, threshold }: PullToRefreshProps): import("react").JSX.Element;
export {};
