/**
 * World Chronicle Types & Enums
 * Shared types, enums, and interfaces for World Chronicle 2.0
 * v0.36.43 - World Chronicle 2.0
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * XP Leader entry
 */
export interface XPLeader {
  userId: string;
  username?: string | null;
  name?: string | null;
  xp: number;
  level: number;
}

/**
 * Funniest answer entry
 */
export interface FunniestAnswer {
  userId: string;
  username?: string | null;
  questionId?: string | null;
  answerText: string;
  upvotes?: number;
  timestamp: Date;
}

/**
 * Rare drop entry
 */
export interface RareDrop {
  userId: string;
  username?: string | null;
  itemId: string;
  itemName: string;
  rarity: string;
  timestamp: Date;
}

/**
 * Highlight event entry
 */
export interface HighlightEvent {
  eventId: string;
  eventName: string;
  description?: string | null;
  startAt: Date;
  endAt: Date;
  participantCount?: number;
}

/**
 * Chronicle stats snapshot
 */
export interface ChronicleStatsSnapshot {
  xpLeaders: XPLeader[];
  funniestAnswers: FunniestAnswer[];
  rareDrops: RareDrop[];
  events: HighlightEvent[];
  globalStats?: {
    totalXP: number;
    totalGold: number;
    totalMissionsCompleted: number;
    totalFightsWon: number;
    activeUsers: number;
  };
}

/**
 * Chronicle entry
 */
export interface ChronicleEntry {
  id: string;
  seasonId?: string | null;
  weekNumber: number;
  summaryJSON: ChronicleStatsSnapshot;
  aiStory?: string | null;
  createdAt: Date;
  // Relations (populated)
  season?: {
    id: string;
    name: string;
  } | null;
}

/**
 * Chronicle generation input
 */
export interface ChronicleGenerationInput {
  seasonId?: string | null;
  weekNumber: number;
  startDate: Date;
  endDate: Date;
}

/**
 * Chronicle generation result
 */
export interface ChronicleGenerationResult {
  success: boolean;
  chronicleId?: string;
  preview?: ChronicleStatsSnapshot;
  error?: string;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Calculate week number from date
 */
export function getWeekNumber(date: Date): number {
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const days = Math.floor((date.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
  return Math.ceil((days + startOfYear.getDay() + 1) / 7);
}

/**
 * Get start and end dates for a week
 */
export function getWeekDates(weekNumber: number, year: number): { start: Date; end: Date } {
  const startOfYear = new Date(year, 0, 1);
  const startOfWeek = new Date(startOfYear);
  startOfWeek.setDate(startOfYear.getDate() + (weekNumber - 1) * 7 - startOfYear.getDay());
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  return { start: startOfWeek, end: endOfWeek };
}

/**
 * Format chronicle date range
 */
export function formatChronicleDateRange(start: Date, end: Date): string {
  const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return `${startStr} - ${endStr}`;
}

