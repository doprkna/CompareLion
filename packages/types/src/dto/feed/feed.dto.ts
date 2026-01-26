/**
 * Feed DTOs
 * Data transfer objects for social feed posts
 * v0.41.10 - C3 Step 11: DTO Consolidation Batch #3
 */

/**
 * Feed user DTO
 * User information in feed posts
 */
export interface FeedUserDTO {
  /** User ID */
  id: string;
  /** Username */
  username?: string | null;
  /** Display name */
  name?: string | null;
  /** Avatar URL */
  avatarUrl?: string | null;
  /** User level */
  level?: number;
}

/**
 * Feed reactions DTO
 * Reactions structure for feed posts
 */
export interface FeedReactionsDTO {
  /** Reaction counts by type/emoji */
  counts: Record<string, number>;
  /** User's reactions */
  userReactions: string[];
  /** Total reaction count */
  total: number;
}

/**
 * Feed comment preview DTO
 * Comment preview in feed posts
 */
export interface FeedCommentPreviewDTO {
  /** Comment ID */
  id: string;
  /** User ID */
  userId: string;
  /** User info */
  user: FeedUserDTO;
  /** Comment content */
  content: string;
  /** Creation timestamp */
  createdAt: Date | string;
}

/**
 * Feed comments DTO
 * Comments structure for feed posts
 */
export interface FeedCommentsDTO {
  /** Comment previews (last 2) */
  preview: FeedCommentPreviewDTO[];
  /** Total comment count */
  total: number;
}

/**
 * Feed post preview DTO
 * Preview data based on post type
 */
export interface FeedPostPreviewDTO {
  /** For fight posts: won status */
  won?: boolean;
  /** For fight posts: number of rounds */
  rounds?: number;
  /** For loot posts: item name */
  itemName?: string;
  /** For loot posts: item icon */
  icon?: string;
  /** For loot posts: item rarity */
  rarity?: string;
  /** For achievement posts: achievement title */
  title?: string;
}

/**
 * Feed post DTO
 * Standard feed post structure
 */
export interface FeedPostDTO {
  /** Post ID */
  id: string;
  /** User ID */
  userId: string;
  /** Post type marker */
  postType: 'feed';
  /** User info */
  user: FeedUserDTO;
  /** Post type */
  type: string;
  /** Post content */
  content?: string | null;
  /** Reference ID (for fight/loot/achievement posts) */
  refId?: string | null;
  /** Preview data */
  preview?: FeedPostPreviewDTO | null;
  /** Creation timestamp */
  createdAt: Date | string;
  /** Reactions */
  reactions: FeedReactionsDTO;
  /** Comments */
  comments: FeedCommentsDTO;
}

/**
 * Compare post question context DTO
 * Question context for compare posts
 */
export interface ComparePostQuestionContextDTO {
  /** Question ID */
  id: string;
  /** Question text */
  text: string;
}

/**
 * Compare post DTO
 * Compare post structure
 */
export interface ComparePostDTO {
  /** Post ID */
  id: string;
  /** User ID */
  userId: string;
  /** Post type marker */
  postType: 'compare';
  /** User info */
  user: FeedUserDTO;
  /** Question ID (optional) */
  questionId?: string | null;
  /** Question context (optional) */
  questionContext?: ComparePostQuestionContextDTO | null;
  /** Post content */
  content: string;
  /** Compare value */
  value: number;
  /** Creation timestamp */
  createdAt: Date | string;
  /** Reactions */
  reactions: FeedReactionsDTO;
  /** Comments */
  comments: FeedCommentsDTO;
}

/**
 * Feed response DTO
 * Feed endpoint response (supports both FeedPost and ComparePost)
 */
export interface FeedResponseDTO {
  /** Posts list (FeedPost or ComparePost) */
  posts: (FeedPostDTO | ComparePostDTO)[];
  /** Next cursor for pagination */
  nextCursor: string | null;
  /** Whether there are more posts */
  hasMore: boolean;
}

