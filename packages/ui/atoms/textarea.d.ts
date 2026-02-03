/**
 * Textarea Atom
 * v0.42.3 - C4 Step 4: Form atoms implementation
 * Multi-line text input with validation, character count, and auto-resize
 */
import React from 'react';
export interface TextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'value' | 'onChange'> {
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    placeholder?: string;
    disabled?: boolean;
    error?: boolean;
    errorMessage?: string;
    rows?: number;
    autoResize?: boolean;
    helperText?: string;
    className?: string;
}
export declare function Textarea({ value, onChange, placeholder, disabled, error, errorMessage, rows, autoResize, helperText, className, id, ...props }: TextareaProps): React.JSX.Element;
