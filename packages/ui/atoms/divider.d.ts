/**
 * Divider Atom
 * v0.42.2 - C4 Step 3: Badge, Avatar, Divider, Spinner implementation
 * Visual separator between sections
 */
import React from 'react';
export type DividerOrientation = 'horizontal' | 'vertical';
export interface DividerProps {
    orientation?: DividerOrientation;
    className?: string;
}
export declare function Divider({ orientation, className, }: DividerProps): React.JSX.Element;
