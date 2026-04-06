/*
  Warnings:

  - You are about to drop the column `currency` on the `LedgerEntry` table. All the data in the column will be lost.
  - You are about to drop the column `avgKarma` on the `factions` table. All the data in the column will be lost.
  - You are about to drop the column `avgPrestige` on the `factions` table. All the data in the column will be lost.
  - You are about to drop the column `color` on the `factions` table. All the data in the column will be lost.
  - You are about to drop the column `councilSize` on the `factions` table. All the data in the column will be lost.
  - You are about to drop the column `emblem` on the `factions` table. All the data in the column will be lost.
  - You are about to drop the column `factionId` on the `factions` table. All the data in the column will be lost.
  - You are about to drop the column `glowEffect` on the `factions` table. All the data in the column will be lost.
  - You are about to drop the column `goldBonus` on the `factions` table. All the data in the column will be lost.
  - You are about to drop the column `hasCouncil` on the `factions` table. All the data in the column will be lost.
  - You are about to drop the column `karmaMultiplier` on the `factions` table. All the data in the column will be lost.
  - You are about to drop the column `lore` on the `factions` table. All the data in the column will be lost.
  - You are about to drop the column `memberCount` on the `factions` table. All the data in the column will be lost.
  - You are about to drop the column `moralAxis` on the `factions` table. All the data in the column will be lost.
  - You are about to drop the column `orderAxis` on the `factions` table. All the data in the column will be lost.
  - You are about to drop the column `pattern` on the `factions` table. All the data in the column will be lost.
  - You are about to drop the column `philosophy` on the `factions` table. All the data in the column will be lost.
  - You are about to drop the column `secondaryColor` on the `factions` table. All the data in the column will be lost.
  - You are about to drop the column `specialAbility` on the `factions` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `factions` table. All the data in the column will be lost.
  - You are about to drop the column `totalXp` on the `factions` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `factions` table. All the data in the column will be lost.
  - You are about to drop the column `votingPower` on the `factions` table. All the data in the column will be lost.
  - You are about to drop the column `xpBonus` on the `factions` table. All the data in the column will be lost.
  - The `bonus` column on the `items` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `currency` on the `market_listings` table. All the data in the column will be lost.
  - You are about to drop the column `listedAt` on the `market_listings` table. All the data in the column will be lost.
  - You are about to drop the column `soldAt` on the `market_listings` table. All the data in the column will be lost.
  - You are about to drop the column `senderId` on the `notifications` table. All the data in the column will be lost.
  - The `type` column on the `notifications` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `archetype` on the `npc_profiles` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[key]` on the table `Badge` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[key]` on the table `achievements` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[key]` on the table `factions` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[key]` on the table `items` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,achievementId,tier]` on the table `user_achievements` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `key` to the `Badge` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Badge` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rarity` to the `Badge` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unlockType` to the `Badge` table without a default value. This is not possible if the table is not empty.
  - Added the required column `currencyId` to the `LedgerEntry` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `type` on the `activities` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `colorPrimary` to the `factions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `key` to the `factions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `inventory_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `market_listings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `archetypeAffinity` to the `npc_profiles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tone` to the `npc_profiles` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CulturalFilterSeverity" AS ENUM ('info', 'warn', 'block');

-- CreateEnum
CREATE TYPE "ContentVisibility" AS ENUM ('PUBLIC', 'HIDDEN');

-- CreateEnum
CREATE TYPE "ModerationContentType" AS ENUM ('QUESTION', 'EVENT', 'COMMENT');

-- CreateEnum
CREATE TYPE "FeedbackStatus" AS ENUM ('NEW', 'REVIEWED', 'RESOLVED');

-- CreateEnum
CREATE TYPE "CreatorPackType" AS ENUM ('POLL', 'REFLECTION', 'MISSION');

-- CreateEnum
CREATE TYPE "CreatorPackStatus" AS ENUM ('DRAFT', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "CreatorRewardType" AS ENUM ('xp', 'gold', 'diamonds', 'badge');

-- CreateEnum
CREATE TYPE "SystemAlertType" AS ENUM ('cron', 'api', 'db', 'cache', 'memory', 'cpu');

-- CreateEnum
CREATE TYPE "SystemAlertLevel" AS ENUM ('info', 'warn', 'error', 'critical');

-- CreateEnum
CREATE TYPE "WebhookType" AS ENUM ('discord', 'slack', 'generic');

-- CreateEnum
CREATE TYPE "TagType" AS ENUM ('tone', 'content');

-- CreateEnum
CREATE TYPE "CurrencyType" AS ENUM ('FUNDS', 'DIAMONDS');

-- CreateEnum
CREATE TYPE "UserSynchTestStatus" AS ENUM ('pending', 'completed', 'expired');

-- CreateEnum
CREATE TYPE "FactionBuffType" AS ENUM ('xp', 'gold', 'luck', 'karma', 'custom');

-- CreateEnum
CREATE TYPE "RegionScope" AS ENUM ('global', 'regional');

-- CreateEnum
CREATE TYPE "CreationType" AS ENUM ('question', 'mission', 'item', 'other');

-- CreateEnum
CREATE TYPE "CreationStatus" AS ENUM ('pending', 'approved', 'rejected');

-- CreateEnum
CREATE TYPE "PostcardStatus" AS ENUM ('pending', 'delivered', 'read', 'deleted');

-- CreateEnum
CREATE TYPE "ForkRarity" AS ENUM ('common', 'rare', 'special');

-- CreateEnum
CREATE TYPE "ForkChoice" AS ENUM ('A', 'B');

-- CreateEnum
CREATE TYPE "DuetRunType" AS ENUM ('reflect', 'collect', 'challenge');

-- CreateEnum
CREATE TYPE "DuetRunStatus" AS ENUM ('pending', 'active', 'completed', 'expired');

-- CreateEnum
CREATE TYPE "RitualTimeOfDay" AS ENUM ('morning', 'evening', 'any');

-- CreateEnum
CREATE TYPE "MicroClanBuffType" AS ENUM ('xp', 'gold', 'karma', 'compare', 'reflect');

-- CreateEnum
CREATE TYPE "LootTrigger" AS ENUM ('reflection', 'mission', 'comparison', 'levelup', 'random');

-- CreateEnum
CREATE TYPE "LootRewardType" AS ENUM ('xp', 'gold', 'item', 'cosmetic', 'emote');

-- CreateEnum
CREATE TYPE "LootRarity" AS ENUM ('common', 'rare', 'epic', 'legendary');

-- CreateEnum
CREATE TYPE "BadgeRarity" AS ENUM ('common', 'rare', 'epic', 'legendary', 'mythic', 'eternal');

-- CreateEnum
CREATE TYPE "BadgeUnlockType" AS ENUM ('level', 'event', 'season', 'special');

-- CreateEnum
CREATE TYPE "BadgeRewardType" AS ENUM ('currency', 'item', 'title');

-- CreateEnum
CREATE TYPE "ChronicleType" AS ENUM ('weekly', 'seasonal');

-- CreateEnum
CREATE TYPE "RegionBuffType" AS ENUM ('xp', 'gold', 'mood', 'reflection');

-- CreateEnum
CREATE TYPE "UnlockRequirementType" AS ENUM ('level', 'task', 'gold', 'achievement');

-- CreateEnum
CREATE TYPE "QuestType" AS ENUM ('daily', 'weekly', 'story', 'side');

-- CreateEnum
CREATE TYPE "QuestRequirementType" AS ENUM ('xp', 'reflections', 'gold', 'missions', 'custom');

-- CreateEnum
CREATE TYPE "LoreSourceType" AS ENUM ('reflection', 'quest', 'item', 'event', 'system');

-- CreateEnum
CREATE TYPE "LoreTone" AS ENUM ('serious', 'comedic', 'poetic');

-- CreateEnum
CREATE TYPE "FriendshipStatus" AS ENUM ('pending', 'accepted', 'blocked');

-- CreateEnum
CREATE TYPE "DuelStatus" AS ENUM ('pending', 'active', 'completed', 'expired');

-- CreateEnum
CREATE TYPE "ChallengeType" AS ENUM ('xp', 'reflection', 'random', 'poll');

-- CreateEnum
CREATE TYPE "SharedMissionStatus" AS ENUM ('active', 'completed', 'expired');

-- CreateEnum
CREATE TYPE "ItemCategory" AS ENUM ('item', 'cosmetic', 'booster');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('purchase', 'reward', 'gift', 'refund');

-- CreateEnum
CREATE TYPE "CronJobStatus" AS ENUM ('success', 'error');

-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('reflection', 'question', 'quest', 'badge', 'achievement', 'social', 'system', 'other');

-- CreateEnum
CREATE TYPE "ArchetypeAffinity" AS ENUM ('thinker', 'trickster', 'guardian', 'wanderer', 'chaos');

-- CreateEnum
CREATE TYPE "NPCTone" AS ENUM ('serious', 'sarcastic', 'poetic', 'neutral');

-- CreateEnum
CREATE TYPE "DialogueRarity" AS ENUM ('common', 'rare', 'epic');

-- CreateEnum
CREATE TYPE "DialogueTriggerType" AS ENUM ('greeting', 'quest', 'reflection', 'event', 'random');

-- CreateEnum
CREATE TYPE "QuestionTemplateCategory" AS ENUM ('daily', 'weekly', 'archetype', 'event', 'wildcard');

-- CreateEnum
CREATE TYPE "QuestionTone" AS ENUM ('serious', 'poetic', 'chaotic', 'funny');

-- CreateEnum
CREATE TYPE "BattleAchievementTriggerType" AS ENUM ('duelWin', 'duelLose', 'missionComplete', 'event');

-- CreateEnum
CREATE TYPE "BattleAchievementRarity" AS ENUM ('common', 'rare', 'epic', 'legendary');

-- CreateEnum
CREATE TYPE "GlobalMoodType" AS ENUM ('calm', 'chaos', 'neutral');

-- DropForeignKey
ALTER TABLE "UserQuestion" DROP CONSTRAINT "UserQuestion_questionId_fkey";

-- DropForeignKey
ALTER TABLE "faction_members" DROP CONSTRAINT "faction_members_factionId_fkey";

-- DropForeignKey
ALTER TABLE "faction_votes" DROP CONSTRAINT "faction_votes_factionId_fkey";

-- DropForeignKey
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_senderId_fkey";

-- DropIndex
DROP INDEX "factions_factionId_key";

-- DropIndex
DROP INDEX "factions_isActive_memberCount_idx";

-- DropIndex
DROP INDEX "market_listings_status_listedAt_idx";

-- DropIndex
DROP INDEX "notifications_createdAt_idx";

-- DropIndex
DROP INDEX "notifications_senderId_idx";

-- DropIndex
DROP INDEX "notifications_userId_isRead_idx";

-- DropIndex
DROP INDEX "npc_profiles_archetype_isActive_idx";

-- DropIndex
DROP INDEX "user_achievements_userId_achievementId_key";

-- DropIndex
DROP INDEX "users_lang_region_idx";

-- DropIndex
DROP INDEX "users_localeCode_idx";

-- AlterTable
ALTER TABLE "Badge" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "key" TEXT NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "rarity" "BadgeRarity" NOT NULL,
ADD COLUMN     "rarityId" TEXT,
ADD COLUMN     "requirementValue" TEXT,
ADD COLUMN     "rewardType" "BadgeRewardType",
ADD COLUMN     "rewardValue" TEXT,
ADD COLUMN     "seasonId" TEXT,
ADD COLUMN     "unlockType" "BadgeUnlockType" NOT NULL,
ALTER COLUMN "slug" DROP NOT NULL,
ALTER COLUMN "title" DROP NOT NULL,
ALTER COLUMN "active" DROP NOT NULL;

-- AlterTable
ALTER TABLE "LedgerEntry" DROP COLUMN "currency",
ADD COLUMN     "currencyId" TEXT NOT NULL,
ALTER COLUMN "refType" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "region" TEXT;

-- AlterTable
ALTER TABLE "UserBadge" ADD COLUMN     "claimedAt" TIMESTAMP(3),
ADD COLUMN     "isClaimed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "createdAt" DROP NOT NULL;

-- AlterTable
ALTER TABLE "UserQuestion" ADD COLUMN     "answeredAt" TIMESTAMP(3),
ADD COLUMN     "archetypeContext" TEXT,
ADD COLUMN     "moodContext" TEXT,
ADD COLUMN     "questionTemplateId" TEXT,
ADD COLUMN     "seasonId" TEXT,
ADD COLUMN     "servedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "questionId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Wallet" ADD COLUMN     "badgesClaimedCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "accounts" ALTER COLUMN "type" DROP NOT NULL;

-- AlterTable
ALTER TABLE "achievement_collections" ADD COLUMN     "region" TEXT;

-- AlterTable
ALTER TABLE "achievements" ADD COLUMN     "category" TEXT NOT NULL DEFAULT 'integration',
ADD COLUMN     "emoji" TEXT,
ADD COLUMN     "key" TEXT,
ADD COLUMN     "name" TEXT,
ADD COLUMN     "rewardGold" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "rewardXp" INTEGER,
ADD COLUMN     "tier" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "activities" ADD COLUMN     "region" TEXT,
DROP COLUMN "type",
ADD COLUMN     "type" "ActivityType" NOT NULL;

-- AlterTable
ALTER TABLE "attachments" ALTER COLUMN "mimeType" DROP NOT NULL;

-- AlterTable
ALTER TABLE "auto_heal_logs" ALTER COLUMN "healType" DROP NOT NULL;

-- AlterTable
ALTER TABLE "avatar_layers" ADD COLUMN     "region" TEXT,
ALTER COLUMN "layerType" DROP NOT NULL;

-- AlterTable
ALTER TABLE "cache_configs" ADD COLUMN     "region" TEXT;

-- AlterTable
ALTER TABLE "challenges" ALTER COLUMN "type" DROP NOT NULL;

-- AlterTable
ALTER TABLE "clan_activities" ALTER COLUMN "activityType" DROP NOT NULL;

-- AlterTable
ALTER TABLE "clan_upgrades" ALTER COLUMN "upgradeType" DROP NOT NULL;

-- AlterTable
ALTER TABLE "clans" ADD COLUMN     "region" TEXT,
ALTER COLUMN "emblem" SET DEFAULT 'ðŸ°';

-- AlterTable
ALTER TABLE "combat_sessions" ALTER COLUMN "enemyType" DROP NOT NULL;

-- AlterTable
ALTER TABLE "comments" ADD COLUMN     "flagReason" TEXT,
ADD COLUMN     "isFlagged" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "visibility" "ContentVisibility" NOT NULL DEFAULT 'PUBLIC',
ALTER COLUMN "targetType" DROP NOT NULL;

-- AlterTable
ALTER TABLE "content_reviews" ALTER COLUMN "contentType" DROP NOT NULL;

-- AlterTable
ALTER TABLE "coop_missions" ADD COLUMN     "region" TEXT,
ALTER COLUMN "type" DROP NOT NULL;

-- AlterTable
ALTER TABLE "cosmetic_items" ADD COLUMN     "rarityId" TEXT,
ADD COLUMN     "region" TEXT;

-- AlterTable
ALTER TABLE "crafting_recipes" ADD COLUMN     "region" TEXT;

-- AlterTable
ALTER TABLE "creator_flows" ADD COLUMN     "region" TEXT;

-- AlterTable
ALTER TABLE "creator_profiles" ALTER COLUMN "badge" SET DEFAULT 'ðŸŽ¨';

-- AlterTable
ALTER TABLE "creator_rewards" ALTER COLUMN "type" DROP NOT NULL;

-- AlterTable
ALTER TABLE "creator_transactions" ADD COLUMN     "region" TEXT,
ALTER COLUMN "type" DROP NOT NULL;

-- AlterTable
ALTER TABLE "daily_quests" ALTER COLUMN "type" DROP NOT NULL;

-- AlterTable
ALTER TABLE "engagement_metrics" ALTER COLUMN "contentType" DROP NOT NULL,
ALTER COLUMN "type" DROP NOT NULL;

-- AlterTable
ALTER TABLE "error_logs" ALTER COLUMN "errorType" DROP NOT NULL;

-- AlterTable
ALTER TABLE "event_logs" ADD COLUMN     "region" TEXT;

-- AlterTable
ALTER TABLE "events" ADD COLUMN     "flagReason" TEXT,
ADD COLUMN     "isFlagged" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "visibility" "ContentVisibility" NOT NULL DEFAULT 'PUBLIC',
ALTER COLUMN "localeCode" DROP NOT NULL;

-- AlterTable
ALTER TABLE "faction_change_logs" ALTER COLUMN "changeType" DROP NOT NULL;

-- AlterTable
ALTER TABLE "faction_proposals" ALTER COLUMN "proposalType" DROP NOT NULL;

-- AlterTable
ALTER TABLE "faction_territories" ALTER COLUMN "region" DROP NOT NULL;

-- AlterTable
ALTER TABLE "faction_votes" ALTER COLUMN "voteType" DROP NOT NULL;

-- AlterTable
ALTER TABLE "factions" DROP COLUMN "avgKarma",
DROP COLUMN "avgPrestige",
DROP COLUMN "color",
DROP COLUMN "councilSize",
DROP COLUMN "emblem",
DROP COLUMN "factionId",
DROP COLUMN "glowEffect",
DROP COLUMN "goldBonus",
DROP COLUMN "hasCouncil",
DROP COLUMN "karmaMultiplier",
DROP COLUMN "lore",
DROP COLUMN "memberCount",
DROP COLUMN "moralAxis",
DROP COLUMN "orderAxis",
DROP COLUMN "pattern",
DROP COLUMN "philosophy",
DROP COLUMN "secondaryColor",
DROP COLUMN "specialAbility",
DROP COLUMN "title",
DROP COLUMN "totalXp",
DROP COLUMN "updatedAt",
DROP COLUMN "votingPower",
DROP COLUMN "xpBonus",
ADD COLUMN     "buffType" "FactionBuffType",
ADD COLUMN     "buffValue" DOUBLE PRECISION NOT NULL DEFAULT 1.05,
ADD COLUMN     "colorPrimary" TEXT NOT NULL,
ADD COLUMN     "colorSecondary" TEXT,
ADD COLUMN     "key" TEXT NOT NULL,
ADD COLUMN     "region" TEXT,
ADD COLUMN     "regionScope" "RegionScope" NOT NULL DEFAULT 'global',
ALTER COLUMN "description" DROP NOT NULL;

-- AlterTable
ALTER TABLE "feedback_submissions" ALTER COLUMN "type" DROP NOT NULL;

-- AlterTable
ALTER TABLE "flows" ADD COLUMN     "region" TEXT;

-- AlterTable
ALTER TABLE "global_events" ADD COLUMN     "region" TEXT,
ALTER COLUMN "emoji" SET DEFAULT 'ðŸŽ‰',
ALTER COLUMN "type" DROP NOT NULL,
ALTER COLUMN "bonusType" DROP NOT NULL;

-- AlterTable
ALTER TABLE "global_feed_items" ADD COLUMN     "region" TEXT,
ALTER COLUMN "type" DROP NOT NULL;

-- AlterTable
ALTER TABLE "global_pool" ALTER COLUMN "poolType" DROP NOT NULL;

-- AlterTable
ALTER TABLE "group_activities" ALTER COLUMN "type" DROP NOT NULL;

-- AlterTable
ALTER TABLE "groups" ADD COLUMN     "cost" INTEGER NOT NULL DEFAULT 100,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "region" TEXT,
ADD COLUMN     "transparency" TEXT NOT NULL DEFAULT 'summary',
ADD COLUMN     "visibility" TEXT NOT NULL DEFAULT 'private',
ALTER COLUMN "emblem" SET DEFAULT 'ðŸ”¥';

-- AlterTable
ALTER TABLE "health_logs" ALTER COLUMN "checkType" DROP NOT NULL;

-- AlterTable
ALTER TABLE "insight_prompts" ALTER COLUMN "icon" SET DEFAULT 'ðŸ’­';

-- AlterTable
ALTER TABLE "inventory_items" ADD COLUMN     "effectKey" TEXT,
ADD COLUMN     "itemKey" TEXT,
ADD COLUMN     "power" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "rarity" TEXT NOT NULL DEFAULT 'common',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "items" ADD COLUMN     "emoji" TEXT,
ADD COLUMN     "isTradable" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "key" TEXT,
ADD COLUMN     "rarityId" TEXT,
ADD COLUMN     "region" TEXT,
ADD COLUMN     "slot" TEXT,
ALTER COLUMN "type" DROP NOT NULL,
DROP COLUMN "bonus",
ADD COLUMN     "bonus" JSONB;

-- AlterTable
ALTER TABLE "job_queues" ADD COLUMN     "region" TEXT;

-- AlterTable
ALTER TABLE "lore_eras" ADD COLUMN     "region" TEXT;

-- AlterTable
ALTER TABLE "market_listings" DROP COLUMN "currency",
DROP COLUMN "listedAt",
DROP COLUMN "soldAt",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "currencyKey" TEXT NOT NULL DEFAULT 'gold',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "mentor_logs" ALTER COLUMN "logType" DROP NOT NULL;

-- AlterTable
ALTER TABLE "mentor_profiles" ALTER COLUMN "mentorAvatar" SET DEFAULT 'ðŸ§™';

-- AlterTable
ALTER TABLE "mini_event_rewards" ALTER COLUMN "rewardType" DROP NOT NULL;

-- AlterTable
ALTER TABLE "mini_events" ALTER COLUMN "icon" SET DEFAULT 'ðŸŽ¯',
ALTER COLUMN "eventType" DROP NOT NULL,
ALTER COLUMN "goalType" DROP NOT NULL;

-- AlterTable
ALTER TABLE "moderation_actions" ALTER COLUMN "actionType" DROP NOT NULL;

-- AlterTable
ALTER TABLE "moderation_logs" ALTER COLUMN "targetType" DROP NOT NULL;

-- AlterTable
ALTER TABLE "notifications" DROP COLUMN "senderId",
ADD COLUMN     "refId" TEXT,
DROP COLUMN "type",
ADD COLUMN     "type" TEXT;

-- AlterTable
ALTER TABLE "npc_dialogue_trees" ADD COLUMN     "region" TEXT,
ALTER COLUMN "triggerType" DROP NOT NULL;

-- AlterTable
ALTER TABLE "npc_interactions" ALTER COLUMN "interactionType" DROP NOT NULL;

-- AlterTable
ALTER TABLE "npc_memories" ALTER COLUMN "memoryType" DROP NOT NULL;

-- AlterTable
ALTER TABLE "npc_profiles" DROP COLUMN "archetype",
ADD COLUMN     "archetypeAffinity" "ArchetypeAffinity" NOT NULL,
ADD COLUMN     "bio" TEXT,
ADD COLUMN     "portraitUrl" TEXT,
ADD COLUMN     "tone" "NPCTone" NOT NULL,
ALTER COLUMN "personality" DROP NOT NULL,
ALTER COLUMN "alignment" DROP NOT NULL,
ALTER COLUMN "greetings" DROP NOT NULL,
ALTER COLUMN "farewells" DROP NOT NULL;

-- AlterTable
ALTER TABLE "offline_actions" ALTER COLUMN "actionType" DROP NOT NULL;

-- AlterTable
ALTER TABLE "partner_apps" ADD COLUMN     "region" TEXT;

-- AlterTable
ALTER TABLE "partner_webhooks" ALTER COLUMN "eventType" DROP NOT NULL;

-- AlterTable
ALTER TABLE "payment_logs" ADD COLUMN     "region" TEXT;

-- AlterTable
ALTER TABLE "profile_themes" ADD COLUMN     "rarityId" TEXT;

-- AlterTable
ALTER TABLE "public_comparisons" ALTER COLUMN "answers" DROP DEFAULT,
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updatedAt" DROP DEFAULT,
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "question_tags" ADD COLUMN     "description" TEXT,
ADD COLUMN     "region" TEXT,
ADD COLUMN     "type" "TagType" NOT NULL DEFAULT 'tone';

-- AlterTable
ALTER TABLE "question_versions" ALTER COLUMN "type" DROP NOT NULL;

-- AlterTable
ALTER TABLE "questions" ADD COLUMN     "flagReason" TEXT,
ADD COLUMN     "isFlagged" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "reactionsLaugh" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "reactionsLike" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "reactionsThink" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "visibility" "ContentVisibility" NOT NULL DEFAULT 'PUBLIC',
ALTER COLUMN "region" DROP NOT NULL,
ALTER COLUMN "localeCode" DROP NOT NULL;

-- AlterTable
ALTER TABLE "reactions" ALTER COLUMN "targetType" DROP NOT NULL;

-- AlterTable
ALTER TABLE "reflection_entries" ALTER COLUMN "localeCode" DROP NOT NULL;

-- AlterTable
ALTER TABLE "regional_events" ALTER COLUMN "region" DROP NOT NULL,
ALTER COLUMN "eventType" DROP NOT NULL;

-- AlterTable
ALTER TABLE "reports" ADD COLUMN     "region" TEXT;

-- AlterTable
ALTER TABLE "reward_calendars" ALTER COLUMN "calendarType" DROP NOT NULL,
ALTER COLUMN "rewardType" DROP NOT NULL;

-- AlterTable
ALTER TABLE "reward_offers" ALTER COLUMN "type" DROP NOT NULL;

-- AlterTable
ALTER TABLE "reward_proofs" ALTER COLUMN "proofType" DROP NOT NULL;

-- AlterTable
ALTER TABLE "seasonal_events" ALTER COLUMN "bonusType" DROP NOT NULL;

-- AlterTable
ALTER TABLE "sound_assets" ADD COLUMN     "region" TEXT,
ALTER COLUMN "eventType" DROP NOT NULL;

-- AlterTable
ALTER TABLE "subscription_plans" ADD COLUMN     "region" TEXT;

-- AlterTable
ALTER TABLE "system_metrics" ALTER COLUMN "metricType" DROP NOT NULL;

-- AlterTable
ALTER TABLE "tasks" ADD COLUMN     "region" TEXT;

-- AlterTable
ALTER TABLE "tax_transactions" ALTER COLUMN "sourceType" DROP NOT NULL;

-- AlterTable
ALTER TABLE "telemetry_aggregates" ALTER COLUMN "type" DROP NOT NULL;

-- AlterTable
ALTER TABLE "telemetry_events" ALTER COLUMN "type" DROP NOT NULL;

-- AlterTable
ALTER TABLE "theme_packs" ADD COLUMN     "region" TEXT,
ALTER COLUMN "type" DROP NOT NULL;

-- AlterTable
ALTER TABLE "threat_battles" ALTER COLUMN "attackType" DROP NOT NULL;

-- AlterTable
ALTER TABLE "user_achievements" ADD COLUMN     "tier" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "unlockedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "user_archetype_history" ALTER COLUMN "newType" DROP NOT NULL;

-- AlterTable
ALTER TABLE "user_legacy_bonuses" ALTER COLUMN "bonusType" DROP NOT NULL;

-- AlterTable
ALTER TABLE "user_reflections" ADD COLUMN     "mirrorEventId" TEXT;

-- AlterTable
ALTER TABLE "user_submissions" ADD COLUMN     "region" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "archetypeKey" TEXT,
ADD COLUMN     "avatarFrameId" TEXT,
ADD COLUMN     "avatarTheme" TEXT,
ADD COLUMN     "canBeAdded" TEXT NOT NULL DEFAULT 'anyone',
ADD COLUMN     "currentGeneration" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "isPublicProfile" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "karma" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lastArchetypeReroll" TIMESTAMP(3),
ADD COLUMN     "legacyPerk" TEXT,
ADD COLUMN     "moodFeed" TEXT,
ADD COLUMN     "prestigeBadgeId" TEXT,
ADD COLUMN     "prestigeColorTheme" TEXT,
ADD COLUMN     "prestigeCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "prestigeTitle" TEXT,
ADD COLUMN     "seasonLevel" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "seasonXP" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "settings" JSONB,
ADD COLUMN     "stats" JSONB,
ADD COLUMN     "statusMessage" TEXT;

-- AlterTable
ALTER TABLE "weekly_challenges" ALTER COLUMN "type" DROP NOT NULL;

-- AlterTable
ALTER TABLE "world_events" ALTER COLUMN "triggerType" DROP NOT NULL;

-- AlterTable
ALTER TABLE "world_threats" ALTER COLUMN "type" DROP NOT NULL;

-- DropEnum
DROP TYPE "Currency";

-- CreateTable
CREATE TABLE "affinities" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "type" TEXT,
    "strength" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "mutual" BOOLEAN NOT NULL DEFAULT false,
    "visibility" TEXT NOT NULL DEFAULT 'public',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "affinities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "synch_tests" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "region" TEXT,
    "questions" JSONB NOT NULL,
    "resultTextTemplates" JSONB NOT NULL,
    "rewardXP" INTEGER NOT NULL DEFAULT 0,
    "rewardKarma" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "synch_tests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_synch_tests" (
    "id" TEXT NOT NULL,
    "testId" TEXT NOT NULL,
    "userA" TEXT NOT NULL,
    "userB" TEXT NOT NULL,
    "answersA" JSONB NOT NULL DEFAULT '[]',
    "answersB" JSONB NOT NULL DEFAULT '[]',
    "compatibilityScore" DOUBLE PRECISION,
    "shared" BOOLEAN NOT NULL DEFAULT false,
    "status" "UserSynchTestStatus" NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_synch_tests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "faction_influence" (
    "id" TEXT NOT NULL,
    "factionId" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "influenceScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dailyDelta" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "contributionsCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "faction_influence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_factions" (
    "userId" TEXT NOT NULL,
    "factionId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "contributedXP" INTEGER NOT NULL DEFAULT 0,
    "isLeader" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "user_factions_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "community_creations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" "CreationType" NOT NULL,
    "content" JSONB NOT NULL,
    "status" "CreationStatus" NOT NULL DEFAULT 'pending',
    "likes" INTEGER NOT NULL DEFAULT 0,
    "rewardXP" INTEGER,
    "rewardKarma" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "community_creations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "community_creation_likes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "creationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "community_creation_likes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "postcards" (
    "id" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "message" VARCHAR(300) NOT NULL,
    "status" "PostcardStatus" NOT NULL DEFAULT 'pending',
    "deliveryAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "postcards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rarity_tiers" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "colorPrimary" TEXT NOT NULL,
    "colorGlow" TEXT,
    "frameStyle" TEXT,
    "rankOrder" INTEGER NOT NULL,
    "description" TEXT,
    "region" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rarity_tiers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_forks" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "region" TEXT,
    "optionA" TEXT NOT NULL,
    "optionB" TEXT NOT NULL,
    "effectA" JSONB NOT NULL,
    "effectB" JSONB NOT NULL,
    "rarity" "ForkRarity" NOT NULL DEFAULT 'common',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "daily_forks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_daily_forks" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "forkId" TEXT NOT NULL,
    "choice" "ForkChoice" NOT NULL,
    "resultSummary" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_daily_forks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "duet_runs" (
    "id" TEXT NOT NULL,
    "missionKey" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "DuetRunType" NOT NULL,
    "durationSec" INTEGER NOT NULL DEFAULT 300,
    "rewardXP" INTEGER NOT NULL DEFAULT 50,
    "rewardKarma" INTEGER NOT NULL DEFAULT 10,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "duet_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_duet_runs" (
    "id" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "userA" TEXT NOT NULL,
    "userB" TEXT NOT NULL,
    "status" "DuetRunStatus" NOT NULL DEFAULT 'pending',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "progressA" INTEGER NOT NULL DEFAULT 0,
    "progressB" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "user_duet_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rituals" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "rewardXP" INTEGER NOT NULL DEFAULT 10,
    "rewardKarma" INTEGER NOT NULL DEFAULT 5,
    "timeOfDay" "RitualTimeOfDay" NOT NULL DEFAULT 'any',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "rituals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_rituals" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ritualId" TEXT NOT NULL,
    "lastCompleted" TIMESTAMP(3),
    "streakCount" INTEGER NOT NULL DEFAULT 0,
    "totalCompleted" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "user_rituals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "micro_clans" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "region" TEXT,
    "leaderId" TEXT NOT NULL,
    "memberIds" TEXT[],
    "buffType" "MicroClanBuffType" NOT NULL,
    "buffValue" DOUBLE PRECISION NOT NULL DEFAULT 1.05,
    "seasonId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "micro_clans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "micro_clan_stats" (
    "id" TEXT NOT NULL,
    "clanId" TEXT NOT NULL,
    "xpTotal" INTEGER NOT NULL DEFAULT 0,
    "activityScore" INTEGER NOT NULL DEFAULT 0,
    "rank" INTEGER NOT NULL DEFAULT 9999,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "micro_clan_stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loot_moments" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "trigger" "LootTrigger" NOT NULL,
    "rewardType" "LootRewardType" NOT NULL,
    "rewardValue" INTEGER NOT NULL,
    "rarity" "LootRarity" NOT NULL DEFAULT 'common',
    "flavorText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "loot_moments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_loot_moments" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "momentId" TEXT NOT NULL,
    "rewardData" JSONB NOT NULL,
    "triggeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "redeemedAt" TIMESTAMP(3),

    CONSTRAINT "user_loot_moments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cultural_filters" (
    "id" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "category" TEXT,
    "description" TEXT,
    "severity" "CulturalFilterSeverity" NOT NULL DEFAULT 'warn',
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cultural_filters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "moderation_reports" (
    "id" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "type" "ModerationContentType" NOT NULL,
    "reasonTag" TEXT NOT NULL,
    "region" TEXT,
    "reporterId" TEXT,
    "isAnonymous" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "moderation_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_regional_contexts" (
    "id" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "localeCode" TEXT NOT NULL,
    "toneProfile" TEXT,
    "culturalNotes" TEXT,
    "humorStyle" TEXT,
    "tabooTopics" JSONB,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_regional_contexts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reflections" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "text" VARCHAR(200) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reflections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_items" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "equipped" BOOLEAN NOT NULL DEFAULT false,
    "durability" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "item_effects" (
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT,
    "magnitude" DOUBLE PRECISION NOT NULL,
    "trigger" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "item_effects_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "factions_legacy" (
    "id" TEXT NOT NULL,
    "factionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "secondaryColor" TEXT NOT NULL,
    "emblem" TEXT NOT NULL,
    "pattern" TEXT,
    "glowEffect" TEXT,
    "moralAxis" TEXT NOT NULL,
    "orderAxis" TEXT NOT NULL,
    "philosophy" TEXT NOT NULL,
    "xpBonus" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "goldBonus" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "karmaMultiplier" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "specialAbility" TEXT,
    "memberCount" INTEGER NOT NULL DEFAULT 0,
    "totalXp" INTEGER NOT NULL DEFAULT 0,
    "avgKarma" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "avgPrestige" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "hasCouncil" BOOLEAN NOT NULL DEFAULT false,
    "councilSize" INTEGER NOT NULL DEFAULT 5,
    "votingPower" TEXT NOT NULL DEFAULT 'karma_based',
    "lore" TEXT,
    "motto" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "factions_legacy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "npc_affinities" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "npcId" TEXT NOT NULL,
    "lastInteraction" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "affinityScore" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "npc_affinities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "npc_dialogues" (
    "id" TEXT NOT NULL,
    "npcId" TEXT NOT NULL,
    "triggerType" "DialogueTriggerType" NOT NULL,
    "text" TEXT NOT NULL,
    "moodTag" TEXT,
    "rarity" "DialogueRarity" NOT NULL DEFAULT 'common',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "npc_dialogues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cron_job_logs" (
    "id" TEXT NOT NULL,
    "jobKey" TEXT NOT NULL,
    "status" "CronJobStatus" NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "durationMs" INTEGER,
    "errorMessage" TEXT,

    CONSTRAINT "cron_job_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "archetypes" (
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "baseStats" JSONB NOT NULL,
    "growthRates" JSONB NOT NULL,
    "emoji" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "fusionWith" TEXT[],
    "fusionResult" TEXT,
    "fusionCost" INTEGER NOT NULL DEFAULT 500,
    "fusionVisual" JSONB,

    CONSTRAINT "archetypes_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "user_archetype_fusions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "baseA" TEXT NOT NULL,
    "baseB" TEXT NOT NULL,
    "result" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_archetype_fusions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question_templates" (
    "id" TEXT NOT NULL,
    "category" "QuestionTemplateCategory" NOT NULL,
    "archetypeAffinity" "ArchetypeAffinity",
    "tone" "QuestionTone" NOT NULL,
    "text" TEXT NOT NULL,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "question_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "battle_achievements" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "triggerType" "BattleAchievementTriggerType" NOT NULL,
    "thresholdValue" INTEGER NOT NULL DEFAULT 1,
    "rewardXP" INTEGER NOT NULL DEFAULT 0,
    "rewardBadgeId" TEXT,
    "rarity" "BattleAchievementRarity" NOT NULL DEFAULT 'common',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "battle_achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_battle_achievements" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "achievementId" TEXT NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "isUnlocked" BOOLEAN NOT NULL DEFAULT false,
    "isClaimed" BOOLEAN NOT NULL DEFAULT false,
    "unlockedAt" TIMESTAMP(3),
    "claimedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_battle_achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "group_stats" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "totalXP" INTEGER NOT NULL DEFAULT 0,
    "reflections" INTEGER NOT NULL DEFAULT 0,
    "avgLevel" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "group_stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public_polls" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "options" TEXT[],
    "region" TEXT,
    "visibility" TEXT NOT NULL DEFAULT 'public',
    "creatorId" TEXT NOT NULL,
    "allowFreetext" BOOLEAN NOT NULL DEFAULT false,
    "premiumCost" INTEGER NOT NULL DEFAULT 0,
    "rewardXP" INTEGER NOT NULL DEFAULT 50,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "public_polls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "poll_responses" (
    "id" TEXT NOT NULL,
    "pollId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "optionIdx" INTEGER,
    "freetext" TEXT,
    "region" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "poll_responses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public_challenges" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "region" TEXT,
    "rewardXP" INTEGER NOT NULL DEFAULT 100,
    "rewardItem" TEXT,
    "activeFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "activeTo" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "public_challenges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_packs" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "region" TEXT,
    "category" TEXT,
    "price" INTEGER NOT NULL DEFAULT 0,
    "premiumOnly" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "themeColor" TEXT,
    "icon" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "content_packs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pack_items" (
    "id" TEXT NOT NULL,
    "packId" TEXT NOT NULL,
    "type" TEXT,
    "refId" TEXT,
    "data" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pack_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_packs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "packId" TEXT NOT NULL,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_packs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "firesides" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "creatorId" TEXT NOT NULL,
    "participantIds" TEXT[],
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "firesides_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fireside_reactions" (
    "id" TEXT NOT NULL,
    "firesideId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "emoji" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fireside_reactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "memory_journals" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "content" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "sourceCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "memory_journals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comparison_cards" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "statsJson" JSONB NOT NULL,
    "funText" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "autoGenerated" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "comparison_cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "micro_missions" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT,
    "rarity" TEXT NOT NULL,
    "durationSec" INTEGER NOT NULL DEFAULT 300,
    "rewardXP" INTEGER NOT NULL DEFAULT 0,
    "rewardItem" TEXT,
    "rewardGold" INTEGER,
    "skipCostFood" INTEGER,
    "skipCostGold" INTEGER,
    "skipCostPremium" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "micro_missions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_micro_missions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "missionId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "user_micro_missions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avatar_moods" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "mood" TEXT NOT NULL,
    "pose" TEXT NOT NULL,
    "emotionScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "source" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "avatar_moods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "global_mood" (
    "id" TEXT NOT NULL,
    "calmScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "chaosScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "neutralScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dominantMood" "GlobalMoodType" NOT NULL DEFAULT 'neutral',
    "worldModifier" JSONB,

    CONSTRAINT "global_mood_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_mood_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reflectionId" TEXT,
    "mood" "GlobalMoodType" NOT NULL,
    "loggedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_mood_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mood_presets" (
    "key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "region" TEXT,
    "toneProfile" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "mood_presets_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "mentor_npcs" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "archetypeAffinity" TEXT[],
    "personality" TEXT NOT NULL,
    "introText" TEXT,
    "tips" TEXT[],
    "voiceTone" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mentor_npcs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_mentors" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "mentorId" TEXT NOT NULL,
    "affinityScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lastInteractionAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_mentors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "season_storylines" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "xpBonus" DOUBLE PRECISION,
    "goldBonus" DOUBLE PRECISION,
    "eventModifier" JSONB,
    "npcIds" TEXT[],
    "themeColor" TEXT,
    "posterUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "season_storylines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "storyline_achievements" (
    "id" TEXT NOT NULL,
    "seasonId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "rewardItem" TEXT,
    "rewardXP" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "storyline_achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mirror_events" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "theme" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "questionSet" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "rewardXP" INTEGER NOT NULL DEFAULT 0,
    "rewardBadgeId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mirror_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wildcard_events" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "triggerType" TEXT,
    "rewardXP" INTEGER NOT NULL DEFAULT 0,
    "rewardKarma" INTEGER NOT NULL DEFAULT 0,
    "flavorText" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wildcard_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_wildcard_events" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "wildcardId" TEXT NOT NULL,
    "redeemed" BOOLEAN NOT NULL DEFAULT false,
    "redeemedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_wildcard_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "share_cards" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT,
    "imageUrl" TEXT,
    "caption" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "share_cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "poster_cards" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "statsJson" JSONB NOT NULL,
    "imageUrl" TEXT,
    "isShared" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "poster_cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dream_events" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "triggerType" TEXT,
    "effect" JSONB NOT NULL,
    "flavorTone" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "dream_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_dream_events" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dreamId" TEXT NOT NULL,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_dream_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "generation_records" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "generationNumber" INTEGER NOT NULL,
    "prestigeId" TEXT,
    "inheritedPerks" JSONB NOT NULL DEFAULT '[]',
    "summaryText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "generation_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feedback" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "message" TEXT NOT NULL,
    "screenshotUrl" TEXT,
    "context" TEXT,
    "status" "FeedbackStatus" NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,

    CONSTRAINT "feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "creator_packs" (
    "id" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "region" TEXT,
    "type" "CreatorPackType" NOT NULL DEFAULT 'POLL',
    "status" "CreatorPackStatus" NOT NULL DEFAULT 'DRAFT',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedAt" TIMESTAMP(3),
    "approvedBy" TEXT,
    "rewardType" "CreatorRewardType",
    "rewardValue" INTEGER DEFAULT 0,
    "publishedAt" TIMESTAMP(3),
    "downloadsCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "creator_packs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_created_packs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "packId" TEXT NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "earnedRewards" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_created_packs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "item_recipes" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "ingredients" JSONB NOT NULL DEFAULT '[]',
    "craftTime" INTEGER NOT NULL DEFAULT 3000,
    "xpReward" INTEGER NOT NULL DEFAULT 10,
    "discoveredBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "item_recipes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "item_discoveries" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "discoveredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "item_discoveries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reflection_conversations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reflectionId" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "response" TEXT NOT NULL,
    "toneLevel" INTEGER NOT NULL,
    "modelUsed" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reflection_conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_stats" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "totalXP" INTEGER NOT NULL DEFAULT 0,
    "totalCoins" INTEGER NOT NULL DEFAULT 0,
    "totalKarma" INTEGER NOT NULL DEFAULT 0,
    "questionsCount" INTEGER NOT NULL DEFAULT 0,
    "streakDays" INTEGER NOT NULL DEFAULT 0,
    "currentRank" INTEGER,
    "lastWeekXP" INTEGER NOT NULL DEFAULT 0,
    "lastWeekCoins" INTEGER NOT NULL DEFAULT 0,
    "lastWeekKarma" INTEGER NOT NULL DEFAULT 0,
    "lastWeekQuestions" INTEGER NOT NULL DEFAULT 0,
    "lastWeekStreak" INTEGER NOT NULL DEFAULT 0,
    "rankChange" INTEGER,
    "metadata" JSONB,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chronicles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "ChronicleType" NOT NULL,
    "summaryText" TEXT NOT NULL,
    "statsJson" JSONB NOT NULL,
    "quote" TEXT,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "seasonId" TEXT,

    CONSTRAINT "chronicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "regions" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "buffType" "RegionBuffType" NOT NULL,
    "buffValue" DOUBLE PRECISION NOT NULL,
    "unlockRequirementType" "UnlockRequirementType",
    "unlockRequirementValue" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "regions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_regions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "regionId" TEXT NOT NULL,
    "isUnlocked" BOOLEAN NOT NULL DEFAULT false,
    "visitedAt" TIMESTAMP(3),
    "activeBuff" BOOLEAN NOT NULL DEFAULT false,
    "lastTravelAt" TIMESTAMP(3),

    CONSTRAINT "user_regions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quests" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "QuestType" NOT NULL,
    "requirementType" "QuestRequirementType" NOT NULL,
    "requirementValue" INTEGER NOT NULL,
    "rewardXP" INTEGER NOT NULL DEFAULT 0,
    "rewardGold" INTEGER NOT NULL DEFAULT 0,
    "rewardItem" TEXT,
    "rewardBadge" TEXT,
    "rewardKarma" INTEGER NOT NULL DEFAULT 0,
    "isRepeatable" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_quests" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "questId" TEXT NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "isClaimed" BOOLEAN NOT NULL DEFAULT false,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "user_quests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_lore_entries" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sourceType" "LoreSourceType" NOT NULL,
    "sourceId" TEXT,
    "tone" "LoreTone" NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_lore_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "friendships" (
    "id" TEXT NOT NULL,
    "userA" TEXT NOT NULL,
    "userB" TEXT NOT NULL,
    "status" "FriendshipStatus" NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "friendships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "social_duels" (
    "id" TEXT NOT NULL,
    "challengerId" TEXT NOT NULL,
    "opponentId" TEXT NOT NULL,
    "status" "DuelStatus" NOT NULL DEFAULT 'pending',
    "challengeType" "ChallengeType" NOT NULL,
    "rewardXP" INTEGER NOT NULL DEFAULT 0,
    "winnerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "social_duels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shared_missions" (
    "id" TEXT NOT NULL,
    "missionKey" TEXT NOT NULL,
    "participants" TEXT[],
    "status" "SharedMissionStatus" NOT NULL DEFAULT 'active',
    "rewardXP" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "shared_missions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "currencies" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "exchangeRate" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "currencies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_wallets" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "currencyKey" TEXT NOT NULL,
    "balance" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_wallets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "market_items" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "currencyKey" TEXT NOT NULL,
    "rarity" TEXT,
    "category" "ItemCategory" NOT NULL,
    "stock" INTEGER,
    "isEventItem" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "market_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "itemId" TEXT,
    "type" "TransactionType" NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "currencyKey" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "balance_settings" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "balance_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "economy_presets" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "modifiers" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "economy_presets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_alerts" (
    "id" TEXT NOT NULL,
    "type" "SystemAlertType" NOT NULL,
    "level" "SystemAlertLevel" NOT NULL,
    "message" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    "autoResolved" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "system_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alert_webhooks" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "type" "WebhookType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "alert_webhooks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meta_seasons" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "region" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "meta_seasons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prestige_records" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "seasonId" TEXT NOT NULL,
    "oldLevel" INTEGER NOT NULL,
    "legacyXP" INTEGER NOT NULL DEFAULT 0,
    "prestigeCount" INTEGER NOT NULL DEFAULT 1,
    "rewardBadgeId" TEXT,
    "prestigeTitle" TEXT,
    "prestigeBadgeId" TEXT,
    "prestigeColorTheme" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "prestige_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trending_questions" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "region" TEXT NOT NULL DEFAULT 'global',
    "windowStart" TIMESTAMP(3) NOT NULL,
    "windowEnd" TIMESTAMP(3) NOT NULL,
    "reactions24h" INTEGER NOT NULL DEFAULT 0,
    "score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trending_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skills" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT,
    "description" TEXT NOT NULL,
    "power" INTEGER NOT NULL,
    "cooldown" INTEGER,
    "icon" TEXT,
    "scaling" JSONB,

    CONSTRAINT "skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_skills" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "equipped" BOOLEAN NOT NULL DEFAULT false,
    "cooldownRemaining" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "user_skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pets" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT,
    "rarity" TEXT NOT NULL,
    "bonus" JSONB,
    "icon" TEXT,
    "description" TEXT,
    "region" TEXT,

    CONSTRAINT "pets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_pets" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "petId" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "equipped" BOOLEAN NOT NULL DEFAULT false,
    "nickname" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_pets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "enemies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "power" INTEGER NOT NULL,
    "defense" INTEGER NOT NULL,
    "maxHp" INTEGER NOT NULL,
    "rarity" TEXT NOT NULL DEFAULT 'common',
    "lootTable" JSONB NOT NULL,
    "icon" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "enemies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feed_posts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT,
    "content" TEXT,
    "refId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "visibility" TEXT NOT NULL DEFAULT 'public',

    CONSTRAINT "feed_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feed_comments" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "feed_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feed_reactions" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "emoji" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "feed_reactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compare_posts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "questionId" TEXT,
    "content" TEXT,
    "value" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "visibility" TEXT NOT NULL DEFAULT 'public',

    CONSTRAINT "compare_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compare_reactions" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "compare_reactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compare_comments" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "compare_comments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "affinities_type_mutual_idx" ON "affinities"("type", "mutual");

-- CreateIndex
CREATE UNIQUE INDEX "affinities_sourceId_targetId_type_key" ON "affinities"("sourceId", "targetId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "synch_tests_key_key" ON "synch_tests"("key");

-- CreateIndex
CREATE INDEX "synch_tests_isActive_idx" ON "synch_tests"("isActive");

-- CreateIndex
CREATE INDEX "user_synch_tests_userA_status_idx" ON "user_synch_tests"("userA", "status");

-- CreateIndex
CREATE INDEX "user_synch_tests_userB_status_idx" ON "user_synch_tests"("userB", "status");

-- CreateIndex
CREATE INDEX "user_synch_tests_testId_idx" ON "user_synch_tests"("testId");

-- CreateIndex
CREATE INDEX "faction_influence_region_factionId_idx" ON "faction_influence"("region", "factionId");

-- CreateIndex
CREATE UNIQUE INDEX "faction_influence_region_factionId_key" ON "faction_influence"("region", "factionId");

-- CreateIndex
CREATE INDEX "user_factions_factionId_idx" ON "user_factions"("factionId");

-- CreateIndex
CREATE INDEX "community_creations_status_idx" ON "community_creations"("status");

-- CreateIndex
CREATE INDEX "community_creations_userId_idx" ON "community_creations"("userId");

-- CreateIndex
CREATE INDEX "community_creations_createdAt_idx" ON "community_creations"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "community_creation_likes_creationId_idx" ON "community_creation_likes"("creationId");

-- CreateIndex
CREATE UNIQUE INDEX "community_creation_likes_userId_creationId_key" ON "community_creation_likes"("userId", "creationId");

-- CreateIndex
CREATE INDEX "postcards_receiverId_status_idx" ON "postcards"("receiverId", "status");

-- CreateIndex
CREATE INDEX "postcards_senderId_createdAt_idx" ON "postcards"("senderId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "postcards_status_deliveryAt_idx" ON "postcards"("status", "deliveryAt");

-- CreateIndex
CREATE UNIQUE INDEX "rarity_tiers_key_key" ON "rarity_tiers"("key");

-- CreateIndex
CREATE INDEX "rarity_tiers_rankOrder_idx" ON "rarity_tiers"("rankOrder");

-- CreateIndex
CREATE INDEX "rarity_tiers_isActive_idx" ON "rarity_tiers"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "daily_forks_key_key" ON "daily_forks"("key");

-- CreateIndex
CREATE INDEX "daily_forks_isActive_idx" ON "daily_forks"("isActive");

-- CreateIndex
CREATE INDEX "daily_forks_rarity_idx" ON "daily_forks"("rarity");

-- CreateIndex
CREATE INDEX "daily_forks_createdAt_idx" ON "daily_forks"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "user_daily_forks_userId_createdAt_idx" ON "user_daily_forks"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "user_daily_forks_forkId_idx" ON "user_daily_forks"("forkId");

-- CreateIndex
CREATE UNIQUE INDEX "user_daily_forks_userId_forkId_key" ON "user_daily_forks"("userId", "forkId");

-- CreateIndex
CREATE UNIQUE INDEX "duet_runs_missionKey_key" ON "duet_runs"("missionKey");

-- CreateIndex
CREATE INDEX "duet_runs_isActive_idx" ON "duet_runs"("isActive");

-- CreateIndex
CREATE INDEX "duet_runs_type_idx" ON "duet_runs"("type");

-- CreateIndex
CREATE INDEX "duet_runs_createdAt_idx" ON "duet_runs"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "user_duet_runs_userA_status_idx" ON "user_duet_runs"("userA", "status");

-- CreateIndex
CREATE INDEX "user_duet_runs_userB_status_idx" ON "user_duet_runs"("userB", "status");

-- CreateIndex
CREATE INDEX "user_duet_runs_runId_status_idx" ON "user_duet_runs"("runId", "status");

-- CreateIndex
CREATE INDEX "user_duet_runs_startedAt_idx" ON "user_duet_runs"("startedAt");

-- CreateIndex
CREATE UNIQUE INDEX "rituals_key_key" ON "rituals"("key");

-- CreateIndex
CREATE INDEX "rituals_isActive_idx" ON "rituals"("isActive");

-- CreateIndex
CREATE INDEX "rituals_timeOfDay_idx" ON "rituals"("timeOfDay");

-- CreateIndex
CREATE INDEX "rituals_createdAt_idx" ON "rituals"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "user_rituals_userId_idx" ON "user_rituals"("userId");

-- CreateIndex
CREATE INDEX "user_rituals_ritualId_idx" ON "user_rituals"("ritualId");

-- CreateIndex
CREATE INDEX "user_rituals_lastCompleted_idx" ON "user_rituals"("lastCompleted");

-- CreateIndex
CREATE UNIQUE INDEX "user_rituals_userId_ritualId_key" ON "user_rituals"("userId", "ritualId");

-- CreateIndex
CREATE INDEX "micro_clans_leaderId_idx" ON "micro_clans"("leaderId");

-- CreateIndex
CREATE INDEX "micro_clans_seasonId_idx" ON "micro_clans"("seasonId");

-- CreateIndex
CREATE INDEX "micro_clans_isActive_idx" ON "micro_clans"("isActive");

-- CreateIndex
CREATE INDEX "micro_clans_createdAt_idx" ON "micro_clans"("createdAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "micro_clan_stats_clanId_key" ON "micro_clan_stats"("clanId");

-- CreateIndex
CREATE INDEX "micro_clan_stats_rank_idx" ON "micro_clan_stats"("rank");

-- CreateIndex
CREATE INDEX "micro_clan_stats_xpTotal_idx" ON "micro_clan_stats"("xpTotal" DESC);

-- CreateIndex
CREATE INDEX "micro_clan_stats_activityScore_idx" ON "micro_clan_stats"("activityScore" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "loot_moments_key_key" ON "loot_moments"("key");

-- CreateIndex
CREATE INDEX "loot_moments_trigger_idx" ON "loot_moments"("trigger");

-- CreateIndex
CREATE INDEX "loot_moments_rarity_idx" ON "loot_moments"("rarity");

-- CreateIndex
CREATE INDEX "loot_moments_isActive_idx" ON "loot_moments"("isActive");

-- CreateIndex
CREATE INDEX "loot_moments_createdAt_idx" ON "loot_moments"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "user_loot_moments_userId_triggeredAt_idx" ON "user_loot_moments"("userId", "triggeredAt" DESC);

-- CreateIndex
CREATE INDEX "user_loot_moments_userId_redeemedAt_idx" ON "user_loot_moments"("userId", "redeemedAt");

-- CreateIndex
CREATE INDEX "user_loot_moments_momentId_idx" ON "user_loot_moments"("momentId");

-- CreateIndex
CREATE INDEX "cultural_filters_region_tag_idx" ON "cultural_filters"("region", "tag");

-- CreateIndex
CREATE INDEX "moderation_reports_type_region_idx" ON "moderation_reports"("type", "region");

-- CreateIndex
CREATE INDEX "ai_regional_contexts_region_idx" ON "ai_regional_contexts"("region");

-- CreateIndex
CREATE INDEX "ai_regional_contexts_localeCode_idx" ON "ai_regional_contexts"("localeCode");

-- CreateIndex
CREATE INDEX "reflections_userId_idx" ON "reflections"("userId");

-- CreateIndex
CREATE INDEX "reflections_createdAt_idx" ON "reflections"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "user_items_userId_idx" ON "user_items"("userId");

-- CreateIndex
CREATE INDEX "user_items_itemId_idx" ON "user_items"("itemId");

-- CreateIndex
CREATE INDEX "user_items_equipped_idx" ON "user_items"("equipped");

-- CreateIndex
CREATE UNIQUE INDEX "user_items_userId_itemId_key" ON "user_items"("userId", "itemId");

-- CreateIndex
CREATE INDEX "item_effects_type_idx" ON "item_effects"("type");

-- CreateIndex
CREATE INDEX "item_effects_trigger_idx" ON "item_effects"("trigger");

-- CreateIndex
CREATE UNIQUE INDEX "factions_legacy_factionId_key" ON "factions_legacy"("factionId");

-- CreateIndex
CREATE INDEX "factions_legacy_isActive_memberCount_idx" ON "factions_legacy"("isActive", "memberCount");

-- CreateIndex
CREATE INDEX "npc_affinities_userId_npcId_idx" ON "npc_affinities"("userId", "npcId");

-- CreateIndex
CREATE INDEX "npc_affinities_affinityScore_idx" ON "npc_affinities"("affinityScore");

-- CreateIndex
CREATE INDEX "npc_affinities_lastInteraction_idx" ON "npc_affinities"("lastInteraction");

-- CreateIndex
CREATE UNIQUE INDEX "npc_affinities_userId_npcId_key" ON "npc_affinities"("userId", "npcId");

-- CreateIndex
CREATE INDEX "npc_dialogues_npcId_triggerType_idx" ON "npc_dialogues"("npcId", "triggerType");

-- CreateIndex
CREATE INDEX "npc_dialogues_npcId_rarity_idx" ON "npc_dialogues"("npcId", "rarity");

-- CreateIndex
CREATE INDEX "cron_job_logs_jobKey_startedAt_idx" ON "cron_job_logs"("jobKey", "startedAt" DESC);

-- CreateIndex
CREATE INDEX "user_archetype_fusions_userId_createdAt_idx" ON "user_archetype_fusions"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "question_templates_category_isActive_idx" ON "question_templates"("category", "isActive");

-- CreateIndex
CREATE INDEX "question_templates_archetypeAffinity_isActive_idx" ON "question_templates"("archetypeAffinity", "isActive");

-- CreateIndex
CREATE INDEX "question_templates_tone_isActive_idx" ON "question_templates"("tone", "isActive");

-- CreateIndex
CREATE INDEX "question_templates_weight_idx" ON "question_templates"("weight");

-- CreateIndex
CREATE UNIQUE INDEX "battle_achievements_key_key" ON "battle_achievements"("key");

-- CreateIndex
CREATE INDEX "battle_achievements_triggerType_isActive_idx" ON "battle_achievements"("triggerType", "isActive");

-- CreateIndex
CREATE INDEX "battle_achievements_rarity_isActive_idx" ON "battle_achievements"("rarity", "isActive");

-- CreateIndex
CREATE INDEX "battle_achievements_thresholdValue_idx" ON "battle_achievements"("thresholdValue");

-- CreateIndex
CREATE INDEX "user_battle_achievements_userId_isUnlocked_idx" ON "user_battle_achievements"("userId", "isUnlocked");

-- CreateIndex
CREATE INDEX "user_battle_achievements_userId_isClaimed_idx" ON "user_battle_achievements"("userId", "isClaimed");

-- CreateIndex
CREATE INDEX "user_battle_achievements_achievementId_idx" ON "user_battle_achievements"("achievementId");

-- CreateIndex
CREATE UNIQUE INDEX "user_battle_achievements_userId_achievementId_key" ON "user_battle_achievements"("userId", "achievementId");

-- CreateIndex
CREATE INDEX "group_stats_groupId_updatedAt_idx" ON "group_stats"("groupId", "updatedAt");

-- CreateIndex
CREATE INDEX "public_polls_region_createdAt_idx" ON "public_polls"("region", "createdAt");

-- CreateIndex
CREATE INDEX "poll_responses_pollId_userId_idx" ON "poll_responses"("pollId", "userId");

-- CreateIndex
CREATE INDEX "public_challenges_region_createdAt_idx" ON "public_challenges"("region", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "content_packs_key_key" ON "content_packs"("key");

-- CreateIndex
CREATE INDEX "content_packs_category_isActive_idx" ON "content_packs"("category", "isActive");

-- CreateIndex
CREATE INDEX "pack_items_packId_idx" ON "pack_items"("packId");

-- CreateIndex
CREATE INDEX "user_packs_packId_idx" ON "user_packs"("packId");

-- CreateIndex
CREATE UNIQUE INDEX "user_packs_userId_packId_key" ON "user_packs"("userId", "packId");

-- CreateIndex
CREATE INDEX "firesides_isActive_expiresAt_idx" ON "firesides"("isActive", "expiresAt");

-- CreateIndex
CREATE INDEX "fireside_reactions_firesideId_userId_idx" ON "fireside_reactions"("firesideId", "userId");

-- CreateIndex
CREATE INDEX "memory_journals_userId_createdAt_idx" ON "memory_journals"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "comparison_cards_userId_generatedAt_idx" ON "comparison_cards"("userId", "generatedAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "micro_missions_key_key" ON "micro_missions"("key");

-- CreateIndex
CREATE INDEX "micro_missions_isActive_rarity_idx" ON "micro_missions"("isActive", "rarity");

-- CreateIndex
CREATE INDEX "user_micro_missions_userId_status_idx" ON "user_micro_missions"("userId", "status");

-- CreateIndex
CREATE INDEX "avatar_moods_userId_idx" ON "avatar_moods"("userId");

-- CreateIndex
CREATE INDEX "user_mood_logs_userId_loggedAt_idx" ON "user_mood_logs"("userId", "loggedAt" DESC);

-- CreateIndex
CREATE INDEX "user_mood_logs_mood_loggedAt_idx" ON "user_mood_logs"("mood", "loggedAt");

-- CreateIndex
CREATE INDEX "user_mood_logs_loggedAt_idx" ON "user_mood_logs"("loggedAt");

-- CreateIndex
CREATE UNIQUE INDEX "mentor_npcs_key_key" ON "mentor_npcs"("key");

-- CreateIndex
CREATE INDEX "user_mentors_userId_mentorId_idx" ON "user_mentors"("userId", "mentorId");

-- CreateIndex
CREATE UNIQUE INDEX "user_mentors_userId_mentorId_key" ON "user_mentors"("userId", "mentorId");

-- CreateIndex
CREATE UNIQUE INDEX "season_storylines_key_key" ON "season_storylines"("key");

-- CreateIndex
CREATE INDEX "season_storylines_isActive_idx" ON "season_storylines"("isActive");

-- CreateIndex
CREATE INDEX "season_storylines_startDate_idx" ON "season_storylines"("startDate" DESC);

-- CreateIndex
CREATE INDEX "storyline_achievements_seasonId_idx" ON "storyline_achievements"("seasonId");

-- CreateIndex
CREATE UNIQUE INDEX "mirror_events_key_key" ON "mirror_events"("key");

-- CreateIndex
CREATE INDEX "mirror_events_active_idx" ON "mirror_events"("active");

-- CreateIndex
CREATE INDEX "mirror_events_startDate_idx" ON "mirror_events"("startDate");

-- CreateIndex
CREATE INDEX "mirror_events_endDate_idx" ON "mirror_events"("endDate");

-- CreateIndex
CREATE INDEX "wildcard_events_triggerType_idx" ON "wildcard_events"("triggerType");

-- CreateIndex
CREATE INDEX "user_wildcard_events_userId_createdAt_idx" ON "user_wildcard_events"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "user_wildcard_events_userId_redeemed_idx" ON "user_wildcard_events"("userId", "redeemed");

-- CreateIndex
CREATE INDEX "share_cards_userId_createdAt_idx" ON "share_cards"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "share_cards_expiresAt_idx" ON "share_cards"("expiresAt");

-- CreateIndex
CREATE INDEX "poster_cards_userId_createdAt_idx" ON "poster_cards"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "poster_cards_isShared_createdAt_idx" ON "poster_cards"("isShared", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "poster_cards_createdAt_idx" ON "poster_cards"("createdAt");

-- CreateIndex
CREATE INDEX "dream_events_isActive_idx" ON "dream_events"("isActive");

-- CreateIndex
CREATE INDEX "dream_events_triggerType_idx" ON "dream_events"("triggerType");

-- CreateIndex
CREATE INDEX "dream_events_flavorTone_idx" ON "dream_events"("flavorTone");

-- CreateIndex
CREATE INDEX "user_dream_events_userId_createdAt_idx" ON "user_dream_events"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "user_dream_events_userId_resolved_idx" ON "user_dream_events"("userId", "resolved");

-- CreateIndex
CREATE INDEX "generation_records_userId_generationNumber_idx" ON "generation_records"("userId", "generationNumber");

-- CreateIndex
CREATE INDEX "generation_records_userId_createdAt_idx" ON "generation_records"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "feedback_status_idx" ON "feedback"("status");

-- CreateIndex
CREATE INDEX "feedback_createdAt_idx" ON "feedback"("createdAt");

-- CreateIndex
CREATE INDEX "feedback_userId_idx" ON "feedback"("userId");

-- CreateIndex
CREATE INDEX "creator_packs_status_idx" ON "creator_packs"("status");

-- CreateIndex
CREATE INDEX "creator_packs_creatorId_idx" ON "creator_packs"("creatorId");

-- CreateIndex
CREATE INDEX "creator_packs_type_idx" ON "creator_packs"("type");

-- CreateIndex
CREATE INDEX "creator_packs_createdAt_idx" ON "creator_packs"("createdAt");

-- CreateIndex
CREATE INDEX "creator_packs_publishedAt_idx" ON "creator_packs"("publishedAt");

-- CreateIndex
CREATE INDEX "creator_packs_downloadsCount_idx" ON "creator_packs"("downloadsCount");

-- CreateIndex
CREATE INDEX "user_created_packs_userId_isPublished_idx" ON "user_created_packs"("userId", "isPublished");

-- CreateIndex
CREATE INDEX "user_created_packs_packId_idx" ON "user_created_packs"("packId");

-- CreateIndex
CREATE INDEX "user_created_packs_createdAt_idx" ON "user_created_packs"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "user_created_packs_userId_packId_key" ON "user_created_packs"("userId", "packId");

-- CreateIndex
CREATE INDEX "item_recipes_itemId_idx" ON "item_recipes"("itemId");

-- CreateIndex
CREATE INDEX "item_recipes_discoveredBy_idx" ON "item_recipes"("discoveredBy");

-- CreateIndex
CREATE INDEX "item_recipes_createdAt_idx" ON "item_recipes"("createdAt");

-- CreateIndex
CREATE INDEX "item_discoveries_userId_idx" ON "item_discoveries"("userId");

-- CreateIndex
CREATE INDEX "item_discoveries_itemId_idx" ON "item_discoveries"("itemId");

-- CreateIndex
CREATE INDEX "item_discoveries_discoveredAt_idx" ON "item_discoveries"("discoveredAt");

-- CreateIndex
CREATE UNIQUE INDEX "item_discoveries_userId_itemId_key" ON "item_discoveries"("userId", "itemId");

-- CreateIndex
CREATE INDEX "reflection_conversations_userId_createdAt_idx" ON "reflection_conversations"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "reflection_conversations_reflectionId_idx" ON "reflection_conversations"("reflectionId");

-- CreateIndex
CREATE INDEX "reflection_conversations_createdAt_idx" ON "reflection_conversations"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "user_stats_userId_key" ON "user_stats"("userId");

-- CreateIndex
CREATE INDEX "user_stats_userId_idx" ON "user_stats"("userId");

-- CreateIndex
CREATE INDEX "user_stats_currentRank_idx" ON "user_stats"("currentRank");

-- CreateIndex
CREATE INDEX "chronicles_userId_generatedAt_idx" ON "chronicles"("userId", "generatedAt" DESC);

-- CreateIndex
CREATE INDEX "chronicles_type_idx" ON "chronicles"("type");

-- CreateIndex
CREATE INDEX "chronicles_seasonId_idx" ON "chronicles"("seasonId");

-- CreateIndex
CREATE UNIQUE INDEX "regions_key_key" ON "regions"("key");

-- CreateIndex
CREATE INDEX "regions_orderIndex_idx" ON "regions"("orderIndex");

-- CreateIndex
CREATE INDEX "regions_isActive_idx" ON "regions"("isActive");

-- CreateIndex
CREATE INDEX "user_regions_userId_activeBuff_idx" ON "user_regions"("userId", "activeBuff");

-- CreateIndex
CREATE INDEX "user_regions_regionId_idx" ON "user_regions"("regionId");

-- CreateIndex
CREATE UNIQUE INDEX "user_regions_userId_regionId_key" ON "user_regions"("userId", "regionId");

-- CreateIndex
CREATE UNIQUE INDEX "quests_key_key" ON "quests"("key");

-- CreateIndex
CREATE INDEX "quests_type_isActive_idx" ON "quests"("type", "isActive");

-- CreateIndex
CREATE INDEX "quests_isActive_idx" ON "quests"("isActive");

-- CreateIndex
CREATE INDEX "user_quests_userId_isCompleted_isClaimed_idx" ON "user_quests"("userId", "isCompleted", "isClaimed");

-- CreateIndex
CREATE INDEX "user_quests_questId_idx" ON "user_quests"("questId");

-- CreateIndex
CREATE UNIQUE INDEX "user_quests_userId_questId_key" ON "user_quests"("userId", "questId");

-- CreateIndex
CREATE INDEX "user_lore_entries_userId_createdAt_idx" ON "user_lore_entries"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "user_lore_entries_sourceType_idx" ON "user_lore_entries"("sourceType");

-- CreateIndex
CREATE INDEX "user_lore_entries_tone_idx" ON "user_lore_entries"("tone");

-- CreateIndex
CREATE INDEX "friendships_userA_status_idx" ON "friendships"("userA", "status");

-- CreateIndex
CREATE INDEX "friendships_userB_status_idx" ON "friendships"("userB", "status");

-- CreateIndex
CREATE UNIQUE INDEX "friendships_userA_userB_key" ON "friendships"("userA", "userB");

-- CreateIndex
CREATE INDEX "social_duels_challengerId_status_idx" ON "social_duels"("challengerId", "status");

-- CreateIndex
CREATE INDEX "social_duels_opponentId_status_idx" ON "social_duels"("opponentId", "status");

-- CreateIndex
CREATE INDEX "social_duels_status_idx" ON "social_duels"("status");

-- CreateIndex
CREATE INDEX "shared_missions_status_idx" ON "shared_missions"("status");

-- CreateIndex
CREATE INDEX "shared_missions_missionKey_idx" ON "shared_missions"("missionKey");

-- CreateIndex
CREATE UNIQUE INDEX "currencies_key_key" ON "currencies"("key");

-- CreateIndex
CREATE INDEX "currencies_key_idx" ON "currencies"("key");

-- CreateIndex
CREATE INDEX "user_wallets_userId_idx" ON "user_wallets"("userId");

-- CreateIndex
CREATE INDEX "user_wallets_currencyKey_idx" ON "user_wallets"("currencyKey");

-- CreateIndex
CREATE UNIQUE INDEX "user_wallets_userId_currencyKey_key" ON "user_wallets"("userId", "currencyKey");

-- CreateIndex
CREATE INDEX "market_items_category_idx" ON "market_items"("category");

-- CreateIndex
CREATE INDEX "market_items_rarity_idx" ON "market_items"("rarity");

-- CreateIndex
CREATE INDEX "market_items_isEventItem_idx" ON "market_items"("isEventItem");

-- CreateIndex
CREATE INDEX "market_items_currencyKey_idx" ON "market_items"("currencyKey");

-- CreateIndex
CREATE INDEX "transactions_userId_createdAt_idx" ON "transactions"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "transactions_itemId_idx" ON "transactions"("itemId");

-- CreateIndex
CREATE INDEX "transactions_type_idx" ON "transactions"("type");

-- CreateIndex
CREATE INDEX "transactions_currencyKey_idx" ON "transactions"("currencyKey");

-- CreateIndex
CREATE UNIQUE INDEX "balance_settings_key_key" ON "balance_settings"("key");

-- CreateIndex
CREATE INDEX "balance_settings_key_idx" ON "balance_settings"("key");

-- CreateIndex
CREATE UNIQUE INDEX "economy_presets_name_key" ON "economy_presets"("name");

-- CreateIndex
CREATE INDEX "economy_presets_name_idx" ON "economy_presets"("name");

-- CreateIndex
CREATE INDEX "system_alerts_createdAt_idx" ON "system_alerts"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "system_alerts_level_idx" ON "system_alerts"("level");

-- CreateIndex
CREATE INDEX "system_alerts_type_idx" ON "system_alerts"("type");

-- CreateIndex
CREATE INDEX "system_alerts_resolvedAt_idx" ON "system_alerts"("resolvedAt");

-- CreateIndex
CREATE INDEX "alert_webhooks_isActive_idx" ON "alert_webhooks"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "meta_seasons_key_key" ON "meta_seasons"("key");

-- CreateIndex
CREATE INDEX "meta_seasons_isActive_idx" ON "meta_seasons"("isActive");

-- CreateIndex
CREATE INDEX "meta_seasons_startDate_idx" ON "meta_seasons"("startDate");

-- CreateIndex
CREATE INDEX "prestige_records_userId_idx" ON "prestige_records"("userId");

-- CreateIndex
CREATE INDEX "prestige_records_seasonId_idx" ON "prestige_records"("seasonId");

-- CreateIndex
CREATE INDEX "prestige_records_createdAt_idx" ON "prestige_records"("createdAt");

-- CreateIndex
CREATE INDEX "trending_questions_region_score_idx" ON "trending_questions"("region", "score");

-- CreateIndex
CREATE INDEX "trending_questions_windowEnd_idx" ON "trending_questions"("windowEnd");

-- CreateIndex
CREATE UNIQUE INDEX "trending_questions_questionId_region_key" ON "trending_questions"("questionId", "region");

-- CreateIndex
CREATE INDEX "user_skills_userId_idx" ON "user_skills"("userId");

-- CreateIndex
CREATE INDEX "user_skills_userId_equipped_idx" ON "user_skills"("userId", "equipped");

-- CreateIndex
CREATE INDEX "user_pets_userId_equipped_idx" ON "user_pets"("userId", "equipped");

-- CreateIndex
CREATE INDEX "user_pets_userId_idx" ON "user_pets"("userId");

-- CreateIndex
CREATE INDEX "user_pets_petId_idx" ON "user_pets"("petId");

-- CreateIndex
CREATE INDEX "enemies_rarity_idx" ON "enemies"("rarity");

-- CreateIndex
CREATE INDEX "enemies_level_idx" ON "enemies"("level");

-- CreateIndex
CREATE INDEX "feed_posts_createdAt_idx" ON "feed_posts"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "feed_posts_userId_createdAt_idx" ON "feed_posts"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "feed_posts_type_createdAt_idx" ON "feed_posts"("type", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "feed_comments_postId_createdAt_idx" ON "feed_comments"("postId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "feed_comments_userId_idx" ON "feed_comments"("userId");

-- CreateIndex
CREATE INDEX "feed_reactions_postId_idx" ON "feed_reactions"("postId");

-- CreateIndex
CREATE INDEX "feed_reactions_userId_idx" ON "feed_reactions"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "feed_reactions_postId_userId_emoji_key" ON "feed_reactions"("postId", "userId", "emoji");

-- CreateIndex
CREATE INDEX "compare_posts_createdAt_idx" ON "compare_posts"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "compare_posts_userId_createdAt_idx" ON "compare_posts"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "compare_posts_questionId_idx" ON "compare_posts"("questionId");

-- CreateIndex
CREATE INDEX "compare_reactions_postId_createdAt_idx" ON "compare_reactions"("postId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "compare_reactions_postId_userId_idx" ON "compare_reactions"("postId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "compare_reactions_postId_userId_type_key" ON "compare_reactions"("postId", "userId", "type");

-- CreateIndex
CREATE INDEX "compare_comments_postId_createdAt_idx" ON "compare_comments"("postId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "compare_comments_userId_idx" ON "compare_comments"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Badge_key_key" ON "Badge"("key");

-- CreateIndex
CREATE INDEX "Badge_rarity_idx" ON "Badge"("rarity");

-- CreateIndex
CREATE INDEX "Badge_unlockType_idx" ON "Badge"("unlockType");

-- CreateIndex
CREATE INDEX "Badge_isActive_idx" ON "Badge"("isActive");

-- CreateIndex
CREATE INDEX "Badge_seasonId_idx" ON "Badge"("seasonId");

-- CreateIndex
CREATE INDEX "UserBadge_userId_isClaimed_idx" ON "UserBadge"("userId", "isClaimed");

-- CreateIndex
CREATE INDEX "UserBadge_badgeId_idx" ON "UserBadge"("badgeId");

-- CreateIndex
CREATE INDEX "UserQuestion_userId_servedAt_idx" ON "UserQuestion"("userId", "servedAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "achievements_key_key" ON "achievements"("key");

-- CreateIndex
CREATE INDEX "achievements_category_idx" ON "achievements"("category");

-- CreateIndex
CREATE INDEX "achievements_key_idx" ON "achievements"("key");

-- CreateIndex
CREATE INDEX "activities_type_idx" ON "activities"("type");

-- CreateIndex
CREATE INDEX "comments_visibility_idx" ON "comments"("visibility");

-- CreateIndex
CREATE INDEX "cosmetic_items_rarityId_idx" ON "cosmetic_items"("rarityId");

-- CreateIndex
CREATE INDEX "events_visibility_idx" ON "events"("visibility");

-- CreateIndex
CREATE UNIQUE INDEX "factions_key_key" ON "factions"("key");

-- CreateIndex
CREATE INDEX "factions_isActive_idx" ON "factions"("isActive");

-- CreateIndex
CREATE INDEX "group_members_groupId_userId_idx" ON "group_members"("groupId", "userId");

-- CreateIndex
CREATE INDEX "groups_visibility_createdAt_idx" ON "groups"("visibility", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "inventory_items_rarity_idx" ON "inventory_items"("rarity");

-- CreateIndex
CREATE INDEX "inventory_items_equipped_idx" ON "inventory_items"("equipped");

-- CreateIndex
CREATE UNIQUE INDEX "items_key_key" ON "items"("key");

-- CreateIndex
CREATE INDEX "items_rarityId_idx" ON "items"("rarityId");

-- CreateIndex
CREATE INDEX "items_key_idx" ON "items"("key");

-- CreateIndex
CREATE INDEX "market_listings_currencyKey_status_idx" ON "market_listings"("currencyKey", "status");

-- CreateIndex
CREATE INDEX "market_listings_buyerId_idx" ON "market_listings"("buyerId");

-- CreateIndex
CREATE INDEX "notifications_userId_createdAt_idx" ON "notifications"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "notifications_userId_isRead_createdAt_idx" ON "notifications"("userId", "isRead", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "npc_profiles_archetypeAffinity_isActive_idx" ON "npc_profiles"("archetypeAffinity", "isActive");

-- CreateIndex
CREATE INDEX "profile_themes_rarityId_idx" ON "profile_themes"("rarityId");

-- CreateIndex
CREATE INDEX "question_version_tags_tagId_idx" ON "question_version_tags"("tagId");

-- CreateIndex
CREATE INDEX "question_version_tags_questionVersionId_idx" ON "question_version_tags"("questionVersionId");

-- CreateIndex
CREATE INDEX "questions_visibility_idx" ON "questions"("visibility");

-- CreateIndex
CREATE INDEX "questions_region_createdAt_idx" ON "questions"("region", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "user_achievements_userId_earnedAt_idx" ON "user_achievements"("userId", "earnedAt");

-- CreateIndex
CREATE UNIQUE INDEX "user_achievements_userId_achievementId_tier_key" ON "user_achievements"("userId", "achievementId", "tier");

-- CreateIndex
CREATE INDEX "user_reflections_mirrorEventId_idx" ON "user_reflections"("mirrorEventId");

-- CreateIndex
CREATE INDEX "user_reflections_userId_createdAt_idx" ON "user_reflections"("userId", "createdAt" DESC);

-- AddForeignKey
ALTER TABLE "affinities" ADD CONSTRAINT "affinities_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "affinities" ADD CONSTRAINT "affinities_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_synch_tests" ADD CONSTRAINT "user_synch_tests_testId_fkey" FOREIGN KEY ("testId") REFERENCES "synch_tests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_synch_tests" ADD CONSTRAINT "user_synch_tests_userA_fkey" FOREIGN KEY ("userA") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_synch_tests" ADD CONSTRAINT "user_synch_tests_userB_fkey" FOREIGN KEY ("userB") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faction_influence" ADD CONSTRAINT "faction_influence_factionId_fkey" FOREIGN KEY ("factionId") REFERENCES "factions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_factions" ADD CONSTRAINT "user_factions_factionId_fkey" FOREIGN KEY ("factionId") REFERENCES "factions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_factions" ADD CONSTRAINT "user_factions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_creations" ADD CONSTRAINT "community_creations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_creation_likes" ADD CONSTRAINT "community_creation_likes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_creation_likes" ADD CONSTRAINT "community_creation_likes_creationId_fkey" FOREIGN KEY ("creationId") REFERENCES "community_creations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "postcards" ADD CONSTRAINT "postcards_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "postcards" ADD CONSTRAINT "postcards_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_daily_forks" ADD CONSTRAINT "user_daily_forks_forkId_fkey" FOREIGN KEY ("forkId") REFERENCES "daily_forks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_daily_forks" ADD CONSTRAINT "user_daily_forks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_duet_runs" ADD CONSTRAINT "user_duet_runs_runId_fkey" FOREIGN KEY ("runId") REFERENCES "duet_runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_duet_runs" ADD CONSTRAINT "user_duet_runs_userA_fkey" FOREIGN KEY ("userA") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_duet_runs" ADD CONSTRAINT "user_duet_runs_userB_fkey" FOREIGN KEY ("userB") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_rituals" ADD CONSTRAINT "user_rituals_ritualId_fkey" FOREIGN KEY ("ritualId") REFERENCES "rituals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_rituals" ADD CONSTRAINT "user_rituals_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "micro_clans" ADD CONSTRAINT "micro_clans_leaderId_fkey" FOREIGN KEY ("leaderId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "micro_clan_stats" ADD CONSTRAINT "micro_clan_stats_clanId_fkey" FOREIGN KEY ("clanId") REFERENCES "micro_clans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_loot_moments" ADD CONSTRAINT "user_loot_moments_momentId_fkey" FOREIGN KEY ("momentId") REFERENCES "loot_moments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_loot_moments" ADD CONSTRAINT "user_loot_moments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reflections" ADD CONSTRAINT "reflections_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "items" ADD CONSTRAINT "items_rarityId_fkey" FOREIGN KEY ("rarityId") REFERENCES "rarity_tiers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_effectKey_fkey" FOREIGN KEY ("effectKey") REFERENCES "item_effects"("key") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_items" ADD CONSTRAINT "user_items_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_items" ADD CONSTRAINT "user_items_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "market_listings" ADD CONSTRAINT "market_listings_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "inventory_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "market_listings" ADD CONSTRAINT "market_listings_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile_themes" ADD CONSTRAINT "profile_themes_rarityId_fkey" FOREIGN KEY ("rarityId") REFERENCES "rarity_tiers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faction_members" ADD CONSTRAINT "faction_members_factionId_fkey" FOREIGN KEY ("factionId") REFERENCES "factions_legacy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faction_votes" ADD CONSTRAINT "faction_votes_factionId_fkey" FOREIGN KEY ("factionId") REFERENCES "factions_legacy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "npc_affinities" ADD CONSTRAINT "npc_affinities_npcId_fkey" FOREIGN KEY ("npcId") REFERENCES "npc_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "npc_affinities" ADD CONSTRAINT "npc_affinities_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "npc_dialogues" ADD CONSTRAINT "npc_dialogues_npcId_fkey" FOREIGN KEY ("npcId") REFERENCES "npc_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_archetype_fusions" ADD CONSTRAINT "user_archetype_fusions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserQuestion" ADD CONSTRAINT "UserQuestion_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "questions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserQuestion" ADD CONSTRAINT "UserQuestion_questionTemplateId_fkey" FOREIGN KEY ("questionTemplateId") REFERENCES "question_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_battle_achievements" ADD CONSTRAINT "user_battle_achievements_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "battle_achievements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_battle_achievements" ADD CONSTRAINT "user_battle_achievements_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_stats" ADD CONSTRAINT "group_stats_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "poll_responses" ADD CONSTRAINT "poll_responses_pollId_fkey" FOREIGN KEY ("pollId") REFERENCES "public_polls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "poll_responses" ADD CONSTRAINT "poll_responses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pack_items" ADD CONSTRAINT "pack_items_packId_fkey" FOREIGN KEY ("packId") REFERENCES "content_packs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_packs" ADD CONSTRAINT "user_packs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_packs" ADD CONSTRAINT "user_packs_packId_fkey" FOREIGN KEY ("packId") REFERENCES "content_packs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fireside_reactions" ADD CONSTRAINT "fireside_reactions_firesideId_fkey" FOREIGN KEY ("firesideId") REFERENCES "firesides"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memory_journals" ADD CONSTRAINT "memory_journals_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comparison_cards" ADD CONSTRAINT "comparison_cards_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_micro_missions" ADD CONSTRAINT "user_micro_missions_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "micro_missions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_micro_missions" ADD CONSTRAINT "user_micro_missions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avatar_moods" ADD CONSTRAINT "avatar_moods_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_mood_logs" ADD CONSTRAINT "user_mood_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_mood_logs" ADD CONSTRAINT "user_mood_logs_reflectionId_fkey" FOREIGN KEY ("reflectionId") REFERENCES "user_reflections"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_mentors" ADD CONSTRAINT "user_mentors_mentorId_fkey" FOREIGN KEY ("mentorId") REFERENCES "mentor_npcs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_mentors" ADD CONSTRAINT "user_mentors_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "storyline_achievements" ADD CONSTRAINT "storyline_achievements_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "season_storylines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LedgerEntry" ADD CONSTRAINT "LedgerEntry_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES "currencies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Badge" ADD CONSTRAINT "Badge_rarityId_fkey" FOREIGN KEY ("rarityId") REFERENCES "rarity_tiers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Badge" ADD CONSTRAINT "Badge_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "seasons"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cosmetic_items" ADD CONSTRAINT "cosmetic_items_rarityId_fkey" FOREIGN KEY ("rarityId") REFERENCES "rarity_tiers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_wildcard_events" ADD CONSTRAINT "user_wildcard_events_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_wildcard_events" ADD CONSTRAINT "user_wildcard_events_wildcardId_fkey" FOREIGN KEY ("wildcardId") REFERENCES "wildcard_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "share_cards" ADD CONSTRAINT "share_cards_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "poster_cards" ADD CONSTRAINT "poster_cards_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_dream_events" ADD CONSTRAINT "user_dream_events_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_dream_events" ADD CONSTRAINT "user_dream_events_dreamId_fkey" FOREIGN KEY ("dreamId") REFERENCES "dream_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generation_records" ADD CONSTRAINT "generation_records_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creator_packs" ADD CONSTRAINT "creator_packs_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_created_packs" ADD CONSTRAINT "user_created_packs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_created_packs" ADD CONSTRAINT "user_created_packs_packId_fkey" FOREIGN KEY ("packId") REFERENCES "creator_packs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_recipes" ADD CONSTRAINT "item_recipes_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_discoveries" ADD CONSTRAINT "item_discoveries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_discoveries" ADD CONSTRAINT "item_discoveries_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_reflections" ADD CONSTRAINT "user_reflections_mirrorEventId_fkey" FOREIGN KEY ("mirrorEventId") REFERENCES "mirror_events"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reflection_conversations" ADD CONSTRAINT "reflection_conversations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reflection_conversations" ADD CONSTRAINT "reflection_conversations_reflectionId_fkey" FOREIGN KEY ("reflectionId") REFERENCES "user_reflections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_stats" ADD CONSTRAINT "user_stats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chronicles" ADD CONSTRAINT "chronicles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chronicles" ADD CONSTRAINT "chronicles_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "seasons"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_regions" ADD CONSTRAINT "user_regions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_regions" ADD CONSTRAINT "user_regions_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "regions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_quests" ADD CONSTRAINT "user_quests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_quests" ADD CONSTRAINT "user_quests_questId_fkey" FOREIGN KEY ("questId") REFERENCES "quests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_lore_entries" ADD CONSTRAINT "user_lore_entries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_userA_fkey" FOREIGN KEY ("userA") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_userB_fkey" FOREIGN KEY ("userB") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "social_duels" ADD CONSTRAINT "social_duels_challengerId_fkey" FOREIGN KEY ("challengerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "social_duels" ADD CONSTRAINT "social_duels_opponentId_fkey" FOREIGN KEY ("opponentId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "social_duels" ADD CONSTRAINT "social_duels_winnerId_fkey" FOREIGN KEY ("winnerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_wallets" ADD CONSTRAINT "user_wallets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prestige_records" ADD CONSTRAINT "prestige_records_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prestige_records" ADD CONSTRAINT "prestige_records_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "meta_seasons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trending_questions" ADD CONSTRAINT "trending_questions_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_skills" ADD CONSTRAINT "user_skills_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_skills" ADD CONSTRAINT "user_skills_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_pets" ADD CONSTRAINT "user_pets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_pets" ADD CONSTRAINT "user_pets_petId_fkey" FOREIGN KEY ("petId") REFERENCES "pets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feed_posts" ADD CONSTRAINT "feed_posts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feed_comments" ADD CONSTRAINT "feed_comments_postId_fkey" FOREIGN KEY ("postId") REFERENCES "feed_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feed_comments" ADD CONSTRAINT "feed_comments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feed_reactions" ADD CONSTRAINT "feed_reactions_postId_fkey" FOREIGN KEY ("postId") REFERENCES "feed_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feed_reactions" ADD CONSTRAINT "feed_reactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compare_posts" ADD CONSTRAINT "compare_posts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compare_reactions" ADD CONSTRAINT "compare_reactions_postId_fkey" FOREIGN KEY ("postId") REFERENCES "compare_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compare_reactions" ADD CONSTRAINT "compare_reactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compare_comments" ADD CONSTRAINT "compare_comments_postId_fkey" FOREIGN KEY ("postId") REFERENCES "compare_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compare_comments" ADD CONSTRAINT "compare_comments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
