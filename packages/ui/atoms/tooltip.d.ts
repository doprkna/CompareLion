/**
 * Tooltip Atom
 * v0.42.4 - C4 Step 5: Interaction atoms implementation
 * Contextual information on hover/focus with simple positioning
 */
import React from 'react';
export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';
export interface TooltipProps {
    content: React.ReactNode;
    children: React.ReactElement;
    placement?: TooltipPlacement;
    delay?: number;
    className?: string;
    showInfoIcon?: boolean;
}
export declare function Tooltip({ content, children, placement, delay, className, showInfoIcon, }: TooltipProps): React.JSX.Element;
