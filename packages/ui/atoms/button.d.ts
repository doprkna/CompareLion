/**
 * Button Atom
 * v0.42.1 - C4 Step 2: Core atom implementation
 * Primary interactive element for user actions
 */
import React from 'react';
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';
export interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'disabled'> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    loading?: boolean;
    disabled?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    children: React.ReactNode;
}
export declare function Button({ variant, size, loading, disabled, leftIcon, rightIcon, children, className, onClick, ...props }: ButtonProps): React.JSX.Element;
