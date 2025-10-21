/**
 * Global Events System
 * 
 * Manages limited-time bonuses and special events.
 */

import { prisma } from "@/lib/db";
import { publishEvent } from "@/lib/realtime";

export interface GlobalEventData {
  id: string;
  title: string;
  description?: string;
  emoji?: string;
  type: string;
  bonusType: string;
  bonusValue: number;
  targetScope?: string;
  startAt: Date;
  endAt: Date;
  active: boolean;
}

/**
 * Get all currently active events
 */
export async function getActiveEvents(): Promise<GlobalEventData[]> {
  if (!prisma) {
    console.warn("[Events] Prisma client not available - returning empty events");
    return [];
  }

  const now = new Date();

  const events = await prisma.globalEvent.findMany({
    where: {
      active: true,
      startAt: {
        lte: now,
      },
      endAt: {
        gte: now,
      },
    },
    orderBy: {
      startAt: "desc",
    },
  });

  return events as GlobalEventData[];
}

/**
 * Apply event bonuses to a base value
 * 
 * @param baseValue - Original value (e.g., 100 XP)
 * @param actionScope - Action type (e.g., "quiz", "dare", "flow")
 * @param rewardType - Type of reward (e.g., "xp", "gold", "karma")
 * @returns Enhanced value with bonuses applied
 */
export async function applyEventBonuses(
  baseValue: number,
  actionScope: string,
  rewardType: string
): Promise<{ value: number; bonusApplied: number; activeEvents: string[] }> {
  const events = await getActiveEvents();

  let totalValue = baseValue;
  let bonusApplied = 0;
  const activeEventNames: string[] = [];

  for (const event of events) {
    // Check if event applies to this action
    const scopeMatches =
      !event.targetScope ||
      event.targetScope === "all" ||
      event.targetScope === actionScope;

    // Check if event type matches reward type
    const typeMatches =
      event.type === `${rewardType}_boost` || event.type === "special";

    if (!scopeMatches || !typeMatches) {
      continue;
    }

    // Apply bonus based on type
    let bonus = 0;

    switch (event.bonusType) {
      case "percentage":
        bonus = Math.floor(baseValue * (event.bonusValue / 100));
        totalValue += bonus;
        break;

      case "flat":
        bonus = event.bonusValue;
        totalValue += bonus;
        break;

      case "multiplier":
        bonus = baseValue * (event.bonusValue - 1); // e.g., 2x = base * (2-1)
        totalValue += bonus;
        break;
    }

    bonusApplied += bonus;
    activeEventNames.push(event.title);
  }

  return {
    value: totalValue,
    bonusApplied,
    activeEvents: activeEventNames,
  };
}

/**
 * Create a new global event
 */
export async function createGlobalEvent(data: {
  title: string;
  description?: string;
  emoji?: string;
  type: string;
  bonusType: string;
  bonusValue: number;
  targetScope?: string;
  startAt: Date;
  endAt: Date;
  createdBy?: string;
}): Promise<GlobalEventData> {
  const event = await prisma.globalEvent.create({
    data: {
      ...data,
      active: true,
    },
  });

  // Publish event creation
  await publishEvent("event:created", {
    eventId: event.id,
    title: event.title,
    type: event.type,
    startAt: event.startAt,
    endAt: event.endAt,
  });

  return event as GlobalEventData;
}

/**
 * Update an existing event
 */
export async function updateGlobalEvent(
  eventId: string,
  updates: Partial<GlobalEventData>
): Promise<GlobalEventData | null> {
  const event = await prisma.globalEvent.update({
    where: { id: eventId },
    data: updates,
  });

  // Publish event update
  await publishEvent("event:updated", {
    eventId: event.id,
    title: event.title,
    active: event.active,
  });

  return event as GlobalEventData;
}

/**
 * Deactivate an event
 */
export async function deactivateEvent(eventId: string): Promise<void> {
  await prisma.globalEvent.update({
    where: { id: eventId },
    data: { active: false },
  });

  await publishEvent("event:deactivated", {
    eventId,
  });
}

/**
 * Auto-deactivate expired events (cron job)
 */
export async function deactivateExpiredEvents(): Promise<number> {
  const now = new Date();

  const result = await prisma.globalEvent.updateMany({
    where: {
      active: true,
      endAt: {
        lt: now,
      },
    },
    data: {
      active: false,
    },
  });

  return result.count;
}

/**
 * Get event display info
 */
export function getEventDisplayInfo(event: GlobalEventData): {
  color: string;
  badgeText: string;
  bonusText: string;
} {
  let color = "bg-blue-500";
  let badgeText = "EVENT";
  let bonusText = "";

  switch (event.type) {
    case "xp_boost":
      color = "bg-blue-500";
      badgeText = "XP BOOST";
      break;
    case "gold_boost":
      color = "bg-yellow-500";
      badgeText = "GOLD BOOST";
      break;
    case "karma_boost":
      color = "bg-green-500";
      badgeText = "KARMA BOOST";
      break;
    case "energy_boost":
      color = "bg-red-500";
      badgeText = "ENERGY BOOST";
      break;
    case "special":
      color = "bg-purple-500";
      badgeText = "SPECIAL EVENT";
      break;
  }

  // Format bonus text
  switch (event.bonusType) {
    case "percentage":
      bonusText = `+${event.bonusValue}%`;
      break;
    case "flat":
      bonusText = `+${event.bonusValue}`;
      break;
    case "multiplier":
      bonusText = `${event.bonusValue}x`;
      break;
  }

  return { color, badgeText, bonusText };
}

/**
 * Check if event is currently active
 */
export function isEventActive(event: GlobalEventData): boolean {
  const now = new Date();
  return (
    event.active &&
    now >= new Date(event.startAt) &&
    now <= new Date(event.endAt)
  );
}

/**
 * Format event duration
 */
export function formatEventDuration(startAt: Date, endAt: Date): string {
  const start = new Date(startAt);
  const end = new Date(endAt);
  const durationMs = end.getTime() - start.getTime();
  const durationDays = Math.floor(durationMs / (1000 * 60 * 60 * 24));

  if (durationDays === 0) {
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    return `${hours} hour${hours !== 1 ? "s" : ""}`;
  }

  return `${durationDays} day${durationDays !== 1 ? "s" : ""}`;
}

/**
 * Get time remaining for active event
 */
export function getTimeRemaining(endAt: Date): string {
  const now = new Date();
  const end = new Date(endAt);
  const remainingMs = end.getTime() - now.getTime();

  if (remainingMs <= 0) return "Ended";

  const days = Math.floor(remainingMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((remainingMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}



