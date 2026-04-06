/**
 * Loading Skeleton Components
 *
 * Provides shimmer/skeleton loading states for different content types
 * - Shows users that content is loading
 * - Prevents blank page flash
 * - Improves perceived performance
 */
/**
 * Generic shimmer effect
 */
export declare function Shimmer(): import("react").JSX.Element;
/**
 * Changelog loading skeleton
 */
export declare function ChangelogSkeleton(): import("react").JSX.Element;
/**
 * Card/List loading skeleton
 */
export declare function CardSkeleton({ count }: {
    count?: number;
}): import("react").JSX.Element;
/**
 * Table loading skeleton
 */
export declare function TableSkeleton({ rows, cols }: {
    rows?: number;
    cols?: number;
}): import("react").JSX.Element;
/**
 * Profile/Dashboard skeleton
 */
export declare function ProfileSkeleton(): import("react").JSX.Element;
/**
 * Generic content skeleton
 */
export declare function ContentSkeleton({ lines }: {
    lines?: number;
}): import("react").JSX.Element;
