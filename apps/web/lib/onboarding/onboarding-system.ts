/**
 * Onboarding & Feedback (v0.10.3)
 * 
 * PLACEHOLDER: Lightweight onboarding for new testers.
 */

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: string;
  action?: string;
  xpReward?: number;
}

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: "welcome",
    title: "Welcome to PareL!",
    description: "Your gamified learning adventure begins here",
    icon: "🎉",
  },
  {
    id: "dashboard",
    title: "Your Dashboard",
    description: "Track your XP, level, and achievements",
    icon: "📊",
  },
  {
    id: "answer",
    title: "Answer a Question",
    description: "Start earning XP by answering questions",
    icon: "💬",
    action: "Complete your first question",
    xpReward: 10,
  },
  {
    id: "compare",
    title: "Compare Profiles",
    description: "See how you stack up against others",
    icon: "⇄",
    action: "Compare with another user",
    xpReward: 10,
  },
  {
    id: "challenge",
    title: "Send a Challenge",
    description: "Challenge a friend to truth or dare",
    icon: "⚔️",
    action: "Send your first challenge",
    xpReward: 30,
  },
];

export const TUTORIAL_QUEST_STEPS = [
  {
    step: 1,
    title: "Explore Your Profile",
    description: "Visit your profile page to see your stats",
    target: "/profile",
    xpReward: 10,
  },
  {
    step: 2,
    title: "Answer Your First Question",
    description: "Complete a flow to earn XP",
    target: "/flow",
    xpReward: 20,
  },
  {
    step: 3,
    title: "Connect with Others",
    description: "Send a message or challenge",
    target: "/friends",
    xpReward: 20,
  },
];

export interface TooltipConfig {
  tooltipId: string;
  page: string;
  elementId: string;
  title: string;
  description: string;
  position: "top" | "bottom" | "left" | "right";
  showOnce: boolean;
  priority: number;
}

export const TOOLTIP_CONFIGS: TooltipConfig[] = [
  {
    tooltipId: "xp_bar",
    page: "/main",
    elementId: "xp-progress",
    title: "XP Progress",
    description: "Earn XP to level up and unlock new features",
    position: "bottom",
    showOnce: true,
    priority: 10,
  },
  {
    tooltipId: "faction_selector",
    page: "/main",
    elementId: "faction-widget",
    title: "Join a Faction",
    description: "Choose your moral alignment for bonuses",
    position: "right",
    showOnce: true,
    priority: 5,
  },
  {
    tooltipId: "daily_quests",
    page: "/main",
    elementId: "quest-board",
    title: "Daily Quests",
    description: "Complete quests for rewards",
    position: "left",
    showOnce: true,
    priority: 8,
  },
  {
    tooltipId: "compare_button",
    page: "/profile",
    elementId: "compare-btn",
    title: "Compare Stats",
    description: "See how you compare to other players",
    position: "top",
    showOnce: true,
    priority: 7,
  },
];

/**
 * PLACEHOLDER: Mark onboarding step complete
 */
export async function completeOnboardingStep(
  userId: string,
  stepId: string
) {
  console.log(`[Onboarding] PLACEHOLDER: Would mark step ${stepId} complete for user ${userId}`);
  
  // PLACEHOLDER: Would update OnboardingProgress
  return null;
}

/**
 * PLACEHOLDER: Submit feedback
 */
export async function submitFeedback(data: {
  userId: string;
  type: string;
  category?: string;
  title: string;
  description: string;
  page?: string;
  screenshot?: string;
}) {
  console.log(`[Feedback] PLACEHOLDER: Would submit ${data.type} from user ${data.userId}`);
  
  // PLACEHOLDER: Would execute
  // - Create feedback submission
  // - Send to admin email or Discord webhook
  // - Notify admins
  
  return null;
}










