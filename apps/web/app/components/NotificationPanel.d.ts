/**
 * Notification Panel Component
 * Displays list of notifications
 * v0.40.17 - Story Notifications 1.0
 */
interface Notification {
    id: string;
    type: string;
    isRead: boolean;
    createdAt: string;
    data: any;
}
interface NotificationPanelProps {
    notifications: Notification[];
    loading: boolean;
    onClose: () => void;
    onMarkRead: (id: string) => void;
    onMarkAllRead: () => void;
}
export default function NotificationPanel({ notifications, loading, onClose, onMarkRead, onMarkAllRead, }: NotificationPanelProps): import("react").JSX.Element;
export {};
