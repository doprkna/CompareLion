/**
 * Response DTOs
 * Endpoint-specific response shapes
 * v0.41.9 - C3 Step 10: DTO Consolidation Batch #2
 */
import type { ShopItemDTO, ItemDTO } from '../item';
import type { AchievementDTO } from '../achievement';
import type { NotificationDTO } from '../notification';
/**
 * Shop endpoint response DTO
 */
export interface ShopResponseDTO {
    /** Shop items */
    items: ShopItemDTO[];
    /** Total count */
    count: number;
}
/**
 * Items endpoint response DTO
 */
export interface ItemsResponseDTO {
    /** Items list */
    items: ItemDTO[];
    /** Total count */
    count: number;
    /** Whether admin view is enabled */
    isAdminView: boolean;
    /** Region filter applied (if any) */
    filterRegion: string | null;
}
/**
 * Achievements endpoint response DTO
 * Supports both flat list and grouped by category
 */
export interface AchievementsResponseDTO {
    /** Achievements (flat list or grouped by category) */
    achievements: AchievementDTO[] | Record<string, AchievementDTO[]>;
}
/**
 * Notifications endpoint response DTO
 */
export interface NotificationsResponseDTO {
    /** Notifications list */
    notifications: NotificationDTO[];
    /** Unread notifications count */
    unreadCount: number;
}
/**
 * Challenges endpoint response DTO
 */
export interface ChallengesResponseDTO {
    /** Daily challenges */
    daily: any[];
    /** Weekly challenges */
    weekly: any[];
    /** Timestamp */
    timestamp: string;
}
/**
 * Events endpoint response DTO
 */
export interface EventsResponseDTO {
    /** Events list */
    events: any[];
    /** Locale chain used */
    localeChain: string[];
}
/**
 * Profile endpoint response DTO
 */
export interface ProfileResponseDTO {
    /** User profile with stats */
    user: any;
}
