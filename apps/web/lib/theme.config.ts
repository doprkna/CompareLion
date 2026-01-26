/**
 * Theme Configuration
 * Centralized theme tokens and design system constants
 */

import { COLOR_CONSTANTS } from '@parel/core/config/constants';

// ========== SPACING ==========
export const SPACING = {
  xs: '0.25rem',    // 4px
  sm: '0.5rem',     // 8px
  md: '1rem',       // 16px
  lg: '1.5rem',     // 24px
  xl: '2rem',       // 32px
  '2xl': '3rem',    // 48px
  '3xl': '4rem',    // 64px
} as const;

// ========== BORDER RADIUS ==========
export const RADIUS = {
  none: '0',
  sm: '0.125rem',   // 2px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  full: '9999px',
} as const;

// ========== SHADOWS ==========
export const SHADOWS = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  none: 'none',
} as const;

// ========== Z-INDEX SCALE ==========
export const Z_INDEX = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  fixed: 30,
  modalBackdrop: 40,
  modal: 50,
  popover: 60,
  tooltip: 70,
  notification: 80,
} as const;

// ========== BREAKPOINTS ==========
export const BREAKPOINTS = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// ========== TYPOGRAPHY ==========
export const TYPOGRAPHY = {
  fontSize: {
    xs: '0.75rem',      // 12px
    sm: '0.875rem',     // 14px
    base: '1rem',       // 16px
    lg: '1.125rem',     // 18px
    xl: '1.25rem',      // 20px
    '2xl': '1.5rem',    // 24px
    '3xl': '1.875rem',  // 30px
    '4xl': '2.25rem',   // 36px
    '5xl': '3rem',      // 48px
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
  lineHeight: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.75',
  },
} as const;

// ========== TRANSITIONS ==========
export const TRANSITIONS = {
  duration: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
  },
  timing: {
    linear: 'linear',
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  },
} as const;

// ========== COLOR ALIASES ==========
export const COLORS = COLOR_CONSTANTS;

// ========== COMPONENT THEME TOKENS ==========
export const COMPONENTS = {
  button: {
    padding: {
      sm: '0.5rem 1rem',
      md: '0.75rem 1.5rem',
      lg: '1rem 2rem',
    },
    fontSize: {
      sm: TYPOGRAPHY.fontSize.sm,
      md: TYPOGRAPHY.fontSize.base,
      lg: TYPOGRAPHY.fontSize.lg,
    },
    borderRadius: RADIUS.md,
  },
  card: {
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    shadow: SHADOWS.md,
  },
  input: {
    padding: '0.5rem 0.75rem',
    borderRadius: RADIUS.md,
    fontSize: TYPOGRAPHY.fontSize.base,
  },
  modal: {
    backdropColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    shadow: SHADOWS['2xl'],
  },
} as const;

// ========== ANIMATION PRESETS ==========
export const ANIMATIONS = {
  fadeIn: {
    keyframes: {
      from: { opacity: '0' },
      to: { opacity: '1' },
    },
    duration: TRANSITIONS.duration.normal,
    timing: TRANSITIONS.timing.easeOut,
  },
  fadeOut: {
    keyframes: {
      from: { opacity: '1' },
      to: { opacity: '0' },
    },
    duration: TRANSITIONS.duration.normal,
    timing: TRANSITIONS.timing.easeIn,
  },
  slideUp: {
    keyframes: {
      from: { transform: 'translateY(10px)', opacity: '0' },
      to: { transform: 'translateY(0)', opacity: '1' },
    },
    duration: TRANSITIONS.duration.normal,
    timing: TRANSITIONS.timing.easeOut,
  },
  slideDown: {
    keyframes: {
      from: { transform: 'translateY(-10px)', opacity: '0' },
      to: { transform: 'translateY(0)', opacity: '1' },
    },
    duration: TRANSITIONS.duration.normal,
    timing: TRANSITIONS.timing.easeOut,
  },
  scale: {
    keyframes: {
      from: { transform: 'scale(0.95)', opacity: '0' },
      to: { transform: 'scale(1)', opacity: '1' },
    },
    duration: TRANSITIONS.duration.fast,
    timing: TRANSITIONS.timing.easeOut,
  },
  spin: {
    keyframes: {
      from: { transform: 'rotate(0deg)' },
      to: { transform: 'rotate(360deg)' },
    },
    duration: '1s',
    timing: TRANSITIONS.timing.linear,
    infinite: true,
  },
  pulse: {
    keyframes: {
      '0%, 100%': { opacity: '1' },
      '50%': { opacity: '0.5' },
    },
    duration: '2s',
    timing: TRANSITIONS.timing.easeInOut,
    infinite: true,
  },
} as const;

// ========== THEME UTILITIES ==========
export function getResponsiveValue<T>(
  values: { sm?: T; md?: T; lg?: T; xl?: T; '2xl'?: T; default: T }
): T {
  // This would need window.matchMedia in client context
  // For SSR, return default
  return values.default;
}

export function combineTransition(...properties: string[]): string {
  return properties
    .map(prop => `${prop} ${TRANSITIONS.duration.normal} ${TRANSITIONS.timing.ease}`)
    .join(', ');
}

// Type exports
export type SpacingKey = keyof typeof SPACING;
export type RadiusKey = keyof typeof RADIUS;
export type ShadowKey = keyof typeof SHADOWS;
export type ZIndexKey = keyof typeof Z_INDEX;
export type BreakpointKey = keyof typeof BREAKPOINTS;


