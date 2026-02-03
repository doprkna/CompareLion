/**
 * Skeleton Atom
 * v0.42.4 - C4 Step 5: Interaction atoms implementation
 * Loading placeholder with various shapes and lightweight animation
 */
import React from 'react';
export interface SkeletonProps {
    width?: string | number;
    height?: string | number;
    rounded?: boolean;
    circle?: boolean;
    className?: string;
}
export declare function Skeleton({ width, height, rounded, circle, className, }: SkeletonProps): React.JSX.Element;
