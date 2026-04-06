interface ShareButtonProps {
    shareCard?: {
        id: string;
        shareUrl: string;
        imageUrl?: string | null;
    };
    onShare?: () => void;
    className?: string;
}
export declare function ShareButton({ shareCard, onShare, className }: ShareButtonProps): import("react").JSX.Element;
export {};
