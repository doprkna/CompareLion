/**
 * Progress Atom
 * v0.42.4 - C4 Step 5: Interaction atoms implementation
 * Progress indicator (bar only, circular deferred)
 */
import React from 'react';
export type ProgressSize = 'sm' | 'md' | 'lg';
export interface ProgressProps {
    value: number;
    label?: string;
    size?: ProgressSize;
    className?: string;
}
export declare function Progress({ value, label, size, className, }: ProgressProps): React.JSX.Element;
