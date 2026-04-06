/**
 * Feature Guard Component
 * Conditionally renders content based on feature flags
 * v0.35.12 - Admin/dev bypass with isAdminView
 */
import { ReactNode } from 'react';
import { FEATURES } from '@/lib/config';
interface FeatureGuardProps {
    feature: keyof typeof FEATURES;
    children: ReactNode;
    fallback?: ReactNode;
    redirectTo?: string;
}
export declare function FeatureGuard({ feature, children, fallback, redirectTo, }: FeatureGuardProps): import("react").JSX.Element | null;
/**
 * Hook to check if a feature is enabled
 */
export declare function useFeature(feature: keyof typeof FEATURES): boolean;
export {};
