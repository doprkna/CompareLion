/**
 * Animation System (v0.10.4)
 *
 * PLACEHOLDER: Framer Motion animations for delight.
 */
export declare const ANIMATION_VARIANTS: {
    buttonPress: {
        initial: {
            scale: number;
        };
        tap: {
            scale: number;
        };
        hover: {
            scale: number;
        };
    };
    buttonBounce: {
        initial: {
            scale: number;
            y: number;
        };
        tap: {
            scale: number;
            y: number;
        };
        hover: {
            scale: number;
            y: number;
        };
    };
    xpBarShimmer: {
        initial: {
            backgroundPosition: string;
        };
        animate: {
            backgroundPosition: string[];
        };
        transition: {
            duration: number;
            repeat: number;
            ease: string;
        };
    };
    xpBarFill: {
        initial: {
            width: number;
        };
        animate: {
            width: string;
        };
        transition: {
            type: string;
            stiffness: number;
            damping: number;
        };
    };
    avatarGlowPulse: {
        initial: {
            boxShadow: string;
        };
        animate: {
            boxShadow: string[];
        };
        transition: {
            duration: number;
            repeat: number;
            ease: string;
        };
    };
    prestigeGlow: {
        initial: {
            opacity: number;
            scale: number;
        };
        animate: {
            opacity: number[];
            scale: number[];
        };
        transition: {
            duration: number;
            ease: string;
        };
    };
    cardHover: {
        initial: {
            y: number;
            boxShadow: string;
        };
        hover: {
            y: number;
            boxShadow: string;
        };
        transition: {
            type: string;
            stiffness: number;
            damping: number;
        };
    };
    toastSlideIn: {
        initial: {
            x: number;
            opacity: number;
        };
        animate: {
            x: number;
            opacity: number;
        };
        exit: {
            x: number;
            opacity: number;
        };
        transition: {
            type: string;
            stiffness: number;
            damping: number;
        };
    };
    confettiBurst: {
        initial: {
            scale: number;
            rotate: number;
        };
        animate: {
            scale: number[];
            rotate: number[];
            y: number[];
        };
        transition: {
            duration: number;
            ease: string;
        };
    };
    shimmer: {
        initial: {
            x: string;
        };
        animate: {
            x: string;
        };
        transition: {
            duration: number;
            repeat: number;
            ease: string;
        };
    };
};
export declare const SPRING_CONFIGS: {
    gentle: {
        type: "spring";
        stiffness: number;
        damping: number;
    };
    bouncy: {
        type: "spring";
        stiffness: number;
        damping: number;
    };
    snappy: {
        type: "spring";
        stiffness: number;
        damping: number;
    };
};
export declare const TRANSITION_SPEEDS: {
    slow: {
        duration: number;
        ease: string;
    };
    normal: {
        duration: number;
        ease: string;
    };
    fast: {
        duration: number;
        ease: string;
    };
};
