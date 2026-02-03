/**
 * Input Atom
 * v0.42.3 - C4 Step 4: Form atoms implementation
 * Text input for forms with validation states, labels, and error messages
 */
import React from 'react';
export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';
    placeholder?: string;
    disabled?: boolean;
    error?: boolean;
    errorMessage?: string;
    label?: string;
    helperText?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    className?: string;
}
export declare function Input({ value, onChange, type, placeholder, disabled, error, errorMessage, label, helperText, leftIcon, rightIcon, className, id, ...props }: InputProps): React.JSX.Element;
