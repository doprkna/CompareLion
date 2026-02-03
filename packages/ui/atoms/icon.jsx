'use client';
/**
 * Icon Atom
 * v0.42.7 - C5 Step 2: Icon Registry Engine
 * Unified icon component with lazy-loading, caching, and fallback support
 */
import React, { useEffect, useState } from 'react';
import { loadIcon } from '../icons/loader';
import { FallbackIcon } from '../icons/fallback';
const sizeMap = {
    sm: 16,
    md: 24,
    lg: 32,
};
export function Icon({ name, variant, size = 'md', className = '', 'aria-label': ariaLabel, 'aria-hidden': ariaHidden, }) {
    const [IconComponent, setIconComponent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    // Calculate pixel size
    const pixelSize = typeof size === 'number' ? size : sizeMap[size];
    // Load icon when name or variant changes
    useEffect(() => {
        setLoading(true);
        setError(false);
        loadIcon(name, variant)
            .then((component) => {
            setIconComponent(() => component);
            setLoading(false);
        })
            .catch((err) => {
            if (process.env.NODE_ENV === 'development') {
                console.error(`[Icon] Failed to load icon "${name}":`, err);
            }
            setError(true);
            setLoading(false);
        });
    }, [name, variant]);
    // Determine accessibility attributes
    const isHidden = ariaHidden !== undefined ? ariaHidden : !ariaLabel;
    const accessibilityProps = isHidden
        ? { 'aria-hidden': true }
        : { 'aria-label': ariaLabel };
    // Icon props
    const iconProps = {
        size: pixelSize,
        className,
        ...accessibilityProps,
    };
    // Show fallback while loading or on error
    if (loading || error || !IconComponent) {
        return <FallbackIcon {...iconProps} missingName={name}/>;
    }
    // Render loaded icon
    return <IconComponent {...iconProps}/>;
}
