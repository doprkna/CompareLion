/**
 * Fallback Icon Component
 * v0.42.7 - C5 Step 2: Icon Registry Engine
 *
 * Displays a placeholder icon when the requested icon is missing or fails to load.
 * Logs missing icon names in development mode.
 */
import React from 'react';
import type { IconSvgProps } from './registry';
export interface FallbackIconProps extends IconSvgProps {
    missingName?: string;
}
/**
 * Fallback Icon Component
 *
 * Simple placeholder SVG that displays when an icon is missing.
 * Shows a box with a question mark in development mode.
 */
export declare function FallbackIcon({ size, className, 'aria-label': ariaLabel, 'aria-hidden': ariaHidden, missingName, }: FallbackIconProps): React.JSX.Element;
