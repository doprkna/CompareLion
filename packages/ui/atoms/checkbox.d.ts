/**
 * Checkbox Atom
 * v0.42.3 - C4 Step 4: Form atoms implementation
 * Binary selection input with checked, unchecked, indeterminate, and disabled states
 */
import React from 'react';
export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'checked' | 'onChange'> {
    checked?: boolean;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    disabled?: boolean;
    indeterminate?: boolean;
    label?: string;
    className?: string;
}
export declare function Checkbox({ checked, onChange, disabled, indeterminate, label, className, id, ...props }: CheckboxProps): React.JSX.Element;
