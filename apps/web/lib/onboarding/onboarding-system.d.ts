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
export declare const ONBOARDING_STEPS: OnboardingStep[];
export declare const TUTORIAL_QUEST_STEPS: {
    step: number;
    title: string;
    description: string;
    target: string;
    xpReward: number;
}[];
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
export declare const TOOLTIP_CONFIGS: TooltipConfig[];
/**
 * PLACEHOLDER: Mark onboarding step complete
 */
export declare function completeOnboardingStep(userId: string, stepId: string): Promise<null>;
/**
 * PLACEHOLDER: Submit feedback
 */
export declare function submitFeedback(data: {
    userId: string;
    type: string;
    category?: string;
    title: string;
    description: string;
    page?: string;
    screenshot?: string;
}): Promise<null>;
