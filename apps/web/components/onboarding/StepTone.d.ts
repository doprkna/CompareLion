/**
 * Onboarding Step 4: Tone Preference
 * v0.24.0 - Phase I
 */
import { type ToneId } from '@parel/types/onboarding';
interface StepToneProps {
    value?: ToneId;
    onSelect: (tone: ToneId) => void;
    onBack: () => void;
}
export declare function StepTone({ value, onSelect, onBack }: StepToneProps): import("react").JSX.Element;
export {};
