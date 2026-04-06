/**
 * Onboarding Step 5: Finish & Summary
 * v0.24.0 - Phase I
 */
import { type OnboardingData } from '@parel/types/onboarding';
interface StepFinishProps {
    data: OnboardingData;
    onSubmit: () => void;
    onBack: () => void;
    submitting: boolean;
}
export declare function StepFinish({ data, onSubmit, onBack, submitting }: StepFinishProps): import("react").JSX.Element;
export {};
