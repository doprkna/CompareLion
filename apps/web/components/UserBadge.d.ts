/**
 * UserBadge Component
 *
 * Displays user identity badge based on type.
 * Types: none, subscriber, vip, wtf
 */
interface UserBadgeProps {
    type: string;
    className?: string;
}
export default function UserBadge({ type, className }: UserBadgeProps): import("react").JSX.Element | null;
/**
 * Badge Icon Only (compact version)
 */
export declare function UserBadgeIcon({ type, className }: UserBadgeProps): import("react").JSX.Element | null;
export {};
