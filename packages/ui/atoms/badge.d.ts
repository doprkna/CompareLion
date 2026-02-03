/**
 * Badge Atom
 * v0.42.2 - C4 Step 3: Badge, Avatar, Divider, Spinner implementation
 * Small status or count indicator
 */
import React from 'react';
export type BadgeVariant = 'info' | 'success' | 'warning' | 'error' | 'neutral';
export type BadgeSize = 'sm' | 'md';
export interface BadgeProps {
    variant?: BadgeVariant;
    size?: BadgeSize;
    icon?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
}
export declare function Badge({ variant, size, icon, children, className, }: BadgeProps): React.JSX.Element;
