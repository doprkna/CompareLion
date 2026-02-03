'use client';
/**
 * Text Atom (Typography)
 * v0.42.1 - C4 Step 2: Core atom implementation
 * Typography primitives for consistent text styling
 */
import React from 'react';
const variantStyles = {
    h1: { fontSize: 'text-4xl', lineHeight: 'leading-tight', defaultTag: 'h1' },
    h2: { fontSize: 'text-3xl', lineHeight: 'leading-tight', defaultTag: 'h2' },
    h3: { fontSize: 'text-2xl', lineHeight: 'leading-snug', defaultTag: 'h3' },
    h4: { fontSize: 'text-xl', lineHeight: 'leading-snug', defaultTag: 'h4' },
    body: { fontSize: 'text-base', lineHeight: 'leading-relaxed', defaultTag: 'p' },
    label: { fontSize: 'text-sm', lineHeight: 'leading-normal', defaultTag: 'span' },
    caption: { fontSize: 'text-xs', lineHeight: 'leading-normal', defaultTag: 'span' },
};
const weightStyles = {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
};
const alignStyles = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
    justify: 'text-justify',
};
const colorStyles = {
    default: 'text-gray-900',
    muted: 'text-gray-600',
    primary: 'text-blue-600',
    error: 'text-red-600',
    success: 'text-green-600',
    warning: 'text-yellow-600',
};
export function Text({ variant = 'body', weight, align, color = 'default', truncate = false, as, children, className = '', }) {
    const variantStyle = variantStyles[variant];
    const defaultWeight = variant === 'h1' || variant === 'h2' || variant === 'h3' || variant === 'h4' ? 'bold' : 'normal';
    const finalWeight = weight || defaultWeight;
    const baseStyles = `${variantStyle.fontSize} ${variantStyle.lineHeight} ${weightStyles[finalWeight]} ${colorStyles[color]}`;
    const alignClass = align ? alignStyles[align] : '';
    const truncateClass = truncate ? 'truncate' : '';
    const combinedStyles = `${baseStyles} ${alignClass} ${truncateClass} ${className}`.trim();
    const Tag = as || variantStyle.defaultTag;
    return (<Tag className={combinedStyles}>
      {children}
    </Tag>);
}
