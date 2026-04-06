interface Challenge {
    id: string;
    type: string;
    status: string;
    message: string | null;
    prompt: string | null;
    response: string | null;
    rewardXp: number;
    rewardKarma: number;
    createdAt: string;
    initiator: {
        id: string;
        name: string | null;
        email: string;
        image: string | null;
    };
    receiver: {
        id: string;
        name: string | null;
        email: string;
        image: string | null;
    };
}
interface ChallengeCardProps {
    challenge: Challenge;
    currentUserId: string;
    onUpdate: () => void;
}
export default function ChallengeCard({ challenge, currentUserId, onUpdate }: ChallengeCardProps): import("react").JSX.Element;
export {};
