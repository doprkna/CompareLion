/**
 * Notifications Hook
 * v0.19.6 - Real-time notification management with toast integration
 */
interface Notification {
    id: string;
    type: string;
    title: string;
    body: string | null;
    isRead: boolean;
    createdAt: string;
    senderId: string | null;
}
interface UseNotificationsReturn {
    notifications: Notification[];
    unreadCount: number;
    loading: boolean;
    error: string | null;
    fetchNotifications: () => Promise<void>;
    markAsRead: (ids: string[]) => Promise<void>;
    markAllAsRead: () => Promise<void>;
}
export declare function useNotifications(): UseNotificationsReturn;
export {};
