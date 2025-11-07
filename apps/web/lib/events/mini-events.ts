/**
 * Mini-Event System (v0.8.15)
 * 
 * PLACEHOLDER: Short community-wide missions with collective rewards.
 */

export interface MiniEventDefinition {
  eventId: string;
  name: string;
  description: string;
  icon: string;
  eventType: "answer_truths" | "complete_challenges" | "earn_xp" | "social_activity" | "flow_completions";
  goalType: "collective" | "individual_threshold";
  targetCount: number;
  duration: number; // hours
  rewards: EventReward[];
}

export interface EventReward {
  type: "badge" | "aura" | "gold" | "diamonds" | "xp" | "title" | "theme";
  id?: string; // For badge/aura/theme
  amount?: number; // For currencies/xp
  description: string;
}

export const MINI_EVENT_TEMPLATES: MiniEventDefinition[] = [
  {
    eventId: "truth_rush",
    name: "Truth Rush",
    description: "Answer 1,000 truth questions as a community!",
    icon: "💬",
    eventType: "answer_truths",
    goalType: "collective",
    targetCount: 1000,
    duration: 24,
    rewards: [
      { type: "badge", id: "truth_seeker", description: "Truth Seeker badge" },
      { type: "gold", amount: 500, description: "500 gold for all participants" },
      { type: "xp", amount: 100, description: "+100 XP bonus" },
    ],
  },
  {
    eventId: "challenge_storm",
    name: "Challenge Storm",
    description: "Complete 500 challenges together!",
    icon: "⚡",
    eventType: "complete_challenges",
    goalType: "collective",
    targetCount: 500,
    duration: 24,
    rewards: [
      { type: "badge", id: "storm_chaser", description: "Storm Chaser badge" },
      { type: "diamonds", amount: 25, description: "25 diamonds for all" },
      { type: "aura", id: "lightning_aura", description: "Lightning Aura unlock" },
    ],
  },
  {
    eventId: "xp_frenzy",
    name: "XP Frenzy",
    description: "Community earns 50,000 XP in 12 hours!",
    icon: "✨",
    eventType: "earn_xp",
    goalType: "collective",
    targetCount: 50000,
    duration: 12,
    rewards: [
      { type: "gold", amount: 1000, description: "1,000 gold for all" },
      { type: "xp", amount: 200, description: "+200 XP bonus" },
    ],
  },
  {
    eventId: "social_surge",
    name: "Social Surge",
    description: "Send 2,000 messages and make 100 new friends!",
    icon: "💬",
    eventType: "social_activity",
    goalType: "collective",
    targetCount: 2000,
    duration: 48,
    rewards: [
      { type: "badge", id: "social_champion", description: "Social Champion badge" },
      { type: "theme", id: "social_butterfly", description: "Social Butterfly theme" },
      { type: "gold", amount: 750, description: "750 gold for all" },
    ],
  },
  {
    eventId: "flow_marathon",
    name: "Flow Marathon",
    description: "Complete 1,500 flows as a community!",
    icon: "🌊",
    eventType: "flow_completions",
    goalType: "collective",
    targetCount: 1500,
    duration: 36,
    rewards: [
      { type: "badge", id: "flow_master", description: "Flow Master badge" },
      { type: "diamonds", amount: 50, description: "50 diamonds for all" },
      { type: "xp", amount: 300, description: "+300 XP bonus" },
    ],
  },
];

/**
 * Calculate event progress percentage
 */
export function calculateEventProgress(
  currentProgress: number,
  targetCount: number
): number {
  return Math.min(100, Math.round((currentProgress / targetCount) * 100));
}

/**
 * Check if event is currently active
 */
export function isEventActive(startTime: Date, endTime: Date): boolean {
  const now = new Date();
  return now >= startTime && now <= endTime;
}

/**
 * Get time remaining in event
 */
export function getTimeRemaining(endTime: Date): {
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
} {
  const now = new Date();
  const diff = endTime.getTime() - now.getTime();
  
  if (diff <= 0) {
    return { hours: 0, minutes: 0, seconds: 0, isExpired: true };
  }
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  
  return { hours, minutes, seconds, isExpired: false };
}

/**
 * PLACEHOLDER: Create mini-event
 */
export async function createMiniEvent(
  _template: MiniEventDefinition,
  _startTime: Date
) {
  
  // PLACEHOLDER: Would create event
  // - Generate unique eventId with timestamp
  // - Set start/end times
  // - Store rewards as JSON
  // - Set status to "scheduled"
  
  return null;
}

/**
 * PLACEHOLDER: Update event progress
 */
export async function updateEventProgress(
  _eventId: string,
  _userId: string,
  _contribution: number
) {
  
  // PLACEHOLDER: Would execute
  // - Update user's contribution
  // - Update event's currentProgress
  // - Check if goal reached
  // - If reached, mark as successful and distribute rewards
  
  return null;
}

/**
 * PLACEHOLDER: Distribute event rewards
 */
export async function distributeEventRewards(_eventId: string) {
  
  // PLACEHOLDER: Would execute
  // - Get all participants
  // - Award rewards to each
  // - Create reward records
  // - Post results to global feed
  // - Send notifications
  
  return null;
}

/**
 * PLACEHOLDER: Auto-start/end events (cron job)
 */
export async function processScheduledEvents() {
  
  // PLACEHOLDER: Would execute
  // - Start events where startTime <= now && status === "scheduled"
  // - End events where endTime <= now && status === "active"
  // - Distribute rewards for completed events
  
  return null;
}













