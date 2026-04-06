interface FeedItemProps {
    item: {
        id: string;
        type: string;
        title: string;
        description?: string;
        metadata?: any;
        createdAt: string;
        user: {
            id: string;
            name: string;
            image?: string;
            level?: number;
        };
        reactions: Record<string, number>;
        totalReactions: number;
        userReaction?: string | null;
    };
    onReactionChange?: () => void;
}
export default function FeedItem({ item, onReactionChange }: FeedItemProps): import("react").JSX.Element;
export {};
