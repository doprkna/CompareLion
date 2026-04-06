interface SharePreviewProps {
    shareCard: {
        id: string;
        type: string;
        imageUrl?: string | null;
        caption?: string | null;
        shareUrl: string;
    };
    loading?: boolean;
}
export declare function SharePreview({ shareCard, loading }: SharePreviewProps): import("react").JSX.Element;
export {};
