/**
 * Select Atom
 * v0.42.3 - C4 Step 4: Form atoms implementation
 * Dropdown selection component (single-select only, multi-select deferred)
 */
import React from 'react';
export interface SelectOption {
    value: string;
    label: string;
    disabled?: boolean;
}
export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'value' | 'onChange'> {
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    options: SelectOption[];
    disabled?: boolean;
    label?: string;
    placeholder?: string;
    helperText?: string;
    className?: string;
}
export declare function Select({ value, onChange, options, disabled, label, placeholder, helperText, className, id, ...props }: SelectProps): React.JSX.Element;
