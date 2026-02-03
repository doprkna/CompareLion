/**
 * Switch Atom
 * v0.42.3 - C4 Step 4: Form atoms implementation
 * Toggle for binary settings with proper role="switch" accessibility
 */
import React from 'react';
export type SwitchSize = 'sm' | 'md' | 'lg';
export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'checked' | 'onChange' | 'size'> {
    checked?: boolean;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    disabled?: boolean;
    label?: string;
    size?: SwitchSize;
    className?: string;
    showCheckIcon?: boolean;
}
export declare function Switch({ checked, onChange, disabled, label, size, className, id, showCheckIcon, ...props }: SwitchProps): React.JSX.Element;
