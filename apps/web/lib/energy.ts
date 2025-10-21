/**
 * Energy Management System
 * 
 * Manages user hearts (energy) with regeneration mechanic.
 * Max 5 hearts, regenerates 1 per hour.
 */

import { prisma } from "@/lib/db";

export interface EnergyStatus {
  hearts: number;
  maxHearts: number;
  nextRegenAt: Date | null;
  minutesUntilRegen: number;
}

/**
 * Get or create user energy status
 */
export async function getUserEnergy(userId: string): Promise<EnergyStatus> {
  // Get or create energy record
  let energy = await prisma.userEnergy.findUnique({
    where: { userId },
  });

  if (!energy) {
    // Create new energy record with max hearts
    energy = await prisma.userEnergy.create({
      data: {
        userId,
        hearts: 5,
        maxHearts: 5,
        lastRegenAt: new Date(),
      },
    });
  }

  // Calculate regenerated hearts
  const now = new Date();
  const hoursSinceRegen = (now.getTime() - energy.lastRegenAt.getTime()) / (1000 * 60 * 60);
  const heartsToRegen = Math.floor(hoursSinceRegen);

  if (heartsToRegen > 0 && energy.hearts < energy.maxHearts) {
    const newHearts = Math.min(energy.hearts + heartsToRegen, energy.maxHearts);
    
    // Update energy
    energy = await prisma.userEnergy.update({
      where: { userId },
      data: {
        hearts: newHearts,
        lastRegenAt: new Date(energy.lastRegenAt.getTime() + heartsToRegen * 60 * 60 * 1000),
      },
    });
  }

  // Calculate next regeneration time
  let nextRegenAt: Date | null = null;
  let minutesUntilRegen = 0;

  if (energy.hearts < energy.maxHearts) {
    nextRegenAt = new Date(energy.lastRegenAt.getTime() + 60 * 60 * 1000); // +1 hour
    minutesUntilRegen = Math.ceil((nextRegenAt.getTime() - now.getTime()) / (1000 * 60));
  }

  return {
    hearts: energy.hearts,
    maxHearts: energy.maxHearts,
    nextRegenAt,
    minutesUntilRegen,
  };
}

/**
 * Consume hearts (e.g., for answering questions)
 */
export async function consumeHearts(userId: string, amount: number = 1): Promise<boolean> {
  const energy = await getUserEnergy(userId);

  if (energy.hearts < amount) {
    return false; // Not enough hearts
  }

  await prisma.userEnergy.update({
    where: { userId },
    data: {
      hearts: { decrement: amount },
    },
  });

  return true;
}

/**
 * Add hearts (e.g., from completing quiz or eating food)
 */
export async function addHearts(userId: string, amount: number = 1): Promise<void> {
  const energy = await prisma.userEnergy.findUnique({
    where: { userId },
  });

  if (!energy) {
    // Create with initial hearts
    await prisma.userEnergy.create({
      data: {
        userId,
        hearts: Math.min(amount, 5),
        maxHearts: 5,
        lastRegenAt: new Date(),
      },
    });
    return;
  }

  await prisma.userEnergy.update({
    where: { userId },
    data: {
      hearts: Math.min(energy.hearts + amount, energy.maxHearts),
    },
  });
}

/**
 * Check if user has enough hearts
 */
export async function hasEnoughHearts(userId: string, required: number = 1): Promise<boolean> {
  const energy = await getUserEnergy(userId);
  return energy.hearts >= required;
}

/**
 * Reset hearts to max (admin function or purchase)
 */
export async function refillHearts(userId: string): Promise<void> {
  await prisma.userEnergy.upsert({
    where: { userId },
    update: {
      hearts: 5,
      lastRegenAt: new Date(),
    },
    create: {
      userId,
      hearts: 5,
      maxHearts: 5,
      lastRegenAt: new Date(),
    },
  });
}

/**
 * Format time until regeneration
 */
export function formatRegenTime(minutes: number): string {
  if (minutes <= 0) return "now";
  if (minutes < 60) return `${minutes}m`;
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}











