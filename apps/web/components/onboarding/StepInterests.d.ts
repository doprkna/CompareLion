/**
 * Onboarding Step 3: Interests
 * v0.24.0 - Phase I
 */
import { type InterestId } from '@parel/types/onboarding';
interface StepInterestsProps {
    value: InterestId[];
    onSelect: (interests: InterestId[]) => void;
    onBack: () => void;
}
export declare function StepInterests({ value, onSelect, onBack }: StepInterestsProps): import("react").JSX.Element;
export {};
