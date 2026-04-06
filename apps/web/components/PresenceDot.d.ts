/**
 * PresenceDot Component
 *
 * Shows online/offline status indicator for a user.
 * Updates in real-time via event bus.
 */
interface PresenceDotProps {
    userId: string;
    className?: string;
}
export default function PresenceDot({ userId, className }: PresenceDotProps): import("react").JSX.Element;
export {};
