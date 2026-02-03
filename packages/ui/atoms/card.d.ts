/**
 * Card Atom
 * v0.42.1 - C4 Step 2: Core atom implementation
 * Container for grouped content with elevation, borders, and padding
 */
import React from 'react';
export type CardVariant = 'base' | 'elevated' | 'bordered' | 'interactive';
export interface CardProps {
    variant?: CardVariant;
    padding?: 'none' | 'sm' | 'md' | 'lg';
    header?: React.ReactNode;
    footer?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
    onClose?: () => void;
}
export declare function Card({ variant, padding, header, footer, children, className, onClick, onClose, }: CardProps): React.JSX.Element;
