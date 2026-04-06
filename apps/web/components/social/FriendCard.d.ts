import { Friend } from '@parel/core';
interface FriendCardProps {
    friend: Friend;
    onRemove?: () => void;
    removing?: boolean;
}
export declare function FriendCard({ friend, onRemove, removing }: FriendCardProps): import("react").JSX.Element;
export {};
