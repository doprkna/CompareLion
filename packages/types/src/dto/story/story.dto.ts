/**
 * Story DTOs
 * Data transfer objects for story/narrative content
 * v0.41.7 - C3 Step 8: DTO Consolidation Foundation
 */

/**
 * Base Story DTO
 * Minimal story shape for narrative content
 * Note: Will be expanded in later steps with full story structure
 */
export interface StoryDTO {
  /** Story ID */
  id: string;
  /** Story title (optional) */
  title?: string;
  /** Story type */
  type?: 'weekly' | 'extended' | 'challenge';
  /** Creation timestamp (ISO 8601) */
  createdAt: string;
}

