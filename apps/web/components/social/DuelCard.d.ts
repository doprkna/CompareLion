import { Duel } from '@parel/core';
interface DuelCardProps {
    duel: Duel;
    currentUserId?: string;
    onComplete?: () => void;
    completing?: boolean;
}
export declare function DuelCard({ duel, currentUserId, onComplete, completing }: DuelCardProps): import("react").JSX.Element;
export {};
