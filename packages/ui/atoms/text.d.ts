/**
 * Text Atom (Typography)
 * v0.42.1 - C4 Step 2: Core atom implementation
 * Typography primitives for consistent text styling
 */
import React from 'react';
export type TextVariant = 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'label' | 'caption';
export type TextWeight = 'normal' | 'medium' | 'semibold' | 'bold';
export type TextAlign = 'left' | 'center' | 'right' | 'justify';
export type TextColor = 'default' | 'muted' | 'primary' | 'error' | 'success' | 'warning';
export interface TextProps {
    variant?: TextVariant;
    weight?: TextWeight;
    align?: TextAlign;
    color?: TextColor;
    truncate?: boolean;
    as?: keyof JSX.IntrinsicElements;
    children: React.ReactNode;
    className?: string;
}
export declare function Text({ variant, weight, align, color, truncate, as, children, className, }: TextProps): React.JSX.Element;
