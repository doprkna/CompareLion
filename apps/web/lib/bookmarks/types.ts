/**
 * Bookmark Types
 * Shared types and interfaces for Question Bookmarks
 * v0.37.1 - Bookmark Question Feature
 */

/**
 * Bookmark interface
 */
export interface Bookmark {
  id: string;
  userId: string;
  questionId: string;
  createdAt: Date;
  // Relations (populated)
  question?: {
    id: string;
    text: string;
    category?: string | null;
  };
}

/**
 * Bookmark with question details (for API responses)
 */
export interface BookmarkWithQuestion extends Bookmark {
  question: {
    id: string;
    text: string;
    category?: string | null;
  };
}

