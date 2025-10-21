/**
 * External Rewards (v0.9.2)
 * 
 * PLACEHOLDER: Real-world perks linked to in-game achievements.
 */

import crypto from "crypto";

export interface RewardTier {
  name: string;
  minPrestige: number;
  maxPrestige?: number;
  color: string;
  icon: string;
  benefits: string[];
}

export const REWARD_TIERS: RewardTier[] = [
  {
    name: "Bronze",
    minPrestige: 0,
    maxPrestige: 19,
    color: "#cd7f32",
    icon: "🥉",
    benefits: [
      "10% discount codes",
      "Digital wallpapers",
      "Early access announcements",
    ],
  },
  {
    name: "Silver",
    minPrestige: 20,
    maxPrestige: 39,
    color: "#c0c0c0",
    icon: "🥈",
    benefits: [
      "All Bronze benefits",
      "20% discount codes",
      "Exclusive digital content",
      "Partner trial access",
    ],
  },
  {
    name: "Gold",
    minPrestige: 40,
    maxPrestige: 59,
    color: "#ffd700",
    icon: "🥇",
    benefits: [
      "All Silver benefits",
      "30% discount codes",
      "Physical merchandise",
      "Premium partner perks",
      "Event invitations",
    ],
  },
  {
    name: "Platinum",
    minPrestige: 60,
    maxPrestige: 79,
    color: "#e5e4e2",
    icon: "💎",
    benefits: [
      "All Gold benefits",
      "50% discount codes",
      "Signed merchandise",
      "VIP partner experiences",
      "Beta feature access",
    ],
  },
  {
    name: "Diamond",
    minPrestige: 80,
    color: "#b9f2ff",
    icon: "💠",
    benefits: [
      "All Platinum benefits",
      "Exclusive 1-on-1 experiences",
      "Custom merchandise",
      "Partner collaboration opportunities",
      "NFT proof certificates",
    ],
  },
];

export interface RewardCategory {
  category: string;
  name: string;
  icon: string;
  examples: string[];
}

export const REWARD_CATEGORIES: RewardCategory[] = [
  {
    category: "discount",
    name: "Discount Codes",
    icon: "💸",
    examples: ["10-50% off partner products", "Free shipping", "Buy-one-get-one"],
  },
  {
    category: "merchandise",
    name: "Merchandise",
    icon: "👕",
    examples: ["T-shirts", "Posters", "Stickers", "Signed items"],
  },
  {
    category: "service",
    name: "Services",
    icon: "🛠️",
    examples: ["Free consultations", "Premium subscriptions", "Course access"],
  },
  {
    category: "digital",
    name: "Digital Content",
    icon: "💾",
    examples: ["Wallpapers", "E-books", "Templates", "Stock photos"],
  },
  {
    category: "experience",
    name: "Experiences",
    icon: "🎭",
    examples: ["Event tickets", "Workshops", "Meet-and-greets", "VIP access"],
  },
];

/**
 * Generate unique redemption code
 */
export function generateRedemptionCode(
  offerId: string,
  userId: string
): string {
  const timestamp = Date.now().toString(36);
  const random = crypto.randomBytes(4).toString("hex").toUpperCase();
  const prefix = offerId.slice(0, 4).toUpperCase();
  
  return `${prefix}-${timestamp}-${random}`;
}

/**
 * Generate QR code data
 */
export function generateQRCodeData(redemptionCode: string): string {
  // PLACEHOLDER: Would generate actual QR code
  return `https://parel.app/verify/${redemptionCode}`;
}

/**
 * Check if user is eligible for reward
 */
export function isEligibleForReward(
  userStats: {
    prestige: number;
    level: number;
    badges: string[];
    titles: string[];
  },
  offer: {
    minPrestige: number;
    minLevel: number;
    requiredBadges: string[];
    requiredTitles: string[];
  }
): { eligible: boolean; reasons: string[] } {
  const reasons: string[] = [];
  
  if (userStats.prestige < offer.minPrestige) {
    reasons.push(`Requires ${offer.minPrestige} prestige (you have ${userStats.prestige})`);
  }
  
  if (userStats.level < offer.minLevel) {
    reasons.push(`Requires level ${offer.minLevel} (you are ${userStats.level})`);
  }
  
  for (const badge of offer.requiredBadges) {
    if (!userStats.badges.includes(badge)) {
      reasons.push(`Requires badge: ${badge}`);
    }
  }
  
  for (const title of offer.requiredTitles) {
    if (!userStats.titles.includes(title)) {
      reasons.push(`Requires title: ${title}`);
    }
  }
  
  return {
    eligible: reasons.length === 0,
    reasons,
  };
}

/**
 * PLACEHOLDER: Claim reward
 */
export async function claimReward(userId: string, offerId: string) {
  console.log(`[Rewards] PLACEHOLDER: Would claim reward ${offerId} for user ${userId}`);
  
  // PLACEHOLDER: Would execute
  // - Check eligibility
  // - Check stock
  // - Generate redemption code
  // - Generate QR code
  // - Create redemption record
  // - Decrement stock
  // - Notify user
  
  return null;
}

/**
 * PLACEHOLDER: Verify redemption
 */
export async function verifyRedemption(
  redemptionCode: string,
  verificationCode?: string
) {
  console.log(`[Rewards] PLACEHOLDER: Would verify redemption ${redemptionCode}`);
  
  // PLACEHOLDER: Would execute
  // - Look up redemption
  // - Verify verification code (if provided)
  // - Mark as verified/redeemed
  // - Record verifier
  // - Notify partner via webhook
  
  return null;
}

/**
 * PLACEHOLDER: Mint NFT proof (optional)
 */
export async function mintRewardNFT(redemptionId: string) {
  console.log(`[Rewards] PLACEHOLDER: Would mint NFT for redemption ${redemptionId}`);
  
  // PLACEHOLDER: Would execute
  // - Connect to blockchain
  // - Mint NFT with metadata
  // - Store token ID and tx hash
  // - Update redemption record
  
  return null;
}











