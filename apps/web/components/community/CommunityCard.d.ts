interface CommunityCardProps {
    creation: {
        id: string;
        title: string;
        type: string;
        content: any;
        likes: number;
        likesCount?: number;
        rewardXP?: number;
        rewardKarma?: number;
        createdAt: string;
        user: {
            id: string;
            username?: string;
            name?: string;
            avatarUrl?: string;
        };
        status?: string;
    };
    onLike?: (creationId: string) => void;
    liked?: boolean;
    liking?: boolean;
}
export declare function CommunityCard({ creation, onLike, liked, liking }: CommunityCardProps): import("react").JSX.Element;
export {};
