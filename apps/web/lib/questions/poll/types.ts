/**
 * Poll Question Types
 * Shared types and interfaces for Poll Question Feature
 * v0.37.4 - Poll Option Feature
 */

/**
 * Poll option structure
 */
export interface PollOption {
  id: string; // e.g., "A", "B", "C"
  text: string;
  votes: number;
}

/**
 * Poll vote interface
 */
export interface PollVote {
  id: string;
  userId: string;
  questionId: string;
  optionId: string;
  createdAt: Date;
}

/**
 * Poll results with vote counts
 */
export interface PollResults {
  questionId: string;
  options: PollOption[];
  totalVotes: number;
  userVote?: string | null; // optionId that user voted for
}

/**
 * Create poll input
 */
export interface CreatePollInput {
  questionId: string;
  options: string[]; // Array of option texts
}

/**
 * Vote poll input
 */
export interface VotePollInput {
  questionId: string;
  optionId: string;
}

