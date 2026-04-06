/**
 * Photo Entry Card Component
 * Display photo challenge entries with voting
 * v0.37.12 - Photo Challenge
 */
interface PhotoEntry {
    id: string;
    userId: string;
    imageUrl: string;
    category: string;
    createdAt: string;
    user?: {
        id: string;
        name: string | null;
        image: string | null;
    };
    appealScore?: number;
    creativityScore?: number;
    userVotes?: {
        appeal: boolean;
        creativity: boolean;
    };
}
interface PhotoEntryCardProps {
    entry: PhotoEntry;
    onVoteChange?: () => void;
    className?: string;
}
export declare function PhotoEntryCard({ entry, onVoteChange, className }: PhotoEntryCardProps): import("react").JSX.Element;
export {};
