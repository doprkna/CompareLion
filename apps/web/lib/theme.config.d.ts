/**
 * Theme Configuration
 * Centralized theme tokens and design system constants
 */
export declare const SPACING: {
    readonly xs: "0.25rem";
    readonly sm: "0.5rem";
    readonly md: "1rem";
    readonly lg: "1.5rem";
    readonly xl: "2rem";
    readonly '2xl': "3rem";
    readonly '3xl': "4rem";
};
export declare const RADIUS: {
    readonly none: "0";
    readonly sm: "0.125rem";
    readonly md: "0.375rem";
    readonly lg: "0.5rem";
    readonly xl: "0.75rem";
    readonly '2xl': "1rem";
    readonly full: "9999px";
};
export declare const SHADOWS: {
    readonly sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)";
    readonly md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)";
    readonly lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)";
    readonly xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)";
    readonly '2xl': "0 25px 50px -12px rgb(0 0 0 / 0.25)";
    readonly inner: "inset 0 2px 4px 0 rgb(0 0 0 / 0.05)";
    readonly none: "none";
};
export declare const Z_INDEX: {
    readonly base: 0;
    readonly dropdown: 10;
    readonly sticky: 20;
    readonly fixed: 30;
    readonly modalBackdrop: 40;
    readonly modal: 50;
    readonly popover: 60;
    readonly tooltip: 70;
    readonly notification: 80;
};
export declare const BREAKPOINTS: {
    readonly sm: "640px";
    readonly md: "768px";
    readonly lg: "1024px";
    readonly xl: "1280px";
    readonly '2xl': "1536px";
};
export declare const TYPOGRAPHY: {
    readonly fontSize: {
        readonly xs: "0.75rem";
        readonly sm: "0.875rem";
        readonly base: "1rem";
        readonly lg: "1.125rem";
        readonly xl: "1.25rem";
        readonly '2xl': "1.5rem";
        readonly '3xl': "1.875rem";
        readonly '4xl': "2.25rem";
        readonly '5xl': "3rem";
    };
    readonly fontWeight: {
        readonly normal: "400";
        readonly medium: "500";
        readonly semibold: "600";
        readonly bold: "700";
        readonly extrabold: "800";
    };
    readonly lineHeight: {
        readonly tight: "1.25";
        readonly normal: "1.5";
        readonly relaxed: "1.75";
    };
};
export declare const TRANSITIONS: {
    readonly duration: {
        readonly fast: "150ms";
        readonly normal: "300ms";
        readonly slow: "500ms";
    };
    readonly timing: {
        readonly linear: "linear";
        readonly ease: "ease";
        readonly easeIn: "ease-in";
        readonly easeOut: "ease-out";
        readonly easeInOut: "ease-in-out";
    };
};
export declare const COLORS: {
    readonly KARMA: {
        readonly saint: "text-blue-400";
        readonly virtuous: "text-green-400";
        readonly good: "text-green-300";
        readonly neutral_good: "text-gray-300";
        readonly neutral: "text-gray-400";
        readonly neutral_bad: "text-gray-500";
        readonly chaotic: "text-red-300";
        readonly villain: "text-red-500";
    };
    readonly PRESTIGE: {
        readonly legendary: "text-yellow-400";
        readonly renowned: "text-purple-400";
        readonly distinguished: "text-blue-400";
        readonly respected: "text-green-400";
        readonly known: "text-gray-300";
        readonly emerging: "text-gray-400";
        readonly novice: "text-gray-500";
    };
    readonly DIFFICULTY: {
        readonly easy: "text-green-500";
        readonly medium: "text-yellow-500";
        readonly hard: "text-red-500";
    };
    readonly STATUS: {
        readonly success: "text-green-500";
        readonly warning: "text-yellow-500";
        readonly error: "text-red-500";
        readonly info: "text-blue-500";
    };
};
export declare const COMPONENTS: {
    readonly button: {
        readonly padding: {
            readonly sm: "0.5rem 1rem";
            readonly md: "0.75rem 1.5rem";
            readonly lg: "1rem 2rem";
        };
        readonly fontSize: {
            readonly sm: "0.875rem";
            readonly md: "1rem";
            readonly lg: "1.125rem";
        };
        readonly borderRadius: "0.375rem";
    };
    readonly card: {
        readonly padding: "1.5rem";
        readonly borderRadius: "0.5rem";
        readonly shadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)";
    };
    readonly input: {
        readonly padding: "0.5rem 0.75rem";
        readonly borderRadius: "0.375rem";
        readonly fontSize: "1rem";
    };
    readonly modal: {
        readonly backdropColor: "rgba(0, 0, 0, 0.5)";
        readonly borderRadius: "0.75rem";
        readonly padding: "2rem";
        readonly shadow: "0 25px 50px -12px rgb(0 0 0 / 0.25)";
    };
};
export declare const ANIMATIONS: {
    readonly fadeIn: {
        readonly keyframes: {
            readonly from: {
                readonly opacity: "0";
            };
            readonly to: {
                readonly opacity: "1";
            };
        };
        readonly duration: "300ms";
        readonly timing: "ease-out";
    };
    readonly fadeOut: {
        readonly keyframes: {
            readonly from: {
                readonly opacity: "1";
            };
            readonly to: {
                readonly opacity: "0";
            };
        };
        readonly duration: "300ms";
        readonly timing: "ease-in";
    };
    readonly slideUp: {
        readonly keyframes: {
            readonly from: {
                readonly transform: "translateY(10px)";
                readonly opacity: "0";
            };
            readonly to: {
                readonly transform: "translateY(0)";
                readonly opacity: "1";
            };
        };
        readonly duration: "300ms";
        readonly timing: "ease-out";
    };
    readonly slideDown: {
        readonly keyframes: {
            readonly from: {
                readonly transform: "translateY(-10px)";
                readonly opacity: "0";
            };
            readonly to: {
                readonly transform: "translateY(0)";
                readonly opacity: "1";
            };
        };
        readonly duration: "300ms";
        readonly timing: "ease-out";
    };
    readonly scale: {
        readonly keyframes: {
            readonly from: {
                readonly transform: "scale(0.95)";
                readonly opacity: "0";
            };
            readonly to: {
                readonly transform: "scale(1)";
                readonly opacity: "1";
            };
        };
        readonly duration: "150ms";
        readonly timing: "ease-out";
    };
    readonly spin: {
        readonly keyframes: {
            readonly from: {
                readonly transform: "rotate(0deg)";
            };
            readonly to: {
                readonly transform: "rotate(360deg)";
            };
        };
        readonly duration: "1s";
        readonly timing: "linear";
        readonly infinite: true;
    };
    readonly pulse: {
        readonly keyframes: {
            readonly '0%, 100%': {
                readonly opacity: "1";
            };
            readonly '50%': {
                readonly opacity: "0.5";
            };
        };
        readonly duration: "2s";
        readonly timing: "ease-in-out";
        readonly infinite: true;
    };
};
export declare function getResponsiveValue<T>(values: {
    sm?: T;
    md?: T;
    lg?: T;
    xl?: T;
    '2xl'?: T;
    default: T;
}): T;
export declare function combineTransition(...properties: string[]): string;
export type SpacingKey = keyof typeof SPACING;
export type RadiusKey = keyof typeof RADIUS;
export type ShadowKey = keyof typeof SHADOWS;
export type ZIndexKey = keyof typeof Z_INDEX;
export type BreakpointKey = keyof typeof BREAKPOINTS;
