/**
 * Photo Upload Card Component
 * Upload snack photos to challenges
 * v0.37.12 - Photo Challenge
 */
interface PhotoUploadCardProps {
    onUploadComplete?: () => void;
    className?: string;
}
export declare function PhotoUploadCard({ onUploadComplete, className }: PhotoUploadCardProps): import("react").JSX.Element;
export {};
