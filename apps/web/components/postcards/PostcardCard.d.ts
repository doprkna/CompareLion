interface PostcardCardProps {
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
    onOpen?: (postcard: any) => void;
    onRead?: (postcardId: string) => void;
    reading?: boolean;
}
export declare function PostcardCard({ postcard, type, onOpen, onRead, reading }: PostcardCardProps): import("react").JSX.Element;
export {};
