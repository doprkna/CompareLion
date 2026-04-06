interface PostcardViewerProps {
    postcard: {
        id: string;
        message: string;
        status: string;
        deliveryAt: string;
        createdAt: string;
        sender?: {
            id: string;
            username?: string;
            name?: string;
            avatarUrl?: string;
        };
        receiver?: {
            id: string;
            username?: string;
            name?: string;
            avatarUrl?: string;
        };
    };
    type: 'inbox' | 'sent';
    onClose: () => void;
    onRead?: (postcardId: string) => void;
    reading?: boolean;
}
export declare function PostcardViewer({ postcard, type, onClose, onRead, reading, }: PostcardViewerProps): import("react").JSX.Element;
export {};
