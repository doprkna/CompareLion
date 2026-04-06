/**
 * Onboarding Flow - Main Container
 * v0.24.0 - Phase I: Smart Onboarding
 *
 * Multi-step onboarding with fun emoji-based UI
 */
import type { OnboardingData } from '@parel/types/onboarding';
interface OnboardingFlowProps {
    initialData?: OnboardingData;
    onComplete?: () => void;
}
export default function OnboardingFlow({ initialData, onComplete }: OnboardingFlowProps): import("react").JSX.Element;
export {};
