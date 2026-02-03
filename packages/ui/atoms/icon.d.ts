/**
 * Icon Atom
 * v0.42.7 - C5 Step 2: Icon Registry Engine
 * Unified icon component with lazy-loading, caching, and fallback support
 */
import React from 'react';
import { type IconVariant } from '../icons/loader';
export type IconSize = 'sm' | 'md' | 'lg';
export interface IconProps {
    name: string;
    variant?: IconVariant;
    size?: IconSize | number;
    className?: string;
    'aria-label'?: string;
    'aria-hidden'?: boolean | string;
}
export declare function Icon({ name, variant, size, className, 'aria-label': ariaLabel, 'aria-hidden': ariaHidden, }: IconProps): React.JSX.Element;
