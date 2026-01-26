/**
 * System DTOs
 * Data transfer objects for system/metadata endpoints
 * v0.41.8 - C3 Step 9: DTO Consolidation Batch #1
 */
/**
 * Health check response data DTO
 * Used by /api/health endpoint
 */
export interface HealthDataDTO {
    /** Health check status (true if healthy) */
    ok: boolean;
    /** Health status string */
    status: string;
    /** Application version */
    version: string;
    /** ISO 8601 timestamp */
    timestamp: string;
    /** Environment name (development, production, etc.) */
    environment: string;
}
/**
 * Ping response data DTO
 * Used by /api/ping endpoint
 */
export interface PingDataDTO {
    /** Ping status */
    status: 'ok';
}
/**
 * Version response data DTO
 * Used by /api/version endpoint
 * Note: Uses VersionDTO from apps/web/lib/dto/versionDTO.ts
 */
export interface VersionResponseDTO {
    /** Version information (VersionDTO, string, or null) */
    version: {
        id: string;
        number: string;
        releasedAt: Date | string;
        notes: string | null;
    } | string | null;
}
