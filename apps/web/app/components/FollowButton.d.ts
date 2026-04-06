/**
 * Follow Button Component
 * Button to follow/unfollow a user
 * v0.36.42 - Social Systems 1.0
 */
interface FollowButtonProps {
    targetUserId: string;
    className?: string;
    onFollowChange?: (isFollowing: boolean) => void;
}
export declare function FollowButton({ targetUserId, className, onFollowChange }: FollowButtonProps): import("react").JSX.Element;
export {};
