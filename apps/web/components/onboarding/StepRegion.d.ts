/**
 * Onboarding Step 2: Region
 * v0.24.0 - Phase I
 */
import { type RegionId } from '@parel/types/onboarding';
interface StepRegionProps {
    value?: RegionId;
    onSelect: (region: RegionId) => void;
    onBack: () => void;
}
export declare function StepRegion({ value, onSelect, onBack }: StepRegionProps): import("react").JSX.Element;
export {};
