/**
 * Notification DTOs
 * Data transfer objects for notifications
 * v0.41.9 - C3 Step 10: DTO Consolidation Batch #2
 */
/**
 * Notification DTO
 * Notification shape with read status
 */
export interface NotificationDTO {
    /** Notification ID */
    id: string;
    /** Notification type */
    type: string;
    /** Notification title */
    title: string;
    /** Notification message */
    message: string;
    /** Additional notification data (optional) */
    data?: Record<string, any> | null;
    /** Whether notification has been read */
    read: boolean;
    /** When notification was created */
    createdAt: Date | string;
}
