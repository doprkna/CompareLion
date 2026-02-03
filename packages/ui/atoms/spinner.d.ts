/**
 * Spinner Atom
 * v0.42.2 - C4 Step 3: Badge, Avatar, Divider, Spinner implementation
 * Loading indicator with accessible aria-label
 */
import React from 'react';
export type SpinnerSize = 'sm' | 'md' | 'lg';
export interface SpinnerProps {
    size?: SpinnerSize;
    className?: string;
    'aria-label'?: string;
}
export declare function Spinner({ size, className, 'aria-label': ariaLabel, }: SpinnerProps): React.JSX.Element;
