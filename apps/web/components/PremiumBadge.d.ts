interface PremiumBadgeProps {
    tier: 'PREMIUM' | 'CREATOR';
    size?: 'sm' | 'md' | 'lg';
    animated?: boolean;
}
export declare function PremiumBadge({ tier, size, animated }: PremiumBadgeProps): import("react").JSX.Element;
interface LockedFeatureProps {
    featureName: string;
    requiredTier: 'PREMIUM' | 'CREATOR';
    onUpgrade?: () => void;
}
export declare function LockedFeature({ featureName, requiredTier, onUpgrade }: LockedFeatureProps): import("react").JSX.Element;
export declare function PremiumFeatureGate({ children, featureName, requiredTier, userTier, onUpgrade, }: {
    children: React.ReactNode;
    featureName: string;
    requiredTier: 'PREMIUM' | 'CREATOR';
    userTier: 'FREE' | 'PREMIUM' | 'CREATOR';
    onUpgrade?: () => void;
}): import("react").JSX.Element;
export {};
