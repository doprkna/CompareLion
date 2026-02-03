/**
 * Radio Atom
 * v0.42.3 - C4 Step 4: Form atoms implementation
 * Single selection from group (grouping handled externally)
 */
import React from 'react';
export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'checked' | 'onChange'> {
    checked?: boolean;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    name: string;
    value: string;
    disabled?: boolean;
    label?: string;
    className?: string;
}
export declare function Radio({ checked, onChange, name, value, disabled, label, className, id, ...props }: RadioProps): React.JSX.Element;
