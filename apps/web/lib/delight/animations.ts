/**
 * Animation System (v0.10.4)
 * 
 * PLACEHOLDER: Framer Motion animations for delight.
 */

export const ANIMATION_VARIANTS = {
  // Button animations
  buttonPress: {
    initial: { scale: 1 },
    tap: { scale: 0.95 },
    hover: { scale: 1.05 },
  },
  
  buttonBounce: {
    initial: { scale: 1, y: 0 },
    tap: { scale: 0.9, y: 2 },
    hover: { scale: 1.1, y: -2 },
  },
  
  // XP bar animations
  xpBarShimmer: {
    initial: { backgroundPosition: "0% 50%" },
    animate: {
      backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
    },
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "linear",
    },
  },
  
  xpBarFill: {
    initial: { width: 0 },
    animate: { width: "var(--progress)" },
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
    },
  },
  
  // Avatar glow
  avatarGlowPulse: {
    initial: { boxShadow: "0 0 10px var(--glow-color)" },
    animate: {
      boxShadow: [
        "0 0 10px var(--glow-color)",
        "0 0 30px var(--glow-color)",
        "0 0 10px var(--glow-color)",
      ],
    },
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
  
  // Prestige gain
  prestigeGlow: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: [0, 1, 0], scale: [0.8, 1.2, 0.8] },
    transition: {
      duration: 1.5,
      ease: "easeOut",
    },
  },
  
  // Card hover
  cardHover: {
    initial: { y: 0, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" },
    hover: {
      y: -4,
      boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
    },
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 17,
    },
  },
  
  // Toast entrance
  toastSlideIn: {
    initial: { x: 400, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: 400, opacity: 0 },
    transition: {
      type: "spring",
      stiffness: 500,
      damping: 30,
    },
  },
  
  // Confetti burst
  confettiBurst: {
    initial: { scale: 0, rotate: 0 },
    animate: {
      scale: [0, 1.5, 0],
      rotate: [0, 360, 720],
      y: [0, -100, -200],
    },
    transition: {
      duration: 2,
      ease: "easeOut",
    },
  },
  
  // Shimmer effect
  shimmer: {
    initial: { x: "-100%" },
    animate: { x: "200%" },
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "linear",
    },
  },
};

export const SPRING_CONFIGS = {
  gentle: {
    type: "spring" as const,
    stiffness: 100,
    damping: 15,
  },
  bouncy: {
    type: "spring" as const,
    stiffness: 400,
    damping: 17,
  },
  snappy: {
    type: "spring" as const,
    stiffness: 500,
    damping: 30,
  },
};

export const TRANSITION_SPEEDS = {
  slow: {
    duration: 0.5,
    ease: "easeInOut",
  },
  normal: {
    duration: 0.3,
    ease: "easeInOut",
  },
  fast: {
    duration: 0.15,
    ease: "easeOut",
  },
};











