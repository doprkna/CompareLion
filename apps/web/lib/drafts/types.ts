/**
 * Draft Review Queue Types
 * Shared types and interfaces for Draft Review Queue & Social Boosting
 * v0.37.5 - Draft Review Queue + Social Boosting (Placeholder)
 */

/**
 * Draft status enum
 */
export enum DraftStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

/**
 * Review decision enum
 */
export enum ReviewDecision {
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

/**
 * Draft interface
 */
export interface Draft {
  id: string;
  userId: string;
  content: any; // JSON or string - flexible
  status: DraftStatus;
  createdAt: Date;
  updatedAt: Date;
  // Relations (populated)
  user?: {
    id: string;
    username?: string | null;
    name?: string | null;
  };
  boostCount?: number;
}

/**
 * DraftBoost interface
 */
export interface DraftBoost {
  id: string;
  draftId: string;
  userId: string;
  createdAt: Date;
}

/**
 * DraftReview interface
 */
export interface DraftReview {
  id: string;
  draftId: string;
  reviewerId: string;
  decision: ReviewDecision;
  comment?: string | null;
  createdAt: Date;
}

