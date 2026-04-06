/**
 * Onboarding Step 1: Age Group
 * v0.24.0 - Phase I
 */
import { type AgeGroupId } from '@parel/types/onboarding';
interface StepAgeProps {
    value?: AgeGroupId;
    onSelect: (ageGroup: AgeGroupId) => void;
    onBack?: () => void;
}
export declare function StepAge({ value, onSelect, onBack }: StepAgeProps): import("react").JSX.Element;
export {};
