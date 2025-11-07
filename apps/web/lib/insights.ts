/**
 * Player Insight System (v0.8.1)
 * 
 * PLACEHOLDER: Analyzes player behavior and generates personalized insights.
 */

import { prisma } from "@/lib/db";
import insightTemplates from "@/data/insights.json";

export interface PlayerMetrics {
  creativity: number;      // 0-100%
  social: number;          // 0-100%
  knowledge: number;       // 0-100% (curiosity)
  balance: boolean;        // All stats within 10 points
  streakDays: number;
  challengesCompleted: number;
  karma: number;
  prestige: number;
  mostActiveHour: number;  // 0-23
}

/**
 * Analyze user patterns and return metrics
 * 
 * PLACEHOLDER: Returns mock metrics based on user stats
 */
export async function analyzeUserPatterns(userId: string): Promise<PlayerMetrics> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      statCreativity: true,
      statSocial: true,
      statKnowledge: true,
      karmaScore: true,
      prestigeScore: true,
      challengesReceived: {
        where: { status: "completed" },
        select: { id: true },
      },
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // TODO: Implement actual pattern analysis:
  // - Calculate creativity % from answer diversity
  // - Calculate social % from message/friend activity
  // - Calculate knowledge % from correct answers
  // - Detect most active hour from activity timestamps
  // - Track streak days from login history

  // Mock implementation
  const creativity = user.statCreativity || Math.floor(Math.random() * 100);
  const social = user.statSocial || Math.floor(Math.random() * 100);
  const knowledge = user.statKnowledge || Math.floor(Math.random() * 100);
  const balance = Math.abs(creativity - social) < 10 && Math.abs(social - knowledge) < 10;

  return {
    creativity,
    social,
    knowledge,
    balance,
    streakDays: Math.floor(Math.random() * 30),
    challengesCompleted: user.challengesReceived.length,
    karma: user.karmaScore || 0,
    prestige: user.prestigeScore || 0,
    mostActiveHour: Math.floor(Math.random() * 24),
  };
}

/**
 * Generate personalized insight for user
 * 
 * PLACEHOLDER: Matches templates to metrics
 */
export async function generateUserInsight(userId: string): Promise<any> {
  const metrics = await analyzeUserPatterns(userId);

  // Find matching template
  let matchedTemplate = null;

  for (const template of insightTemplates.templates) {
    const condition = template.condition;

    // Check conditions
    if (condition.creativity && metrics.creativity < (condition.creativity.min || 0)) continue;
    if (condition.social && metrics.social < (condition.social.min || 0)) continue;
    if (condition.knowledge && metrics.knowledge < (condition.knowledge.min || 0)) continue;
    if (condition.balance && !metrics.balance) continue;
    if (condition.streakDays && metrics.streakDays < (condition.streakDays.min || 0)) continue;
    if (condition.challengesCompleted && metrics.challengesCompleted < (condition.challengesCompleted.min || 0)) continue;
    if (condition.karma && metrics.karma < (condition.karma.min || 0)) continue;
    if (condition.prestige && metrics.prestige < (condition.prestige.min || 0)) continue;
    if (condition.mostActiveHour) {
      if (condition.mostActiveHour.min && metrics.mostActiveHour < condition.mostActiveHour.min) continue;
      if (condition.mostActiveHour.max && metrics.mostActiveHour > condition.mostActiveHour.max) continue;
    }

    matchedTemplate = template;
    break;
  }

  // Use fallback if no match
  if (!matchedTemplate) {
    matchedTemplate = insightTemplates.fallback;
  }

  // Replace placeholders in description
  let description = matchedTemplate.description;
  Object.entries(metrics).forEach(([key, value]) => {
    description = description.replace(`{${key}}`, String(value));
  });

  // Calculate expiry (7 days)
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  // Save insight
  const insight = await prisma.userInsight.create({
    data: {
      userId,
      templateId: (matchedTemplate as any).id || "fallback",
      title: matchedTemplate.title,
      description,
      emoji: matchedTemplate.emoji,
      color: matchedTemplate.color,
      metrics,
      expiresAt,
    },
  });

  return insight;
}

/**
 * Get active insights for user
 */
export async function getUserInsights(userId: string) {
  const now = new Date();

  return await prisma.userInsight.findMany({
    where: {
      userId,
      expiresAt: { gte: now },
    },
    orderBy: {
      generatedAt: "desc",
    },
  });
}













