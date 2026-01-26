import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { Prisma as PrismaRuntime } from '@prisma/client/runtime/library';

// Re-export Prisma namespace for runtime usage
const Prisma = PrismaRuntime;
import Decimal from 'decimal.js';

/////////////////////////////////////////
// HELPER FUNCTIONS
/////////////////////////////////////////

// JSON
//------------------------------------------------------

export type NullableJsonInput = Prisma.JsonValue | null | 'JsonNull' | 'DbNull' | Prisma.NullTypes.DbNull | Prisma.NullTypes.JsonNull;

export const transformJsonNull = (v?: NullableJsonInput) => {
  if (!v || v === 'DbNull') return Prisma.NullTypes.DbNull;
  if (v === 'JsonNull') return Prisma.NullTypes.JsonNull;
  return v;
};

export const JsonValueSchema: z.ZodType<Prisma.JsonValue> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.literal(null),
    z.record(z.string(), z.lazy(() => JsonValueSchema.optional())),
    z.array(z.lazy(() => JsonValueSchema)),
  ])
);

export type JsonValueType = z.infer<typeof JsonValueSchema>;

export const NullableJsonValue = z
  .union([JsonValueSchema, z.literal('DbNull'), z.literal('JsonNull')])
  .nullable()
  .transform((v) => transformJsonNull(v));

export type NullableJsonValueType = z.infer<typeof NullableJsonValue>;

export const InputJsonValueSchema: z.ZodType<Prisma.InputJsonValue> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.object({ toJSON: z.any() }),
    z.record(z.string(), z.lazy(() => z.union([InputJsonValueSchema, z.literal(null)]))),
    z.array(z.lazy(() => z.union([InputJsonValueSchema, z.literal(null)]))),
  ])
);

export type InputJsonValueType = z.infer<typeof InputJsonValueSchema>;

// DECIMAL
//------------------------------------------------------

export const DecimalJsLikeSchema: z.ZodType<Prisma.DecimalJsLike> = z.object({
  d: z.array(z.number()),
  e: z.number(),
  s: z.number(),
  toFixed: z.any(),
})

export const DECIMAL_STRING_REGEX = /^(?:-?Infinity|NaN|-?(?:0[bB][01]+(?:\.[01]+)?(?:[pP][-+]?\d+)?|0[oO][0-7]+(?:\.[0-7]+)?(?:[pP][-+]?\d+)?|0[xX][\da-fA-F]+(?:\.[\da-fA-F]+)?(?:[pP][-+]?\d+)?|(?:\d+|\d*\.\d+)(?:[eE][-+]?\d+)?))$/;

export const isValidDecimalInput =
  (v?: null | string | number | Prisma.DecimalJsLike): v is string | number | Prisma.DecimalJsLike => {
    if (v === undefined || v === null) return false;
    return (
      (typeof v === 'object' && 'd' in v && 'e' in v && 's' in v && 'toFixed' in v) ||
      (typeof v === 'string' && DECIMAL_STRING_REGEX.test(v)) ||
      typeof v === 'number'
    )
  };

/////////////////////////////////////////
// ENUMS
/////////////////////////////////////////

export const TransactionIsolationLevelSchema = z.enum(['ReadUncommitted','ReadCommitted','RepeatableRead','Serializable']);

export const UserScalarFieldEnumSchema = z.enum(['id','email','passwordHash','name','phone','language','country','dateOfBirth','avatarUrl','username','bio','visibility','banned','motto','theme','funds','diamonds','xp','level','lastLoginAt','lastActiveAt','createdAt','image','streakCount','lastAnsweredAt','score','questionsAnswered','questionsCreated','emailVerified','emailVerifiedAt','newsletterOptIn','role','archetype','archetypeKey','stats','lastArchetypeReroll','settings','lang','localeCode','ageGroup','region','interests','tone','onboardingCompleted','combatKills','combatBattles','combatHighestStreak','statCreativity','statHealth','statKnowledge','statSleep','statSocial','allowPublicCompare','canBeAdded','badgeType','karmaScore','prestigeScore','showBadges','coins','seasonalXP','seasonLevel','seasonXP','prestigeCount','legacyPerk','prestigeTitle','prestigeBadgeId','prestigeColorTheme','currentGeneration','avatarTheme','moodFeed','equippedTitle','equippedIcon','equippedBackground']);

export const AffinityScalarFieldEnumSchema = z.enum(['id','sourceId','targetId','type','strength','mutual','visibility','createdAt','updatedAt']);

export const OrgScalarFieldEnumSchema = z.enum(['id','name','createdAt']);

export const MembershipScalarFieldEnumSchema = z.enum(['id','userId','orgId','role']);

export const TaskScalarFieldEnumSchema = z.enum(['id','orgId','createdById','title','description','status','priority','source','assigneeType','assigneeId','dueAt','createdAt','updatedAt']);

export const AttachmentScalarFieldEnumSchema = z.enum(['id','taskId','name','url','mimeType','size']);

export const TaskMessageScalarFieldEnumSchema = z.enum(['id','taskId','authorType','text','createdAt']);

export const WorkflowScalarFieldEnumSchema = z.enum(['id','orgId','name','trigger','action','keywords','isActive','createdAt','updatedAt']);

export const RunScalarFieldEnumSchema = z.enum(['id','taskId','workflowId','status','logs','createdAt','updatedAt']);

export const IntegrationScalarFieldEnumSchema = z.enum(['id','orgId','type','config','isActive','createdAt','updatedAt']);

export const QuestionScalarFieldEnumSchema = z.enum(['text','normalizedText','difficulty','source','approved','reviewNotes','createdByUserId','createdAt','updatedAt','id','categoryId','subCategoryId','subSubCategoryId','relatedToId','metadata','currentVersionId','ssscId','lang','region','isLocalized','localeCode','isFlagged','flagReason','visibility','reactionsLike','reactionsLaugh','reactionsThink']);

export const QuestionVersionScalarFieldEnumSchema = z.enum(['id','questionId','text','displayText','type','options','metadata','createdAt','version']);

export const QuestionTagScalarFieldEnumSchema = z.enum(['id','name','type','description']);

export const QuestionVersionTagScalarFieldEnumSchema = z.enum(['id','questionVersionId','tagId']);

export const QuestionGenerationScalarFieldEnumSchema = z.enum(['id','ssscId','targetCount','status','prompt','insertedCount','rawResponse','finishedAt','createdAt','updatedAt']);

export const FlowQuestionScalarFieldEnumSchema = z.enum(['id','categoryId','locale','text','type','isActive','createdAt','updatedAt']);

export const FlowQuestionOptionScalarFieldEnumSchema = z.enum(['id','questionId','label','value','order']);

export const UserResponseScalarFieldEnumSchema = z.enum(['id','userId','questionId','optionIds','numericVal','textVal','skipped','createdAt','updatedAt']);

export const SynchTestScalarFieldEnumSchema = z.enum(['id','key','title','description','questions','resultTextTemplates','rewardXP','rewardKarma','isActive','createdAt']);

export const UserSynchTestScalarFieldEnumSchema = z.enum(['id','testId','userA','userB','answersA','answersB','compatibilityScore','shared','status','createdAt']);

export const FactionScalarFieldEnumSchema = z.enum(['id','key','name','motto','description','colorPrimary','colorSecondary','buffType','buffValue','regionScope','isActive','createdAt']);

export const FactionInfluenceScalarFieldEnumSchema = z.enum(['id','factionId','region','influenceScore','lastUpdated','dailyDelta','contributionsCount']);

export const UserFactionScalarFieldEnumSchema = z.enum(['userId','factionId','joinedAt','contributedXP','isLeader']);

export const CommunityCreationScalarFieldEnumSchema = z.enum(['id','userId','title','type','content','status','likes','rewardXP','rewardKarma','createdAt']);

export const CommunityCreationLikeScalarFieldEnumSchema = z.enum(['id','userId','creationId','createdAt']);

export const PostcardScalarFieldEnumSchema = z.enum(['id','senderId','receiverId','message','status','deliveryAt','createdAt']);

export const RarityTierScalarFieldEnumSchema = z.enum(['id','key','name','colorPrimary','colorGlow','frameStyle','rankOrder','description','isActive','createdAt']);

export const DailyForkScalarFieldEnumSchema = z.enum(['id','key','title','description','optionA','optionB','effectA','effectB','rarity','createdAt','isActive']);

export const UserDailyForkScalarFieldEnumSchema = z.enum(['id','userId','forkId','choice','resultSummary','createdAt']);

export const DuetRunScalarFieldEnumSchema = z.enum(['id','missionKey','title','description','type','durationSec','rewardXP','rewardKarma','createdAt','isActive']);

export const UserDuetRunScalarFieldEnumSchema = z.enum(['id','runId','userA','userB','status','startedAt','endedAt','progressA','progressB']);

export const RitualScalarFieldEnumSchema = z.enum(['id','key','title','description','rewardXP','rewardKarma','timeOfDay','createdAt','isActive']);

export const UserRitualScalarFieldEnumSchema = z.enum(['id','userId','ritualId','lastCompleted','streakCount','totalCompleted']);

export const MicroClanScalarFieldEnumSchema = z.enum(['id','name','description','leaderId','memberIds','buffType','buffValue','seasonId','createdAt','isActive']);

export const MicroClanStatsScalarFieldEnumSchema = z.enum(['id','clanId','xpTotal','activityScore','rank','updatedAt']);

export const LootMomentScalarFieldEnumSchema = z.enum(['id','key','trigger','rewardType','rewardValue','rarity','flavorText','createdAt','isActive']);

export const UserLootMomentScalarFieldEnumSchema = z.enum(['id','userId','momentId','rewardData','triggeredAt','redeemedAt']);

export const MessageScalarFieldEnumSchema = z.enum(['id','createdAt','content','isRead','receiverId','senderId','flagged','hiddenBySender','hiddenByReceiver']);

export const CommentScalarFieldEnumSchema = z.enum(['id','userId','targetType','targetId','content','flagged','isFlagged','flagReason','visibility','createdAt']);

export const ActionLogScalarFieldEnumSchema = z.enum(['id','userId','action','metadata','createdAt']);

export const ModerationLogScalarFieldEnumSchema = z.enum(['id','moderatorId','action','targetType','targetId','reason','createdAt']);

export const CulturalFilterScalarFieldEnumSchema = z.enum(['id','region','tag','category','description','severity','createdBy','createdAt','updatedAt']);

export const ModerationReportScalarFieldEnumSchema = z.enum(['id','contentId','type','reasonTag','region','reporterId','isAnonymous','createdAt']);

export const AIRegionalContextScalarFieldEnumSchema = z.enum(['id','region','localeCode','toneProfile','culturalNotes','humorStyle','tabooTopics','updatedAt']);

export const ReflectionScalarFieldEnumSchema = z.enum(['id','userId','text','createdAt']);

export const AchievementScalarFieldEnumSchema = z.enum(['id','code','key','category','tier','title','name','description','icon','emoji','xpReward','rewardXp','rewardGold','updatedAt','createdAt']);

export const UserAchievementScalarFieldEnumSchema = z.enum(['id','userId','achievementId','tier','earnedAt','unlockedAt','animationShownAt']);

export const EventLogScalarFieldEnumSchema = z.enum(['id','userId','type','title','description','metadata','visibility','reactionsCount','createdAt','eventType','eventData']);

export const WaitlistScalarFieldEnumSchema = z.enum(['id','email','refCode','source','status','createdAt','updatedAt']);

export const MarketingCampaignScalarFieldEnumSchema = z.enum(['id','title','content','link','status','sentAt','deliveredCount','openedCount','clickedCount','createdAt','updatedAt']);

export const ActivityScalarFieldEnumSchema = z.enum(['id','userId','type','title','description','metadata','createdAt']);

export const NotificationScalarFieldEnumSchema = z.enum(['id','userId','senderId','type','title','body','isRead','createdAt']);

export const PresenceScalarFieldEnumSchema = z.enum(['userId','status','lastActive','updatedAt']);

export const ItemScalarFieldEnumSchema = z.enum(['id','name','type','rarity','description','power','defense','effect','bonus','icon','key','emoji','createdAt','availableUntil','cosmeticSubtype','cosmeticType','diamondPrice','eventCurrency','eventPrice','goldPrice','isFeatured','isLimited','isShopItem','visualConfig','rarityId']);

export const InventoryItemScalarFieldEnumSchema = z.enum(['id','userId','itemId','itemKey','rarity','power','effectKey','quantity','equipped','createdAt','updatedAt']);

export const ItemEffectScalarFieldEnumSchema = z.enum(['key','name','description','type','magnitude','trigger','createdAt','updatedAt']);

export const FriendScalarFieldEnumSchema = z.enum(['id','userId','friendId','status','createdAt','acceptedAt']);

export const ReactionScalarFieldEnumSchema = z.enum(['id','userId','targetType','targetId','emoji','createdAt']);

export const DuelScalarFieldEnumSchema = z.enum(['id','initiatorId','receiverId','categoryId','status','initiatorScore','receiverScore','winnerId','createdAt','expiresAt','completedAt']);

export const ChallengeScalarFieldEnumSchema = z.enum(['id','initiatorId','receiverId','type','categoryId','status','message','createdAt','respondedAt','completedAt','prompt','response','rewardKarma','rewardXp']);

export const GlobalEventScalarFieldEnumSchema = z.enum(['id','title','description','emoji','type','bonusType','bonusValue','targetScope','startAt','endAt','active','createdBy','createdAt','updatedAt']);

export const WeeklyChallengeScalarFieldEnumSchema = z.enum(['id','weekNumber','year','type','prompt','dareVariant','truthVariant','generationSource','trendingTopics','rewardXp','rewardKarma','participantCount','status','publishedAt','createdAt']);

export const WeeklyChallengeParticipationScalarFieldEnumSchema = z.enum(['id','userId','challengeId','response','submitted','submittedAt','rewardXp','rewardKarma']);

export const UserInsightScalarFieldEnumSchema = z.enum(['id','userId','templateId','title','description','emoji','color','metrics','generatedAt','expiresAt']);

export const DailyQuestScalarFieldEnumSchema = z.enum(['id','date','type','title','objective','targetCount','rewardXp','rewardGold','rewardItem','dropChance','expiresAt','createdAt']);

export const QuestCompletionScalarFieldEnumSchema = z.enum(['id','userId','questId','progress','completed','itemDropped','completedAt','createdAt']);

export const MarketListingScalarFieldEnumSchema = z.enum(['id','sellerId','itemId','price','currencyKey','status','createdAt','updatedAt','buyerId']);

export const GlobalPoolScalarFieldEnumSchema = z.enum(['id','poolType','goldAmount','diamondAmount','updatedAt']);

export const CraftingRecipeScalarFieldEnumSchema = z.enum(['id','name','description','inputItemIds','outputItemId','goldCost','requiresToken','rarityBoost','successRate','craftingTime','unlockLevel','createdAt']);

export const CraftingLogScalarFieldEnumSchema = z.enum(['id','userId','recipeId','inputItems','outputItem','success','goldSpent','rarityAchieved','statVariance','craftedAt']);

export const DailyQuizScalarFieldEnumSchema = z.enum(['id','date','questionIds','rewardXp','rewardHearts','completions','createdAt']);

export const DailyQuizCompletionScalarFieldEnumSchema = z.enum(['id','userId','quizId','score','completedAt']);

export const UserEnergyScalarFieldEnumSchema = z.enum(['id','userId','hearts','maxHearts','lastRegenAt','updatedAt']);

export const GlobalFeedItemScalarFieldEnumSchema = z.enum(['id','type','title','description','userId','metadata','reactionsCount','createdAt']);

export const ProfileThemeScalarFieldEnumSchema = z.enum(['id','userId','themeId','isActive','unlockedAt','rarityId']);

export const WorldChronicleScalarFieldEnumSchema = z.enum(['id','seasonNumber','seasonName','startDate','endDate','title','summary','fullChronicle','totalPlayers','totalXpEarned','totalChallenges','totalMessages','topFaction','topPlayer','topGroup','worldStateStart','worldStateEnd','generatedBy','generatedAt','isPublished','publishedAt','createdAt','updatedAt']);

export const SeasonSummaryScalarFieldEnumSchema = z.enum(['id','chronicleId','category','title','content','highlights','stats','order','createdAt']);

export const PlayerQuoteScalarFieldEnumSchema = z.enum(['id','chronicleId','userId','quote','context','sourceType','sourceId','isFeatured','createdAt']);

export const NarrativeQuestScalarFieldEnumSchema = z.enum(['id','userId','title','intro','context','generatedBy','aiModel','prompt','status','completedAt','createdAt','updatedAt']);

export const NarrativeChoiceScalarFieldEnumSchema = z.enum(['id','questId','step','prompt','option1','option2','option3','option1Effect','option2Effect','option3Effect','selectedOption','selectedAt','createdAt']);

export const NarrativeOutcomeScalarFieldEnumSchema = z.enum(['id','questId','conclusion','karmaChange','prestigeChange','xpReward','goldReward','archetypeShift','itemsGranted','createdAt']);

export const LoreEraScalarFieldEnumSchema = z.enum(['id','name','displayName','description','order','startYear','endYear','isActive','isCurrent','icon','color','createdAt','updatedAt']);

export const LoreEntryScalarFieldEnumSchema = z.enum(['id','title','slug','summary','content','eraId','author','publishedAt','category','importance','relatedFactions','relatedEvents','relatedCharacters','isPublished','isSecret','viewCount','createdAt','updatedAt']);

export const LoreTagScalarFieldEnumSchema = z.enum(['id','entryId','tag','createdAt']);

export const UserTimeZoneScalarFieldEnumSchema = z.enum(['id','userId','timezone','utcOffset','detectedFrom','localMidnight','createdAt','updatedAt']);

export const RegionScheduleScalarFieldEnumSchema = z.enum(['id','region','timezone','dailyResetOffset','quizResetOffset','energyResetOffset','nextDailyReset','nextQuizReset','nextEnergyReset','updatedAt']);

export const RegionalEventScalarFieldEnumSchema = z.enum(['id','name','description','region','country','startDate','endDate','timezone','eventType','theme','rewardXp','rewardGold','rewardItems','isActive','isRecurring','recurrence','createdAt','updatedAt']);

export const RegionConfigScalarFieldEnumSchema = z.enum(['id','region','timezone','locale','hasRegionalLeaderboard','preferredThemes','displayName','flagEmoji','updatedAt']);

export const CulturalItemScalarFieldEnumSchema = z.enum(['id','itemId','region','culture','eventType','eventName','isSeasonalOnly','availableMonths','createdAt']);

export const LanguagePreferenceScalarFieldEnumSchema = z.enum(['id','userId','locale','fallbackLocale','createdAt','updatedAt']);

export const TranslationKeyScalarFieldEnumSchema = z.enum(['id','key','namespace','en','cs','de','fr','es','jp','context','isMissing','createdAt','updatedAt']);

export const EconomyStatScalarFieldEnumSchema = z.enum(['id','date','totalGold','totalDiamonds','totalXp','goldCreated','goldDestroyed','diamondsCreated','diamondsDestroyed','marketTransactions','marketVolume','craftingVolume','inflationRate','createdAt']);

export const TreasuryScalarFieldEnumSchema = z.enum(['id','gold','diamonds','taxCollected','donationsReceived','eventsSpent','projectsSpent','lifetimeCollected','lifetimeSpent','updatedAt']);

export const DynamicPriceScalarFieldEnumSchema = z.enum(['id','itemId','basePrice','currentPrice','demand','supply','purchaseVolume','craftingVolume','lastAdjustedAt','priceHistory','updatedAt']);

export const TaxTransactionScalarFieldEnumSchema = z.enum(['id','sourceType','sourceId','amount','taxAmount','taxRate','currency','userId','createdAt']);

export const CreatorWalletScalarFieldEnumSchema = z.enum(['id','userId','pendingBalance','paidBalance','totalEarned','stripeAccountId','lastPayoutAt','nextPayoutAt','isActive','createdAt','updatedAt']);

export const CreatorTransactionScalarFieldEnumSchema = z.enum(['id','walletId','type','amount','sourceType','sourceId','payoutPoolId','stripeTransferId','description','metadata','createdAt']);

export const PayoutPoolScalarFieldEnumSchema = z.enum(['id','weekStart','weekEnd','totalPool','fromSubscriptions','fromCosmetics','fromDonations','totalDistributed','totalCreators','status','calculatedAt','distributedAt','createdAt']);

export const EngagementMetricScalarFieldEnumSchema = z.enum(['id','contentType','contentId','creatorId','userId','type','value','weekStart','fingerprint','createdAt']);

export const SubscriptionPlanScalarFieldEnumSchema = z.enum(['id','name','displayName','description','price','currency','interval','stripeProductId','stripePriceId','xpMultiplier','features','isActive','createdAt','updatedAt']);

export const UserSubscriptionScalarFieldEnumSchema = z.enum(['id','userId','planId','stripeSubscriptionId','stripeCustomerId','status','startedAt','renewsAt','cancelledAt','expiresAt','trialEndsAt','createdAt','updatedAt']);

export const PaymentLogScalarFieldEnumSchema = z.enum(['id','subscriptionId','userId','amount','currency','status','stripePaymentIntentId','stripeChargeId','description','metadata','failureReason','refundedAt','createdAt']);

export const ReportScalarFieldEnumSchema = z.enum(['id','reporterId','reportedUserId','contentType','contentId','reason','description','status','priority','resolvedBy','resolvedAt','resolution','createdAt']);

export const ReputationScoreScalarFieldEnumSchema = z.enum(['id','userId','score','reportsReceived','reportsDismissed','positiveReactions','negativeReactions','challengesCompleted','helpfulVotes','trustLevel','isRestricted','canMessage','canChallenge','canPost','updatedAt']);

export const ModerationActionScalarFieldEnumSchema = z.enum(['id','userId','moderatorId','actionType','reason','duration','reportId','isActive','expiresAt','revokedAt','revokedBy','isPublic','createdAt']);

export const BlockedUserScalarFieldEnumSchema = z.enum(['id','userId','blockedUserId','reason','createdAt']);

export const ContentReviewScalarFieldEnumSchema = z.enum(['id','contentType','contentId','content','flagged','confidence','categories','reviewed','reviewedBy','reviewedAt','approved','createdAt']);

export const UserStreakScalarFieldEnumSchema = z.enum(['id','userId','currentStreak','longestStreak','lastLoginAt','lastQuizAt','lastDuelAt','lastChallengeAt','loginStreak','quizStreak','duelStreak','totalDaysActive','updatedAt']);

export const RewardCalendarScalarFieldEnumSchema = z.enum(['id','userId','calendarType','day','rewardType','rewardAmount','rewardItemId','claimed','claimedAt','cycleStart','createdAt']);

export const ReturnBonusScalarFieldEnumSchema = z.enum(['id','userId','inactiveDays','xpBonus','goldBonus','diamondBonus','granted','grantedAt','expiresAt','createdAt']);

export const FeedbackMoodScalarFieldEnumSchema = z.enum(['id','userId','emoji','rating','context','sessionId','comment','sentiment','analyzed','createdAt']);

export const DailySummaryScalarFieldEnumSchema = z.enum(['id','userId','date','questionsAnswered','challengesSent','challengesReceived','xpEarned','sessionCount','totalSessionTime','averageMood','viewed','viewedAt','createdAt']);

export const BetaInviteScalarFieldEnumSchema = z.enum(['id','code','creatorId','maxUses','usedCount','rewardsGranted','isActive','expiresAt','source','utmSource','utmMedium','utmCampaign','createdAt']);

export const ReferralScalarFieldEnumSchema = z.enum(['id','referrerId','referredId','inviteId','xpRewarded','diamondsRewarded','rewardsGranted','status','createdAt','rewardedAt']);

export const BetaUserScalarFieldEnumSchema = z.enum(['id','userId','inviteCode','wave','firstLoginAt','lastActiveAt','onboardingComplete','referralsSent','referralsAccepted','joinedAt']);

export const TelemetryEventScalarFieldEnumSchema = z.enum(['id','type','page','action','duration','metadata','userAgent','platform','sessionId','userId','anonymousId','deviceType','region','createdAt']);

export const TelemetryAggregateScalarFieldEnumSchema = z.enum(['id','date','type','count','avgDuration','p50Duration','p95Duration','p99Duration','errorRate','context','metadata','createdAt','updatedAt']);

export const UserPreferencesScalarFieldEnumSchema = z.enum(['id','userId','soundEnabled','soundVolume','levelUpSound','purchaseSound','challengeSound','notificationSound','ambientMusicEnabled','ambientTheme','animationsEnabled','reducedMotion','particleEffects','backgroundAnimation','transitionSpeed','glowEffects','shimmerEffects','confettiEnabled','createdAt','updatedAt']);

export const SoundAssetScalarFieldEnumSchema = z.enum(['id','assetId','name','description','filePath','fileSize','duration','category','eventType','defaultVolume','loop','isActive','createdAt']);

export const OnboardingProgressScalarFieldEnumSchema = z.enum(['id','userId','sawWelcomeOverlay','sawDashboard','completedAnswer','completedCompare','completedChallenge','completedTutorial','tutorialStarted','tutorialStep','tutorialCompleted','tutorialReward','tooltipsSeen','showTooltips','skipOnboarding','startedAt','completedAt','lastStepAt']);

export const FeedbackSubmissionScalarFieldEnumSchema = z.enum(['id','userId','type','category','title','description','page','userAgent','screenshot','priority','status','adminNotes','respondedAt','respondedBy','submittedAt']);

export const ErrorLogScalarFieldEnumSchema = z.enum(['id','errorType','message','stack','page','userAgent','userId','sessionId','buildId','environment','severity','frequency','firstSeen','lastSeen','status','assignedTo','metadata','resolved','resolvedAt','resolvedBy','createdAt','updatedAt']);

export const TooltipDefinitionScalarFieldEnumSchema = z.enum(['id','tooltipId','title','description','icon','page','elementId','position','showOnce','priority','delayMs','minLevel','maxLevel','requiresFlag','isActive','createdAt']);

export const WorldCycleScalarFieldEnumSchema = z.enum(['id','cycleNumber','cycleName','startDate','endDate','duration','finalHope','finalChaos','finalCreativity','finalKnowledge','finalHarmony','dominantForce','totalPlayers','totalXp','threatsDefeated','eventsCompleted','topPlayerId','topFactionId','topClanId','unlockedFactions','unlockedResources','unlockedEnvironments','status']);

export const LegacyRecordScalarFieldEnumSchema = z.enum(['id','cycleId','userId','finalLevel','finalXp','finalGold','finalDiamonds','finalPrestige','finalKarma','xpRank','karmaRank','prestigeRank','achievements','titles','badges','ascensionChoice','playTime','majorEvents','archivedAt']);

export const UserLegacyBonusScalarFieldEnumSchema = z.enum(['id','userId','bonusType','prestigeCarry','legacyTitle','xpBoostPercent','mutation','artifactId','artifactType','earnedInCycle','isActive','createdAt','expiresAt']);

export const AbyssProgressScalarFieldEnumSchema = z.enum(['id','userId','currentLayer','maxLayer','totalClears','layerMultiplier','abyssTokens','abyssArtifacts','isActive','lastClear']);

export const WorldThreatScalarFieldEnumSchema = z.enum(['id','threatId','name','title','description','loreText','avatar','type','difficulty','maxHealth','currentHealth','defense','threatLevel','spawnedBy','triggerMetrics','region','controlledBy','status','totalDamage','attackCount','participantCount','xpReward','goldReward','specialReward','spawnedAt','expiresAt','defeatedAt','isPostedToFeed']);

export const ThreatBattleScalarFieldEnumSchema = z.enum(['id','threatId','userId','factionId','attackType','damageDealt','isCritical','attackerLevel','attackerPrestige','randomFactor','xpGained','goldGained','rewardClaimed','attackedAt']);

export const FactionTerritoryScalarFieldEnumSchema = z.enum(['id','territoryId','name','description','region','mapPosition','controlledBy','controlStrength','xpBonus','goldBonus','resourceType','isContested','contestStarted','lastCaptured','captureCount']);

export const TerritoryContestScalarFieldEnumSchema = z.enum(['id','territoryId','attackerFaction','defenderFaction','attackerScore','defenderScore','startTime','endTime','status','winnerId','completedAt']);

export const FactionLegacyScalarFieldEnumSchema = z.enum(['id','factionId','name','title','description','color','secondaryColor','emblem','pattern','glowEffect','moralAxis','orderAxis','philosophy','xpBonus','goldBonus','karmaMultiplier','specialAbility','memberCount','totalXp','avgKarma','avgPrestige','hasCouncil','councilSize','votingPower','lore','motto','isActive','createdAt','updatedAt']);

export const FactionMemberScalarFieldEnumSchema = z.enum(['id','factionId','userId','role','rank','title','xpContributed','karmaContributed','reputation','loyaltyScore','joinedAt','lastActive','canSwitchAt','switchCount']);

export const FactionChangeLogScalarFieldEnumSchema = z.enum(['id','userId','fromFactionId','toFactionId','changeType','reason','penaltyType','penaltyAmount','questCompleted','changedAt']);

export const FactionVoteScalarFieldEnumSchema = z.enum(['id','factionId','userId','voteType','proposalId','vote','votingPower','comment','votedAt']);

export const FactionProposalScalarFieldEnumSchema = z.enum(['id','proposalId','factionId','title','description','proposalType','status','votesFor','votesAgainst','votesAbstain','startTime','endTime','result','executedAt','createdBy','createdAt']);

export const MentorProfileScalarFieldEnumSchema = z.enum(['id','userId','mentorName','mentorAvatar','mentorTone','preferredTopics','communicationStyle','reminderFrequency','lastAnalyzedAt','currentFocus','growthAreas','strengths','isEnabled','journalingEnabled','reflectionPrompts','createdAt','updatedAt']);

export const MentorLogScalarFieldEnumSchema = z.enum(['id','userId','logType','title','message','category','timeframe','metrics','suggestions','flowLinks','isRead','readAt','userRating','createdAt']);

export const InsightPromptScalarFieldEnumSchema = z.enum(['id','promptId','category','question','subtext','icon','archetypes','minLevel','karmaRange','expectedWordCount','tags','isActive','createdAt']);

export const ReflectionEntryScalarFieldEnumSchema = z.enum(['id','userId','promptId','title','content','mood','aiInsights','themes','sentiment','isPrivate','createdAt','localeCode']);

export const WorldStateScalarFieldEnumSchema = z.enum(['id','timestamp','hope','chaos','creativity','knowledge','harmony','overallAlignment','dominantForce','totalPlayers','activeEvents','dayNumber','hopeChange','chaosChange','creativityChange','knowledgeChange','harmonyChange']);

export const WorldVariableScalarFieldEnumSchema = z.enum(['id','stateId','variableName','value','category']);

export const WorldEventScalarFieldEnumSchema = z.enum(['id','eventId','name','description','loreText','triggerType','triggerConditions','variableImpacts','duration','status','triggeredAt','startsAt','endsAt','completedAt','participantCount','requiredActions','currentProgress','rewards','isPostedToFeed']);

export const WorldContributionScalarFieldEnumSchema = z.enum(['id','userId','date','hopePoints','chaosPoints','creativityPoints','knowledgePoints','harmonyPoints','fromAnswers','fromChallenges','fromFlows','fromSocialActions']);

export const NpcProfileScalarFieldEnumSchema = z.enum(['id','npcId','name','title','avatar','archetypeAffinity','tone','bio','portraitUrl','personality','alignment','karmaAffinity','archetypeMatch','greetings','farewells','quirks','canGiveQuests','canGiveRewards','canGiveAdvice','isActive','appearanceRate','minLevel','backstory','voice','createdAt','updatedAt']);

export const NpcInteractionScalarFieldEnumSchema = z.enum(['id','npcId','userId','interactionType','userArchetype','userKarma','userPrestige','npcMessage','userResponse','sentiment','questOffered','rewardGiven','adviceGiven','duration','createdAt']);

export const NpcMemoryScalarFieldEnumSchema = z.enum(['id','npcId','userId','memoryType','key','value','importance','lastAccessed','accessCount','createdAt','expiresAt']);

export const NpcAffinityScalarFieldEnumSchema = z.enum(['id','userId','npcId','lastInteraction','affinityScore','note','createdAt','updatedAt']);

export const NPCDialogueScalarFieldEnumSchema = z.enum(['id','npcId','triggerType','text','moodTag','rarity','createdAt']);

export const NpcDialogueTreeScalarFieldEnumSchema = z.enum(['id','npcId','treeId','name','description','triggerType','conditions','nodes','category','priority','isActive','createdAt']);

export const RewardOfferScalarFieldEnumSchema = z.enum(['id','offerId','name','description','type','partnerId','partnerName','partnerLogo','minPrestige','minLevel','requiredBadges','requiredTitles','value','rewardCode','qrCodeUrl','externalUrl','totalStock','remainingStock','maxPerUser','isActive','startsAt','expiresAt','category','imageUrl','termsUrl','nftEnabled','nftContract','nftMetadata','createdAt','updatedAt']);

export const RewardRedemptionScalarFieldEnumSchema = z.enum(['id','offerId','userId','redemptionCode','qrCode','status','verificationCode','verifiedAt','verifiedBy','redeemedAt','expiresAt','nftMinted','nftTokenId','nftTxHash','metadata','notes','createdAt']);

export const RewardProofScalarFieldEnumSchema = z.enum(['id','redemptionId','proofType','proofData','uploadedAt','verifiedAt','isVerified']);

export const PartnerAppScalarFieldEnumSchema = z.enum(['id','name','description','website','contactEmail','clientId','clientSecret','status','tier','rateLimit','dailyLimit','webhookUrl','webhookSecret','webhookEvents','canEmbed','canAccessData','canCreateContent','logoUrl','industry','createdAt','updatedAt','lastUsedAt']);

export const PartnerApiKeyScalarFieldEnumSchema = z.enum(['id','partnerId','keyHash','keyPreview','name','scopes','isActive','expiresAt','lastUsedAt','usageCount','createdAt','revokedAt']);

export const PartnerStatsScalarFieldEnumSchema = z.enum(['id','partnerId','date','totalRequests','successRequests','failedRequests','rateLimitHits','embedViews','embedClicks','embedResponses','questionsServed','answersReceived','uniqueUsers','avgResponseTime','errorRate']);

export const PartnerWebhookScalarFieldEnumSchema = z.enum(['id','partnerId','eventType','payload','signature','status','attempts','maxAttempts','deliveredAt','failedAt','error','nextRetryAt','createdAt']);

export const PushSubscriptionScalarFieldEnumSchema = z.enum(['id','userId','endpoint','keys','userAgent','deviceType','isEnabled','createdAt','lastUsed']);

export const OfflineActionScalarFieldEnumSchema = z.enum(['id','userId','actionType','payload','status','retryCount','createdAt','syncedAt','error']);

export const PWAMetricsScalarFieldEnumSchema = z.enum(['id','date','installCount','uninstallCount','activeInstalls','mobileUsers','tabletUsers','desktopUsers','pushSent','pushDelivered','pushClicked','offlineActions','syncedActions','failedActions','avgLoadTime','cacheHitRate']);

export const MiniEventScalarFieldEnumSchema = z.enum(['id','eventId','name','description','icon','eventType','goalType','targetCount','currentProgress','duration','startTime','endTime','rewards','status','participantCount','isSuccessful','completedAt','createdAt']);

export const MiniEventProgressScalarFieldEnumSchema = z.enum(['id','eventId','userId','contribution','lastUpdate','rewardsClaimed','claimedAt']);

export const MiniEventRewardScalarFieldEnumSchema = z.enum(['id','eventId','userId','rewardType','rewardId','amount','description','awardedAt']);

export const CreatorProfileScalarFieldEnumSchema = z.enum(['id','userId','displayName','bio','avatar','bannerImage','isVerified','badge','tier','totalFlows','totalEngagement','totalEarnings','followerCount','revenueShare','goldPerPlay','isActive','allowComments','createdAt','updatedAt']);

export const CreatorFlowScalarFieldEnumSchema = z.enum(['id','creatorId','title','description','coverImage','difficulty','category','tags','questions','questionCount','status','approvedBy','approvedAt','publishedAt','rejectionReason','playCount','completionCount','avgRating','ratingCount','xpReward','goldReward','isFeatured','isPremium','createdAt','updatedAt']);

export const CreatorFollowerScalarFieldEnumSchema = z.enum(['id','creatorId','userId','followedAt']);

export const CreatorRewardScalarFieldEnumSchema = z.enum(['id','creatorId','flowId','type','amount','source','description','earnedAt']);

export const ClanScalarFieldEnumSchema = z.enum(['id','name','tag','description','emblem','color','leaderId','totalXp','weeklyXp','clanGold','level','memberCount','maxMembers','isPublic','requireApproval','minLevel','lastXpReset','totalChestsEarned','createdAt','updatedAt']);

export const ClanMemberScalarFieldEnumSchema = z.enum(['id','clanId','userId','role','xpContributed','weeklyXpContributed','goldContributed','rank','title','joinedAt','lastActive']);

export const ClanUpgradeScalarFieldEnumSchema = z.enum(['id','clanId','upgradeType','name','level','maxLevel','boostAmount','duration','purchasedAt','expiresAt']);

export const ClanActivityScalarFieldEnumSchema = z.enum(['id','clanId','activityType','userId','message','metadata','createdAt']);

export const SystemMetricScalarFieldEnumSchema = z.enum(['id','metricType','name','value','unit','endpoint','timestamp']);

export const HealthLogScalarFieldEnumSchema = z.enum(['id','checkType','status','message','responseTime','metadata','checkedAt']);

export const AutoHealLogScalarFieldEnumSchema = z.enum(['id','healType','description','itemsAffected','success','error','executedAt']);

export const CronJobLogScalarFieldEnumSchema = z.enum(['id','jobKey','status','startedAt','finishedAt','durationMs','errorMessage']);

export const ErrorAlertScalarFieldEnumSchema = z.enum(['id','severity','source','message','stackTrace','metadata','notifiedAt','resolvedAt','isResolved','createdAt']);

export const JobQueueScalarFieldEnumSchema = z.enum(['id','queueName','displayName','description','priority','concurrency','maxRetries','backoffStrategy','backoffDelay','isEnabled','createdAt','updatedAt']);

export const JobQueueMetricsScalarFieldEnumSchema = z.enum(['id','queueName','date','processed','completed','failed','retried','stalled','avgProcessTime','maxProcessTime','minProcessTime','processedPerSec','failureRate']);

export const JobFailureScalarFieldEnumSchema = z.enum(['id','queueName','jobId','jobName','payload','error','stackTrace','attempts','maxRetries','willRetry','nextRetryAt','failedAt','resolvedAt','isResolved']);

export const CacheConfigScalarFieldEnumSchema = z.enum(['id','key','name','description','ttlSeconds','isEnabled','strategy','invalidateOn','createdAt','updatedAt']);

export const CacheMetricsScalarFieldEnumSchema = z.enum(['id','cacheKey','endpoint','hitCount','missCount','avgHitTime','avgMissTime','lastHitAt','lastMissAt','date']);

export const AchievementCollectionScalarFieldEnumSchema = z.enum(['id','collectionId','name','description','theme','icon','rarity','titleReward','xpReward','goldReward','diamondReward','auraUnlock','themeUnlock','isSeasonal','seasonType','isEvent','eventId','availableFrom','availableUntil','isActive','createdAt']);

export const AchievementCollectionMemberScalarFieldEnumSchema = z.enum(['id','collectionId','achievementId','sortOrder']);

export const UserAchievementCollectionScalarFieldEnumSchema = z.enum(['id','userId','collectionId','progress','totalRequired','isCompleted','completedAt','rewardClaimed','claimedAt']);

export const ThemePackScalarFieldEnumSchema = z.enum(['id','themeId','name','description','type','rarity','isSeasonal','seasonType','gradientConfig','particleConfig','animationConfig','unlockLevel','unlockCondition','goldCost','diamondCost','vipOnly','isActive','availableFrom','availableUntil','createdAt']);

export const UserThemeSettingsScalarFieldEnumSchema = z.enum(['id','userId','autoSeasonalTheme','preferredThemeId','lastAutoSwitchAt']);

export const ArchetypeScalarFieldEnumSchema = z.enum(['key','name','description','baseStats','growthRates','emoji','createdAt','updatedAt','fusionWith','fusionResult','fusionCost','fusionVisual']);

export const UserArchetypeFusionScalarFieldEnumSchema = z.enum(['id','userId','baseA','baseB','result','createdAt']);

export const UserArchetypeHistoryScalarFieldEnumSchema = z.enum(['id','userId','previousType','newType','reason','statSnapshot','xpBonus','evolvedAt']);

export const AvatarLayerScalarFieldEnumSchema = z.enum(['id','layerType','name','description','rarity','unlockLevel','unlockCondition','goldCost','diamondCost','imageUrl','zIndex','createdAt']);

export const UserAvatarItemScalarFieldEnumSchema = z.enum(['id','userId','layerId','unlockedAt']);

export const UserAvatarScalarFieldEnumSchema = z.enum(['id','userId','equippedLayers','presetName','updatedAt']);

export const DuelSpectatorScalarFieldEnumSchema = z.enum(['id','duelId','userId','joinedAt','reactedAt']);

export const DuelHighlightScalarFieldEnumSchema = z.enum(['id','duelId','initiatorName','receiverName','scoreDiff','finalScore','category','isTopOfDay','viewCount','reactionsCount','createdAt']);

export const CoopMissionScalarFieldEnumSchema = z.enum(['id','type','title','description','questionIds','minMembers','maxMembers','rewardXp','rewardGold','timeLimit','requiresSync','status','createdBy','startedAt','completedAt','expiresAt','createdAt']);

export const CoopMemberScalarFieldEnumSchema = z.enum(['id','missionId','userId','role','joinedAt','isReady']);

export const CoopProgressScalarFieldEnumSchema = z.enum(['id','missionId','questionId','userId','answer','confirmed','submittedAt']);

export const TotemBattleScalarFieldEnumSchema = z.enum(['id','weekNumber','year','groupAId','groupBId','phase','scoreA','scoreB','winnerId','startAt','endAt','rewardEmblem','rewardXp','createdAt']);

export const TotemBattleResultScalarFieldEnumSchema = z.enum(['id','battleId','groupId','finalScore','memberCount','avgLevel','xpGained','challengesCompleted','ranking','rewardsJson','createdAt']);

export const GroupMemberScalarFieldEnumSchema = z.enum(['id','userId','groupId','role','joinedAt']);

export const GroupActivityScalarFieldEnumSchema = z.enum(['id','groupId','userId','type','message','metadata','createdAt']);

export const FlowScalarFieldEnumSchema = z.enum(['id','name','description','createdAt','metadata']);

export const FlowStepScalarFieldEnumSchema = z.enum(['id','flowId','questionVersionId','order','section','branchCondition','randomGroup','isOptional','metadata']);

export const FlowStepLinkScalarFieldEnumSchema = z.enum(['id','fromStepId','toStepId','condition']);

export const FlowProgressScalarFieldEnumSchema = z.enum(['id','userId','flowId','currentStepId','startedAt','updatedAt','completedAt']);

export const AnswerScalarFieldEnumSchema = z.enum(['id','sessionId','stepId','questionVersionId','value','createdAt']);

export const LanguageScalarFieldEnumSchema = z.enum(['id','code','name']);

export const VersionScalarFieldEnumSchema = z.enum(['id','name','value','createdAt']);

export const CategoryScalarFieldEnumSchema = z.enum(['id','name']);

export const SubCategoryScalarFieldEnumSchema = z.enum(['id','name','categoryId']);

export const SubSubCategoryScalarFieldEnumSchema = z.enum(['id','name','subCategoryId']);

export const SssCategoryScalarFieldEnumSchema = z.enum(['id','name','subSubCategoryId','status','generatedAt','error','review','finalText','responseType','outcome','multiplication','difficulty','ageCategory','gender','author','wildcard']);

export const UserQuestionScalarFieldEnumSchema = z.enum(['id','userId','questionId','questionTemplateId','status','servedAt','answeredAt','archetypeContext','moodContext','seasonId','createdAt','updatedAt']);

export const QuestionTemplateScalarFieldEnumSchema = z.enum(['id','category','archetypeAffinity','tone','text','tags','weight','isActive','createdAt','updatedAt']);

export const BattleAchievementScalarFieldEnumSchema = z.enum(['id','key','title','description','triggerType','thresholdValue','rewardXP','rewardBadgeId','rarity','isActive','createdAt','updatedAt']);

export const UserBattleAchievementScalarFieldEnumSchema = z.enum(['id','userId','achievementId','progress','isUnlocked','isClaimed','unlockedAt','claimedAt','createdAt','updatedAt']);

export const GroupScalarFieldEnumSchema = z.enum(['id','name','emblem','motto','ownerId','description','visibility','transparency','maxMembers','totalXp','avgKarma','avgPrestige','cost','weeklyBonus','createdAt','updatedAt']);

export const GroupStatScalarFieldEnumSchema = z.enum(['id','groupId','totalXP','reflections','avgLevel','updatedAt']);

export const UserGroupScalarFieldEnumSchema = z.enum(['id','userId','groupId']);

export const PublicPollScalarFieldEnumSchema = z.enum(['id','title','question','options','region','visibility','creatorId','allowFreetext','premiumCost','rewardXP','createdAt','expiresAt']);

export const PollResponseScalarFieldEnumSchema = z.enum(['id','pollId','userId','optionIdx','freetext','region','createdAt']);

export const PublicChallengeScalarFieldEnumSchema = z.enum(['id','title','description','region','rewardXP','rewardItem','activeFrom','activeTo','isActive','createdAt']);

export const ContentPackScalarFieldEnumSchema = z.enum(['id','key','title','description','category','price','premiumOnly','isActive','themeColor','icon','createdAt','updatedAt']);

export const PackItemScalarFieldEnumSchema = z.enum(['id','packId','type','refId','data','createdAt']);

export const UserPackScalarFieldEnumSchema = z.enum(['id','userId','packId','unlockedAt']);

export const FiresideScalarFieldEnumSchema = z.enum(['id','title','creatorId','participantIds','expiresAt','isActive','createdAt']);

export const FiresideReactionScalarFieldEnumSchema = z.enum(['id','firesideId','userId','emoji','createdAt']);

export const MemoryJournalScalarFieldEnumSchema = z.enum(['id','userId','title','summary','content','periodStart','periodEnd','sourceCount','createdAt']);

export const ComparisonCardScalarFieldEnumSchema = z.enum(['id','userId','statsJson','funText','imageUrl','generatedAt','autoGenerated']);

export const MicroMissionScalarFieldEnumSchema = z.enum(['id','key','title','description','type','rarity','durationSec','rewardXP','rewardItem','rewardGold','skipCostFood','skipCostGold','skipCostPremium','isActive','createdAt']);

export const UserMicroMissionScalarFieldEnumSchema = z.enum(['id','userId','missionId','status','startedAt','completedAt']);

export const AvatarMoodScalarFieldEnumSchema = z.enum(['id','userId','mood','pose','emotionScore','source','updatedAt']);

export const GlobalMoodScalarFieldEnumSchema = z.enum(['id','calmScore','chaosScore','neutralScore','updatedAt','dominantMood','worldModifier']);

export const UserMoodLogScalarFieldEnumSchema = z.enum(['id','userId','reflectionId','mood','loggedAt']);

export const MoodPresetScalarFieldEnumSchema = z.enum(['key','title','description','toneProfile','createdAt','isActive']);

export const MentorNPCScalarFieldEnumSchema = z.enum(['id','key','name','archetypeAffinity','personality','introText','tips','voiceTone','isActive','createdAt']);

export const UserMentorScalarFieldEnumSchema = z.enum(['id','userId','mentorId','affinityScore','lastInteractionAt']);

export const SeasonStorylineScalarFieldEnumSchema = z.enum(['id','key','title','description','startDate','endDate','isActive','xpBonus','goldBonus','eventModifier','npcIds','themeColor','posterUrl','createdAt']);

export const StorylineAchievementScalarFieldEnumSchema = z.enum(['id','seasonId','title','description','rewardItem','rewardXP','createdAt']);

export const WalletScalarFieldEnumSchema = z.enum(['id','userId','tenantId','funds','diamonds','badgesClaimedCount']);

export const LedgerEntryScalarFieldEnumSchema = z.enum(['id','walletId','tenantId','kind','amount','refType','refId','note','createdAt','currencyId']);

export const ProductScalarFieldEnumSchema = z.enum(['id','slug','title','description','kind','payload','stackable','active','createdAt']);

export const PriceScalarFieldEnumSchema = z.enum(['id','productId','stripePriceId','currencyCode','unitAmount','active']);

export const PurchaseScalarFieldEnumSchema = z.enum(['id','userId','tenantId','productId','quantity','totalMinor','status','extRef','createdAt']);

export const EntitlementScalarFieldEnumSchema = z.enum(['id','userId','tenantId','productId','meta','createdAt']);

export const SubscriptionScalarFieldEnumSchema = z.enum(['id','userId','stripeSubId','plan','status','currentPeriodEnd','perks','createdAt']);

export const UserProfileScalarFieldEnumSchema = z.enum(['id','userId','equippedAvatarId','equippedBackgroundId','equippedSkinId','updatedAt']);

export const BadgeScalarFieldEnumSchema = z.enum(['id','key','name','description','icon','rarity','unlockType','requirementValue','rewardType','rewardValue','seasonId','isActive','createdAt','slug','title','active','rarityId']);

export const UserBadgeScalarFieldEnumSchema = z.enum(['id','userId','badgeId','unlockedAt','claimedAt','isClaimed','createdAt']);

export const FailedLoginAttemptScalarFieldEnumSchema = z.enum(['id','ipAddress','email','createdAt']);

export const PasswordResetScalarFieldEnumSchema = z.enum(['id','userId','token','expiresAt','createdAt']);

export const EmailVerifyScalarFieldEnumSchema = z.enum(['id','userId','token','expiresAt','createdAt']);

export const AuditLogScalarFieldEnumSchema = z.enum(['id','userId','ip','action','meta','createdAt']);

export const GenerationBatchScalarFieldEnumSchema = z.enum(['id','createdAt','startedAt','finishedAt','status','language','targetCount','processed','succeeded','failed','note']);

export const GenerationJobScalarFieldEnumSchema = z.enum(['id','createdAt','startedAt','finishedAt','status','error','language','sssCategoryId','batchId','aiLogId','moderatorNotes','moderatorScore','moderatorStatus','moderatorUserId','qualityScore','retryCount','weightScore']);

export const AIResponseLogScalarFieldEnumSchema = z.enum(['id','createdAt','prompt','response','tokensIn','tokensOut','model']);

export const AccountScalarFieldEnumSchema = z.enum(['id','userId','type','provider','providerAccountId','refresh_token','access_token','expires_at','token_type','scope','id_token','session_state']);

export const SessionScalarFieldEnumSchema = z.enum(['id','sessionToken','userId','expires']);

export const VerificationTokenScalarFieldEnumSchema = z.enum(['identifier','token','expires']);

export const UserSubmissionScalarFieldEnumSchema = z.enum(['id','userId','type','status','title','content','description','categoryId','languageId','tags','imageUrl','metadata','upvotes','downvotes','score','moderatorId','moderatorNote','reviewedAt','approvedAt','rejectedAt','createdAt','updatedAt']);

export const EventScalarFieldEnumSchema = z.enum(['id','title','description','type','status','startDate','endDate','rewardXP','rewardDiamonds','imageUrl','metadata','participants','creatorId','createdAt','updatedAt','localeCode','isFlagged','flagReason','visibility']);

export const VoteScalarFieldEnumSchema = z.enum(['id','userId','sessionId','submissionId','voteType','createdAt']);

export const SeasonScalarFieldEnumSchema = z.enum(['id','name','displayName','number','startDate','endDate','status','metadata','createdAt','updatedAt']);

export const SeasonArchiveScalarFieldEnumSchema = z.enum(['id','userId','seasonId','finalXP','finalCoins','finalRank','finalKarma','achievements','createdAt']);

export const CosmeticItemScalarFieldEnumSchema = z.enum(['id','slug','name','description','type','rarity','price','imageUrl','metadata','active','seasonOnly','seasonId','createdAt','rarityId']);

export const UserCosmeticScalarFieldEnumSchema = z.enum(['id','userId','cosmeticId','equipped','purchasedAt']);

export const SeasonalEventScalarFieldEnumSchema = z.enum(['id','title','description','startDate','endDate','bonusType','bonusValue','status','metadata','createdAt']);

export const MirrorEventScalarFieldEnumSchema = z.enum(['id','key','title','description','theme','startDate','endDate','active','questionSet','rewardXP','rewardBadgeId','createdAt']);

export const WildcardEventScalarFieldEnumSchema = z.enum(['id','title','description','triggerType','rewardXP','rewardKarma','flavorText','createdAt']);

export const UserWildcardEventScalarFieldEnumSchema = z.enum(['id','userId','wildcardId','redeemed','redeemedAt','createdAt']);

export const ShareCardScalarFieldEnumSchema = z.enum(['id','userId','type','imageUrl','caption','createdAt','expiresAt']);

export const PosterCardScalarFieldEnumSchema = z.enum(['id','userId','title','statsJson','imageUrl','isShared','createdAt']);

export const DreamEventScalarFieldEnumSchema = z.enum(['id','title','description','triggerType','effect','flavorTone','createdAt','isActive']);

export const UserDreamEventScalarFieldEnumSchema = z.enum(['id','userId','dreamId','resolved','resolvedAt','createdAt']);

export const GenerationRecordScalarFieldEnumSchema = z.enum(['id','userId','generationNumber','prestigeId','inheritedPerks','summaryText','createdAt']);

export const FeedbackScalarFieldEnumSchema = z.enum(['id','userId','message','screenshotUrl','context','status','createdAt','reviewedAt','reviewedBy']);

export const CreatorPackScalarFieldEnumSchema = z.enum(['id','creatorId','title','description','type','status','metadata','createdAt','approvedAt','approvedBy','rewardType','rewardValue','publishedAt','downloadsCount']);

export const UserCreatedPackScalarFieldEnumSchema = z.enum(['id','userId','packId','isPublished','earnedRewards','createdAt','updatedAt']);

export const ItemRecipeScalarFieldEnumSchema = z.enum(['id','itemId','ingredients','craftTime','xpReward','discoveredBy','createdAt']);

export const ItemDiscoveryScalarFieldEnumSchema = z.enum(['id','userId','itemId','discoveredAt']);

export const UserReflectionScalarFieldEnumSchema = z.enum(['id','userId','date','type','content','summary','sentiment','stats','metadata','mirrorEventId','createdAt']);

export const ReflectionConversationScalarFieldEnumSchema = z.enum(['id','userId','reflectionId','prompt','response','toneLevel','modelUsed','createdAt']);

export const UserStatsScalarFieldEnumSchema = z.enum(['id','userId','totalXP','totalCoins','totalKarma','questionsCount','streakDays','currentRank','lastWeekXP','lastWeekCoins','lastWeekKarma','lastWeekQuestions','lastWeekStreak','rankChange','metadata','updatedAt','createdAt']);

export const UserWeeklyStatsScalarFieldEnumSchema = z.enum(['id','userId','weekStart','weekEnd','xpGain','coinsGain','karmaGain','questionsCount','streakDays','rankChange','metadata','createdAt']);

export const ChronicleScalarFieldEnumSchema = z.enum(['id','userId','type','summaryText','statsJson','quote','generatedAt','seasonId']);

export const RegionScalarFieldEnumSchema = z.enum(['id','key','name','description','orderIndex','buffType','buffValue','unlockRequirementType','unlockRequirementValue','isActive','createdAt']);

export const UserRegionScalarFieldEnumSchema = z.enum(['id','userId','regionId','isUnlocked','visitedAt','activeBuff','lastTravelAt']);

export const QuestScalarFieldEnumSchema = z.enum(['id','key','title','description','type','requirementType','requirementValue','rewardXP','rewardGold','rewardItem','rewardBadge','rewardKarma','isRepeatable','isActive','createdAt']);

export const UserQuestScalarFieldEnumSchema = z.enum(['id','userId','questId','progress','isCompleted','isClaimed','startedAt','completedAt']);

export const UserLoreEntryScalarFieldEnumSchema = z.enum(['id','userId','sourceType','sourceId','tone','text','createdAt']);

export const FriendshipScalarFieldEnumSchema = z.enum(['id','userA','userB','status','createdAt','updatedAt']);

export const SocialDuelScalarFieldEnumSchema = z.enum(['id','challengerId','opponentId','status','challengeType','rewardXP','winnerId','createdAt']);

export const SharedMissionScalarFieldEnumSchema = z.enum(['id','missionKey','participants','status','rewardXP','createdAt','completedAt']);

export const CurrencyScalarFieldEnumSchema = z.enum(['id','key','name','symbol','exchangeRate','isPremium','createdAt']);

export const UserWalletScalarFieldEnumSchema = z.enum(['id','userId','currencyKey','balance','updatedAt']);

export const MarketItemScalarFieldEnumSchema = z.enum(['id','name','description','price','currencyKey','rarity','category','stock','isEventItem','createdAt']);

export const TransactionScalarFieldEnumSchema = z.enum(['id','userId','itemId','type','amount','currencyKey','note','createdAt']);

export const BalanceSettingScalarFieldEnumSchema = z.enum(['id','key','value','updatedAt']);

export const EconomyPresetScalarFieldEnumSchema = z.enum(['id','name','description','modifiers','createdAt','updatedAt']);

export const SystemAlertScalarFieldEnumSchema = z.enum(['id','type','level','message','metadata','createdAt','resolvedAt','autoResolved']);

export const AlertWebhookScalarFieldEnumSchema = z.enum(['id','name','url','isActive','type','createdAt','updatedAt']);

export const MetaSeasonScalarFieldEnumSchema = z.enum(['id','key','title','description','startDate','endDate','isActive','createdAt']);

export const PrestigeRecordScalarFieldEnumSchema = z.enum(['id','userId','seasonId','oldLevel','legacyXP','prestigeCount','rewardBadgeId','prestigeTitle','prestigeBadgeId','prestigeColorTheme','createdAt']);

export const TrendingQuestionScalarFieldEnumSchema = z.enum(['id','questionId','region','windowStart','windowEnd','reactions24h','score','updatedAt']);

export const CombatSessionScalarFieldEnumSchema = z.enum(['id','userId','heroHp','heroMaxHp','enemyHp','enemyMaxHp','enemyName','enemyType','xpGained','goldGained','kills','currentStreak','isActive','lastActionAt','createdAt','updatedAt']);

export const EnemyScalarFieldEnumSchema = z.enum(['id','name','hp','str','def','speed','rarity','xpReward','goldReward','sprite','createdAt','updatedAt']);

export const FightScalarFieldEnumSchema = z.enum(['id','heroId','enemyId','rounds','winner','createdAt']);

export const PublicComparisonScalarFieldEnumSchema = z.enum(['id','question','answers','isPublic','reactionsLike','reactionsLaugh','reactionsThink','createdAt','updatedAt']);

export const SortOrderSchema = z.enum(['asc','desc']);

export const NullableJsonNullValueInputSchema = z.enum(['DbNull','JsonNull',]).transform((value) => value === 'JsonNull' ? Prisma.JsonNull : value === 'DbNull' ? Prisma.DbNull : value);

export const JsonNullValueInputSchema = z.enum(['JsonNull',]).transform((value) => (value === 'JsonNull' ? Prisma.JsonNull : value));

export const QueryModeSchema = z.enum(['default','insensitive']);

export const JsonNullValueFilterSchema = z.enum(['DbNull','JsonNull','AnyNull',]).transform((value) => value === 'JsonNull' ? Prisma.JsonNull : value === 'DbNull' ? Prisma.DbNull : value === 'AnyNull' ? Prisma.AnyNull : value);

export const NullsOrderSchema = z.enum(['first','last']);

export const CulturalFilterSeveritySchema = z.enum(['info','warn','block']);

export type CulturalFilterSeverityType = `${z.infer<typeof CulturalFilterSeveritySchema>}`

export const ContentVisibilitySchema = z.enum(['PUBLIC','HIDDEN']);

export type ContentVisibilityType = `${z.infer<typeof ContentVisibilitySchema>}`

export const ModerationContentTypeSchema = z.enum(['QUESTION','EVENT','COMMENT']);

export type ModerationContentTypeType = `${z.infer<typeof ModerationContentTypeSchema>}`

export const FeedbackStatusSchema = z.enum(['NEW','REVIEWED','RESOLVED']);

export type FeedbackStatusType = `${z.infer<typeof FeedbackStatusSchema>}`

export const CreatorPackTypeSchema = z.enum(['POLL','REFLECTION','MISSION']);

export type CreatorPackTypeType = `${z.infer<typeof CreatorPackTypeSchema>}`

export const CreatorPackStatusSchema = z.enum(['DRAFT','APPROVED','REJECTED']);

export type CreatorPackStatusType = `${z.infer<typeof CreatorPackStatusSchema>}`

export const CreatorRewardTypeSchema = z.enum(['xp','gold','diamonds','badge']);

export type CreatorRewardTypeType = `${z.infer<typeof CreatorRewardTypeSchema>}`

export const SystemAlertTypeSchema = z.enum(['cron','api','db','cache','memory','cpu']);

export type SystemAlertTypeType = `${z.infer<typeof SystemAlertTypeSchema>}`

export const SystemAlertLevelSchema = z.enum(['info','warn','error','critical']);

export type SystemAlertLevelType = `${z.infer<typeof SystemAlertLevelSchema>}`

export const WebhookTypeSchema = z.enum(['discord','slack','generic']);

export type WebhookTypeType = `${z.infer<typeof WebhookTypeSchema>}`

export const QuestionTypeSchema = z.enum(['SINGLE_CHOICE','MULTI_CHOICE','RANGE','NUMBER','TEXT']);

export type QuestionTypeType = `${z.infer<typeof QuestionTypeSchema>}`

export const UserRoleSchema = z.enum(['USER','ADMIN','MOD','DEVOPS']);

export type UserRoleType = `${z.infer<typeof UserRoleSchema>}`

export const TaskStatusSchema = z.enum(['NEW','ROUTED','IN_PROGRESS','DONE','BLOCKED']);

export type TaskStatusType = `${z.infer<typeof TaskStatusSchema>}`

export const TaskSourceSchema = z.enum(['WEB','EMAIL','API']);

export type TaskSourceType = `${z.infer<typeof TaskSourceSchema>}`

export const AssigneeTypeSchema = z.enum(['AUTO','VA']);

export type AssigneeTypeType = `${z.infer<typeof AssigneeTypeSchema>}`

export const AuthorTypeSchema = z.enum(['USER','VA','SYSTEM']);

export type AuthorTypeType = `${z.infer<typeof AuthorTypeSchema>}`

export const WorkflowTriggerSchema = z.enum(['KEYWORD','FORM','API']);

export type WorkflowTriggerType = `${z.infer<typeof WorkflowTriggerSchema>}`

export const WorkflowActionSchema = z.enum(['GOOGLE_SEARCH','WEB_SCRAPE','DOC_SUMMARY','CUSTOM']);

export type WorkflowActionType = `${z.infer<typeof WorkflowActionSchema>}`

export const RunStatusSchema = z.enum(['QUEUED','RUNNING','SUCCEEDED','FAILED']);

export type RunStatusType = `${z.infer<typeof RunStatusSchema>}`

export const IntegrationTypeSchema = z.enum(['GMAIL','SLACK','WEBHOOK']);

export type IntegrationTypeType = `${z.infer<typeof IntegrationTypeSchema>}`

export const QuestionSourceSchema = z.enum(['ai','user','import']);

export type QuestionSourceType = `${z.infer<typeof QuestionSourceSchema>}`

export const TagTypeSchema = z.enum(['tone','content']);

export type TagTypeType = `${z.infer<typeof TagTypeSchema>}`

export const CurrencyTypeSchema = z.enum(['FUNDS','DIAMONDS']);

export type CurrencyTypeType = `${z.infer<typeof CurrencyTypeSchema>}`

export const LedgerKindSchema = z.enum(['CREDIT','DEBIT']);

export type LedgerKindType = `${z.infer<typeof LedgerKindSchema>}`

export const ProductKindSchema = z.enum(['CURRENCY_PACK','COSMETIC']);

export type ProductKindType = `${z.infer<typeof ProductKindSchema>}`

export const PurchaseStatusSchema = z.enum(['PENDING','SUCCEEDED','FAILED','REFUNDED']);

export type PurchaseStatusType = `${z.infer<typeof PurchaseStatusSchema>}`

export const BatchStatusSchema = z.enum(['PENDING','RUNNING','DONE','FAILED','PAUSED']);

export type BatchStatusType = `${z.infer<typeof BatchStatusSchema>}`

export const JobStatusSchema = z.enum(['PENDING','RUNNING','DONE','FAILED']);

export type JobStatusType = `${z.infer<typeof JobStatusSchema>}`

export const SubmissionTypeSchema = z.enum(['QUESTION','PACK','EVENT']);

export type SubmissionTypeType = `${z.infer<typeof SubmissionTypeSchema>}`

export const SubmissionStatusSchema = z.enum(['PENDING','APPROVED','REJECTED','FLAGGED']);

export type SubmissionStatusType = `${z.infer<typeof SubmissionStatusSchema>}`

export const EventTypeSchema = z.enum(['CHALLENGE','THEMED_WEEK','SPOTLIGHT','COMMUNITY']);

export type EventTypeType = `${z.infer<typeof EventTypeSchema>}`

export const EventStatusSchema = z.enum(['DRAFT','ACTIVE','UPCOMING','ENDED','CANCELLED']);

export type EventStatusType = `${z.infer<typeof EventStatusSchema>}`

export const VoteTypeSchema = z.enum(['UPVOTE','DOWNVOTE']);

export type VoteTypeType = `${z.infer<typeof VoteTypeSchema>}`

export const SeasonStatusSchema = z.enum(['UPCOMING','ACTIVE','ENDED','ARCHIVED']);

export type SeasonStatusType = `${z.infer<typeof SeasonStatusSchema>}`

export const CosmeticTypeSchema = z.enum(['ICON','TITLE','BACKGROUND','BADGE','FRAME']);

export type CosmeticTypeType = `${z.infer<typeof CosmeticTypeSchema>}`

export const CosmeticRaritySchema = z.enum(['COMMON','UNCOMMON','RARE','EPIC','LEGENDARY']);

export type CosmeticRarityType = `${z.infer<typeof CosmeticRaritySchema>}`

export const SeasonalEventStatusSchema = z.enum(['INACTIVE','ACTIVE','ENDED']);

export type SeasonalEventStatusType = `${z.infer<typeof SeasonalEventStatusSchema>}`

export const ReflectionTypeSchema = z.enum(['DAILY','WEEKLY','MONTHLY','MILESTONE']);

export type ReflectionTypeType = `${z.infer<typeof ReflectionTypeSchema>}`

export const UserVisibilitySchema = z.enum(['PUBLIC','FRIENDS','PRIVATE']);

export type UserVisibilityType = `${z.infer<typeof UserVisibilitySchema>}`

export const NotificationTypeSchema = z.enum(['REFLECTION','LIKE','COMMENT','SYSTEM']);

export type NotificationTypeType = `${z.infer<typeof NotificationTypeSchema>}`

export const LangSchema = z.enum(['en','cs']);

export type LangType = `${z.infer<typeof LangSchema>}`

export const UserSynchTestStatusSchema = z.enum(['pending','completed','expired']);

export type UserSynchTestStatusType = `${z.infer<typeof UserSynchTestStatusSchema>}`

export const FactionBuffTypeSchema = z.enum(['xp','gold','luck','karma','custom']);

export type FactionBuffTypeType = `${z.infer<typeof FactionBuffTypeSchema>}`

export const RegionScopeSchema = z.enum(['global','regional']);

export type RegionScopeType = `${z.infer<typeof RegionScopeSchema>}`

export const CreationTypeSchema = z.enum(['question','mission','item','other']);

export type CreationTypeType = `${z.infer<typeof CreationTypeSchema>}`

export const CreationStatusSchema = z.enum(['pending','approved','rejected']);

export type CreationStatusType = `${z.infer<typeof CreationStatusSchema>}`

export const PostcardStatusSchema = z.enum(['pending','delivered','read','deleted']);

export type PostcardStatusType = `${z.infer<typeof PostcardStatusSchema>}`

export const ForkRaritySchema = z.enum(['common','rare','special']);

export type ForkRarityType = `${z.infer<typeof ForkRaritySchema>}`

export const ForkChoiceSchema = z.enum(['A','B']);

export type ForkChoiceType = `${z.infer<typeof ForkChoiceSchema>}`

export const DuetRunTypeSchema = z.enum(['reflect','collect','challenge']);

export type DuetRunTypeType = `${z.infer<typeof DuetRunTypeSchema>}`

export const DuetRunStatusSchema = z.enum(['pending','active','completed','expired']);

export type DuetRunStatusType = `${z.infer<typeof DuetRunStatusSchema>}`

export const RitualTimeOfDaySchema = z.enum(['morning','evening','any']);

export type RitualTimeOfDayType = `${z.infer<typeof RitualTimeOfDaySchema>}`

export const MicroClanBuffTypeSchema = z.enum(['xp','gold','karma','compare','reflect']);

export type MicroClanBuffTypeType = `${z.infer<typeof MicroClanBuffTypeSchema>}`

export const LootTriggerSchema = z.enum(['reflection','mission','comparison','levelup','random']);

export type LootTriggerType = `${z.infer<typeof LootTriggerSchema>}`

export const LootRewardTypeSchema = z.enum(['xp','gold','item','cosmetic','emote']);

export type LootRewardTypeType = `${z.infer<typeof LootRewardTypeSchema>}`

export const LootRaritySchema = z.enum(['common','rare','epic','legendary']);

export type LootRarityType = `${z.infer<typeof LootRaritySchema>}`

export const BadgeRaritySchema = z.enum(['common','rare','epic','legendary','mythic','eternal']);

export type BadgeRarityType = `${z.infer<typeof BadgeRaritySchema>}`

export const BadgeUnlockTypeSchema = z.enum(['level','event','season','special']);

export type BadgeUnlockTypeType = `${z.infer<typeof BadgeUnlockTypeSchema>}`

export const BadgeRewardTypeSchema = z.enum(['currency','item','title']);

export type BadgeRewardTypeType = `${z.infer<typeof BadgeRewardTypeSchema>}`

export const ChronicleTypeSchema = z.enum(['weekly','seasonal']);

export type ChronicleTypeType = `${z.infer<typeof ChronicleTypeSchema>}`

export const RegionBuffTypeSchema = z.enum(['xp','gold','mood','reflection']);

export type RegionBuffTypeType = `${z.infer<typeof RegionBuffTypeSchema>}`

export const UnlockRequirementTypeSchema = z.enum(['level','task','gold','achievement']);

export type UnlockRequirementTypeType = `${z.infer<typeof UnlockRequirementTypeSchema>}`

export const QuestTypeSchema = z.enum(['daily','weekly','story','side']);

export type QuestTypeType = `${z.infer<typeof QuestTypeSchema>}`

export const QuestRequirementTypeSchema = z.enum(['xp','reflections','gold','missions','custom']);

export type QuestRequirementTypeType = `${z.infer<typeof QuestRequirementTypeSchema>}`

export const LoreSourceTypeSchema = z.enum(['reflection','quest','item','event','system']);

export type LoreSourceTypeType = `${z.infer<typeof LoreSourceTypeSchema>}`

export const LoreToneSchema = z.enum(['serious','comedic','poetic']);

export type LoreToneType = `${z.infer<typeof LoreToneSchema>}`

export const FriendshipStatusSchema = z.enum(['pending','accepted','blocked']);

export type FriendshipStatusType = `${z.infer<typeof FriendshipStatusSchema>}`

export const DuelStatusSchema = z.enum(['pending','active','completed','expired']);

export type DuelStatusType = `${z.infer<typeof DuelStatusSchema>}`

export const ChallengeTypeSchema = z.enum(['xp','reflection','random','poll']);

export type ChallengeTypeType = `${z.infer<typeof ChallengeTypeSchema>}`

export const SharedMissionStatusSchema = z.enum(['active','completed','expired']);

export type SharedMissionStatusType = `${z.infer<typeof SharedMissionStatusSchema>}`

export const ItemCategorySchema = z.enum(['item','cosmetic','booster']);

export type ItemCategoryType = `${z.infer<typeof ItemCategorySchema>}`

export const TransactionTypeSchema = z.enum(['purchase','reward','gift','refund']);

export type TransactionTypeType = `${z.infer<typeof TransactionTypeSchema>}`

export const CronJobStatusSchema = z.enum(['success','error']);

export type CronJobStatusType = `${z.infer<typeof CronJobStatusSchema>}`

export const ActivityTypeSchema = z.enum(['reflection','question','quest','badge','achievement','social','system','other']);

export type ActivityTypeType = `${z.infer<typeof ActivityTypeSchema>}`

export const ArchetypeAffinitySchema = z.enum(['thinker','trickster','guardian','wanderer','chaos']);

export type ArchetypeAffinityType = `${z.infer<typeof ArchetypeAffinitySchema>}`

export const NPCToneSchema = z.enum(['serious','sarcastic','poetic','neutral']);

export type NPCToneType = `${z.infer<typeof NPCToneSchema>}`

export const DialogueRaritySchema = z.enum(['common','rare','epic']);

export type DialogueRarityType = `${z.infer<typeof DialogueRaritySchema>}`

export const DialogueTriggerTypeSchema = z.enum(['greeting','quest','reflection','event','random']);

export type DialogueTriggerTypeType = `${z.infer<typeof DialogueTriggerTypeSchema>}`

export const QuestionTemplateCategorySchema = z.enum(['daily','weekly','archetype','event','wildcard']);

export type QuestionTemplateCategoryType = `${z.infer<typeof QuestionTemplateCategorySchema>}`

export const QuestionToneSchema = z.enum(['serious','poetic','chaotic','funny']);

export type QuestionToneType = `${z.infer<typeof QuestionToneSchema>}`

export const BattleAchievementTriggerTypeSchema = z.enum(['duelWin','duelLose','missionComplete','event']);

export type BattleAchievementTriggerTypeType = `${z.infer<typeof BattleAchievementTriggerTypeSchema>}`

export const BattleAchievementRaritySchema = z.enum(['common','rare','epic','legendary']);

export type BattleAchievementRarityType = `${z.infer<typeof BattleAchievementRaritySchema>}`

export const GlobalMoodTypeSchema = z.enum(['calm','chaos','neutral']);

export type GlobalMoodTypeType = `${z.infer<typeof GlobalMoodTypeSchema>}`

/////////////////////////////////////////
// MODELS
/////////////////////////////////////////

/////////////////////////////////////////
// USER SCHEMA
/////////////////////////////////////////

export const UserSchema = z.object({
  visibility: UserVisibilitySchema,
  role: UserRoleSchema,
  lang: LangSchema,
  id: z.cuid(),
  email: z.string(),
  passwordHash: z.string().nullable(),
  name: z.string().nullable(),
  phone: z.string().nullable(),
  language: z.string().nullable(),
  country: z.string().nullable(),
  dateOfBirth: z.coerce.date().nullable(),
  avatarUrl: z.string().nullable(),
  username: z.string().nullable(),
  bio: z.string().nullable(),
  banned: z.boolean(),
  motto: z.string().nullable(),
  theme: z.string().nullable(),
  funds: z.instanceof(Decimal, { message: "Field 'funds' must be a Decimal. Location: ['Models', 'User']"}),
  diamonds: z.number().int(),
  xp: z.number().int(),
  level: z.number().int(),
  lastLoginAt: z.coerce.date().nullable(),
  lastActiveAt: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
  image: z.string().nullable(),
  streakCount: z.number().int(),
  lastAnsweredAt: z.coerce.date().nullable(),
  score: z.number().int(),
  questionsAnswered: z.number().int(),
  questionsCreated: z.number().int(),
  emailVerified: z.coerce.date().nullable(),
  emailVerifiedAt: z.coerce.date().nullable(),
  newsletterOptIn: z.boolean(),
  archetype: z.string().nullable(),
  archetypeKey: z.string().nullable(),
  stats: JsonValueSchema.nullable(),
  lastArchetypeReroll: z.coerce.date().nullable(),
  settings: JsonValueSchema.nullable(),
  localeCode: z.string(),
  ageGroup: z.string().nullable(),
  region: z.string().nullable(),
  interests: z.string().array(),
  tone: z.string().nullable(),
  onboardingCompleted: z.boolean(),
  combatKills: z.number().int(),
  combatBattles: z.number().int(),
  combatHighestStreak: z.number().int(),
  statCreativity: z.number().int(),
  statHealth: z.number().int(),
  statKnowledge: z.number().int(),
  statSleep: z.number().int(),
  statSocial: z.number().int(),
  allowPublicCompare: z.boolean(),
  canBeAdded: z.string(),
  badgeType: z.string().nullable(),
  karmaScore: z.number().int(),
  prestigeScore: z.number().int(),
  showBadges: z.boolean(),
  coins: z.number().int(),
  seasonalXP: z.number().int(),
  seasonLevel: z.number().int(),
  seasonXP: z.number().int(),
  prestigeCount: z.number().int(),
  legacyPerk: z.string().nullable(),
  prestigeTitle: z.string().nullable(),
  prestigeBadgeId: z.string().nullable(),
  prestigeColorTheme: z.string().nullable(),
  currentGeneration: z.number().int(),
  avatarTheme: z.string().nullable(),
  moodFeed: z.string().nullable(),
  equippedTitle: z.string().nullable(),
  equippedIcon: z.string().nullable(),
  equippedBackground: z.string().nullable(),
})

export type User = z.infer<typeof UserSchema>

/////////////////////////////////////////
// AFFINITY SCHEMA
/////////////////////////////////////////

export const AffinitySchema = z.object({
  id: z.cuid(),
  sourceId: z.string(),
  targetId: z.string(),
  type: z.string(),
  strength: z.number(),
  mutual: z.boolean(),
  visibility: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type Affinity = z.infer<typeof AffinitySchema>

/////////////////////////////////////////
// ORG SCHEMA
/////////////////////////////////////////

export const OrgSchema = z.object({
  id: z.cuid(),
  name: z.string(),
  createdAt: z.coerce.date(),
})

export type Org = z.infer<typeof OrgSchema>

/////////////////////////////////////////
// MEMBERSHIP SCHEMA
/////////////////////////////////////////

export const MembershipSchema = z.object({
  id: z.cuid(),
  userId: z.string(),
  orgId: z.string(),
  role: z.string(),
})

export type Membership = z.infer<typeof MembershipSchema>

/////////////////////////////////////////
// TASK SCHEMA
/////////////////////////////////////////

export const TaskSchema = z.object({
  status: TaskStatusSchema,
  source: TaskSourceSchema,
  assigneeType: AssigneeTypeSchema,
  id: z.cuid(),
  orgId: z.string(),
  createdById: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  priority: z.string(),
  assigneeId: z.string().nullable(),
  dueAt: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type Task = z.infer<typeof TaskSchema>

/////////////////////////////////////////
// ATTACHMENT SCHEMA
/////////////////////////////////////////

export const AttachmentSchema = z.object({
  id: z.cuid(),
  taskId: z.string(),
  name: z.string(),
  url: z.string(),
  mimeType: z.string(),
  size: z.number().int(),
})

export type Attachment = z.infer<typeof AttachmentSchema>

/////////////////////////////////////////
// TASK MESSAGE SCHEMA
/////////////////////////////////////////

export const TaskMessageSchema = z.object({
  authorType: AuthorTypeSchema,
  id: z.cuid(),
  taskId: z.string(),
  text: z.string(),
  createdAt: z.coerce.date(),
})

export type TaskMessage = z.infer<typeof TaskMessageSchema>

/////////////////////////////////////////
// WORKFLOW SCHEMA
/////////////////////////////////////////

export const WorkflowSchema = z.object({
  trigger: WorkflowTriggerSchema,
  action: WorkflowActionSchema,
  id: z.cuid(),
  orgId: z.string(),
  name: z.string(),
  keywords: z.string().array(),
  isActive: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type Workflow = z.infer<typeof WorkflowSchema>

/////////////////////////////////////////
// RUN SCHEMA
/////////////////////////////////////////

export const RunSchema = z.object({
  status: RunStatusSchema,
  id: z.cuid(),
  taskId: z.string(),
  workflowId: z.string().nullable(),
  logs: JsonValueSchema.nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type Run = z.infer<typeof RunSchema>

/////////////////////////////////////////
// INTEGRATION SCHEMA
/////////////////////////////////////////

export const IntegrationSchema = z.object({
  type: IntegrationTypeSchema,
  id: z.cuid(),
  orgId: z.string(),
  config: JsonValueSchema,
  isActive: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type Integration = z.infer<typeof IntegrationSchema>

/////////////////////////////////////////
// QUESTION SCHEMA
/////////////////////////////////////////

export const QuestionSchema = z.object({
  source: QuestionSourceSchema,
  lang: LangSchema.nullable(),
  visibility: ContentVisibilitySchema,
  text: z.string(),
  normalizedText: z.string().nullable(),
  difficulty: z.string().nullable(),
  approved: z.boolean(),
  reviewNotes: z.string().nullable(),
  createdByUserId: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  id: z.cuid(),
  categoryId: z.string(),
  subCategoryId: z.string().nullable(),
  subSubCategoryId: z.string().nullable(),
  relatedToId: z.string().nullable(),
  metadata: JsonValueSchema.nullable(),
  currentVersionId: z.string().nullable(),
  ssscId: z.string(),
  region: z.string().nullable(),
  isLocalized: z.boolean(),
  localeCode: z.string().nullable(),
  isFlagged: z.boolean(),
  flagReason: z.string().nullable(),
  reactionsLike: z.number().int(),
  reactionsLaugh: z.number().int(),
  reactionsThink: z.number().int(),
})

export type Question = z.infer<typeof QuestionSchema>

/////////////////////////////////////////
// QUESTION VERSION SCHEMA
/////////////////////////////////////////

export const QuestionVersionSchema = z.object({
  id: z.cuid(),
  questionId: z.string(),
  text: z.string(),
  displayText: z.string(),
  type: z.string(),
  options: JsonValueSchema.nullable(),
  metadata: JsonValueSchema.nullable(),
  createdAt: z.coerce.date(),
  version: z.number().int(),
})

export type QuestionVersion = z.infer<typeof QuestionVersionSchema>

/////////////////////////////////////////
// QUESTION TAG SCHEMA
/////////////////////////////////////////

export const QuestionTagSchema = z.object({
  type: TagTypeSchema,
  id: z.cuid(),
  name: z.string(),
  description: z.string().nullable(),
})

export type QuestionTag = z.infer<typeof QuestionTagSchema>

/////////////////////////////////////////
// QUESTION VERSION TAG SCHEMA
/////////////////////////////////////////

export const QuestionVersionTagSchema = z.object({
  id: z.cuid(),
  questionVersionId: z.string(),
  tagId: z.string(),
})

export type QuestionVersionTag = z.infer<typeof QuestionVersionTagSchema>

/////////////////////////////////////////
// QUESTION GENERATION SCHEMA
/////////////////////////////////////////

export const QuestionGenerationSchema = z.object({
  id: z.string(),
  ssscId: z.string(),
  targetCount: z.number().int(),
  status: z.string(),
  prompt: z.string().nullable(),
  insertedCount: z.number().int(),
  rawResponse: z.string().nullable(),
  finishedAt: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type QuestionGeneration = z.infer<typeof QuestionGenerationSchema>

/////////////////////////////////////////
// FLOW QUESTION SCHEMA
/////////////////////////////////////////

export const FlowQuestionSchema = z.object({
  type: QuestionTypeSchema,
  id: z.cuid(),
  categoryId: z.string().nullable(),
  locale: z.string(),
  text: z.string(),
  isActive: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type FlowQuestion = z.infer<typeof FlowQuestionSchema>

/////////////////////////////////////////
// FLOW QUESTION OPTION SCHEMA
/////////////////////////////////////////

export const FlowQuestionOptionSchema = z.object({
  id: z.cuid(),
  questionId: z.string(),
  label: z.string(),
  value: z.string(),
  order: z.number().int(),
})

export type FlowQuestionOption = z.infer<typeof FlowQuestionOptionSchema>

/////////////////////////////////////////
// USER RESPONSE SCHEMA
/////////////////////////////////////////

export const UserResponseSchema = z.object({
  id: z.cuid(),
  userId: z.string(),
  questionId: z.string(),
  optionIds: z.string().array(),
  numericVal: z.number().nullable(),
  textVal: z.string().nullable(),
  skipped: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type UserResponse = z.infer<typeof UserResponseSchema>

/////////////////////////////////////////
// SYNCH TEST SCHEMA
/////////////////////////////////////////

export const SynchTestSchema = z.object({
  id: z.cuid(),
  key: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  questions: JsonValueSchema,
  resultTextTemplates: JsonValueSchema,
  rewardXP: z.number().int(),
  rewardKarma: z.number().int(),
  isActive: z.boolean(),
  createdAt: z.coerce.date(),
})

export type SynchTest = z.infer<typeof SynchTestSchema>

/////////////////////////////////////////
// USER SYNCH TEST SCHEMA
/////////////////////////////////////////

export const UserSynchTestSchema = z.object({
  status: UserSynchTestStatusSchema,
  id: z.cuid(),
  testId: z.string(),
  userA: z.string(),
  userB: z.string(),
  answersA: JsonValueSchema,
  answersB: JsonValueSchema,
  compatibilityScore: z.number().nullable(),
  shared: z.boolean(),
  createdAt: z.coerce.date(),
})

export type UserSynchTest = z.infer<typeof UserSynchTestSchema>

/////////////////////////////////////////
// FACTION SCHEMA
/////////////////////////////////////////

export const FactionSchema = z.object({
  buffType: FactionBuffTypeSchema.nullable(),
  regionScope: RegionScopeSchema,
  id: z.cuid(),
  key: z.string(),
  name: z.string(),
  motto: z.string().nullable(),
  description: z.string().nullable(),
  colorPrimary: z.string(),
  colorSecondary: z.string().nullable(),
  buffValue: z.number(),
  isActive: z.boolean(),
  createdAt: z.coerce.date(),
})

export type Faction = z.infer<typeof FactionSchema>

/////////////////////////////////////////
// FACTION INFLUENCE SCHEMA
/////////////////////////////////////////

export const FactionInfluenceSchema = z.object({
  id: z.cuid(),
  factionId: z.string(),
  region: z.string(),
  influenceScore: z.number(),
  lastUpdated: z.coerce.date(),
  dailyDelta: z.number(),
  contributionsCount: z.number().int(),
})

export type FactionInfluence = z.infer<typeof FactionInfluenceSchema>

/////////////////////////////////////////
// USER FACTION SCHEMA
/////////////////////////////////////////

export const UserFactionSchema = z.object({
  userId: z.string(),
  factionId: z.string(),
  joinedAt: z.coerce.date(),
  contributedXP: z.number().int(),
  isLeader: z.boolean(),
})

export type UserFaction = z.infer<typeof UserFactionSchema>

/////////////////////////////////////////
// COMMUNITY CREATION SCHEMA
/////////////////////////////////////////

export const CommunityCreationSchema = z.object({
  type: CreationTypeSchema,
  status: CreationStatusSchema,
  id: z.cuid(),
  userId: z.string(),
  title: z.string(),
  content: JsonValueSchema,
  likes: z.number().int(),
  rewardXP: z.number().int().nullable(),
  rewardKarma: z.number().int().nullable(),
  createdAt: z.coerce.date(),
})

export type CommunityCreation = z.infer<typeof CommunityCreationSchema>

/////////////////////////////////////////
// COMMUNITY CREATION LIKE SCHEMA
/////////////////////////////////////////

export const CommunityCreationLikeSchema = z.object({
  id: z.cuid(),
  userId: z.string(),
  creationId: z.string(),
  createdAt: z.coerce.date(),
})

export type CommunityCreationLike = z.infer<typeof CommunityCreationLikeSchema>

/////////////////////////////////////////
// POSTCARD SCHEMA
/////////////////////////////////////////

export const PostcardSchema = z.object({
  status: PostcardStatusSchema,
  id: z.cuid(),
  senderId: z.string(),
  receiverId: z.string(),
  message: z.string(),
  deliveryAt: z.coerce.date(),
  createdAt: z.coerce.date(),
})

export type Postcard = z.infer<typeof PostcardSchema>

/////////////////////////////////////////
// RARITY TIER SCHEMA
/////////////////////////////////////////

export const RarityTierSchema = z.object({
  id: z.cuid(),
  key: z.string(),
  name: z.string(),
  colorPrimary: z.string(),
  colorGlow: z.string().nullable(),
  frameStyle: z.string().nullable(),
  rankOrder: z.number().int(),
  description: z.string().nullable(),
  isActive: z.boolean(),
  createdAt: z.coerce.date(),
})

export type RarityTier = z.infer<typeof RarityTierSchema>

/////////////////////////////////////////
// DAILY FORK SCHEMA
/////////////////////////////////////////

export const DailyForkSchema = z.object({
  rarity: ForkRaritySchema,
  id: z.cuid(),
  key: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  optionA: z.string(),
  optionB: z.string(),
  effectA: JsonValueSchema,
  effectB: JsonValueSchema,
  createdAt: z.coerce.date(),
  isActive: z.boolean(),
})

export type DailyFork = z.infer<typeof DailyForkSchema>

/////////////////////////////////////////
// USER DAILY FORK SCHEMA
/////////////////////////////////////////

export const UserDailyForkSchema = z.object({
  choice: ForkChoiceSchema,
  id: z.cuid(),
  userId: z.string(),
  forkId: z.string(),
  resultSummary: z.string().nullable(),
  createdAt: z.coerce.date(),
})

export type UserDailyFork = z.infer<typeof UserDailyForkSchema>

/////////////////////////////////////////
// DUET RUN SCHEMA
/////////////////////////////////////////

export const DuetRunSchema = z.object({
  type: DuetRunTypeSchema,
  id: z.cuid(),
  missionKey: z.string(),
  title: z.string(),
  description: z.string(),
  durationSec: z.number().int(),
  rewardXP: z.number().int(),
  rewardKarma: z.number().int(),
  createdAt: z.coerce.date(),
  isActive: z.boolean(),
})

export type DuetRun = z.infer<typeof DuetRunSchema>

/////////////////////////////////////////
// USER DUET RUN SCHEMA
/////////////////////////////////////////

export const UserDuetRunSchema = z.object({
  status: DuetRunStatusSchema,
  id: z.cuid(),
  runId: z.string(),
  userA: z.string(),
  userB: z.string(),
  startedAt: z.coerce.date(),
  endedAt: z.coerce.date().nullable(),
  progressA: z.number().int(),
  progressB: z.number().int(),
})

export type UserDuetRun = z.infer<typeof UserDuetRunSchema>

/////////////////////////////////////////
// RITUAL SCHEMA
/////////////////////////////////////////

export const RitualSchema = z.object({
  timeOfDay: RitualTimeOfDaySchema,
  id: z.cuid(),
  key: z.string(),
  title: z.string(),
  description: z.string(),
  rewardXP: z.number().int(),
  rewardKarma: z.number().int(),
  createdAt: z.coerce.date(),
  isActive: z.boolean(),
})

export type Ritual = z.infer<typeof RitualSchema>

/////////////////////////////////////////
// USER RITUAL SCHEMA
/////////////////////////////////////////

export const UserRitualSchema = z.object({
  id: z.cuid(),
  userId: z.string(),
  ritualId: z.string(),
  lastCompleted: z.coerce.date().nullable(),
  streakCount: z.number().int(),
  totalCompleted: z.number().int(),
})

export type UserRitual = z.infer<typeof UserRitualSchema>

/////////////////////////////////////////
// MICRO CLAN SCHEMA
/////////////////////////////////////////

export const MicroClanSchema = z.object({
  buffType: MicroClanBuffTypeSchema,
  id: z.cuid(),
  name: z.string(),
  description: z.string().nullable(),
  leaderId: z.string(),
  memberIds: z.string().array(),
  buffValue: z.number(),
  seasonId: z.string().nullable(),
  createdAt: z.coerce.date(),
  isActive: z.boolean(),
})

export type MicroClan = z.infer<typeof MicroClanSchema>

/////////////////////////////////////////
// MICRO CLAN STATS SCHEMA
/////////////////////////////////////////

export const MicroClanStatsSchema = z.object({
  id: z.cuid(),
  clanId: z.string(),
  xpTotal: z.number().int(),
  activityScore: z.number().int(),
  rank: z.number().int(),
  updatedAt: z.coerce.date(),
})

export type MicroClanStats = z.infer<typeof MicroClanStatsSchema>

/////////////////////////////////////////
// LOOT MOMENT SCHEMA
/////////////////////////////////////////

export const LootMomentSchema = z.object({
  trigger: LootTriggerSchema,
  rewardType: LootRewardTypeSchema,
  rarity: LootRaritySchema,
  id: z.cuid(),
  key: z.string(),
  rewardValue: z.number().int(),
  flavorText: z.string().nullable(),
  createdAt: z.coerce.date(),
  isActive: z.boolean(),
})

export type LootMoment = z.infer<typeof LootMomentSchema>

/////////////////////////////////////////
// USER LOOT MOMENT SCHEMA
/////////////////////////////////////////

export const UserLootMomentSchema = z.object({
  id: z.cuid(),
  userId: z.string(),
  momentId: z.string(),
  rewardData: JsonValueSchema,
  triggeredAt: z.coerce.date(),
  redeemedAt: z.coerce.date().nullable(),
})

export type UserLootMoment = z.infer<typeof UserLootMomentSchema>

/////////////////////////////////////////
// MESSAGE SCHEMA
/////////////////////////////////////////

export const MessageSchema = z.object({
  id: z.cuid(),
  createdAt: z.coerce.date(),
  content: z.string(),
  isRead: z.boolean(),
  receiverId: z.string(),
  senderId: z.string(),
  flagged: z.boolean(),
  hiddenBySender: z.boolean(),
  hiddenByReceiver: z.boolean(),
})

export type Message = z.infer<typeof MessageSchema>

/////////////////////////////////////////
// COMMENT SCHEMA
/////////////////////////////////////////

export const CommentSchema = z.object({
  visibility: ContentVisibilitySchema,
  id: z.cuid(),
  userId: z.string(),
  targetType: z.string(),
  targetId: z.string(),
  content: z.string(),
  flagged: z.boolean(),
  isFlagged: z.boolean(),
  flagReason: z.string().nullable(),
  createdAt: z.coerce.date(),
})

export type Comment = z.infer<typeof CommentSchema>

/////////////////////////////////////////
// ACTION LOG SCHEMA
/////////////////////////////////////////

export const ActionLogSchema = z.object({
  id: z.cuid(),
  userId: z.string(),
  action: z.string(),
  metadata: JsonValueSchema.nullable(),
  createdAt: z.coerce.date(),
})

export type ActionLog = z.infer<typeof ActionLogSchema>

/////////////////////////////////////////
// MODERATION LOG SCHEMA
/////////////////////////////////////////

export const ModerationLogSchema = z.object({
  id: z.cuid(),
  moderatorId: z.string(),
  action: z.string(),
  targetType: z.string(),
  targetId: z.string(),
  reason: z.string().nullable(),
  createdAt: z.coerce.date(),
})

export type ModerationLog = z.infer<typeof ModerationLogSchema>

/////////////////////////////////////////
// CULTURAL FILTER SCHEMA
/////////////////////////////////////////

export const CulturalFilterSchema = z.object({
  severity: CulturalFilterSeveritySchema,
  id: z.cuid(),
  region: z.string(),
  tag: z.string(),
  category: z.string().nullable(),
  description: z.string().nullable(),
  createdBy: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type CulturalFilter = z.infer<typeof CulturalFilterSchema>

/////////////////////////////////////////
// MODERATION REPORT SCHEMA
/////////////////////////////////////////

export const ModerationReportSchema = z.object({
  type: ModerationContentTypeSchema,
  id: z.cuid(),
  contentId: z.string(),
  reasonTag: z.string(),
  region: z.string().nullable(),
  reporterId: z.string().nullable(),
  isAnonymous: z.boolean(),
  createdAt: z.coerce.date(),
})

export type ModerationReport = z.infer<typeof ModerationReportSchema>

/////////////////////////////////////////
// AI REGIONAL CONTEXT SCHEMA
/////////////////////////////////////////

/**
 * v0.27.7 â€” AI Regional Contexts
 */
export const AIRegionalContextSchema = z.object({
  id: z.cuid(),
  region: z.string(),
  localeCode: z.string(),
  toneProfile: z.string().nullable(),
  culturalNotes: z.string().nullable(),
  humorStyle: z.string().nullable(),
  tabooTopics: JsonValueSchema.nullable(),
  updatedAt: z.coerce.date(),
})

export type AIRegionalContext = z.infer<typeof AIRegionalContextSchema>

/////////////////////////////////////////
// REFLECTION SCHEMA
/////////////////////////////////////////

/**
 * v0.28.0 â€” Reflection Journal (Light)
 */
export const ReflectionSchema = z.object({
  id: z.cuid(),
  userId: z.string(),
  text: z.string(),
  createdAt: z.coerce.date(),
})

export type Reflection = z.infer<typeof ReflectionSchema>

/////////////////////////////////////////
// ACHIEVEMENT SCHEMA
/////////////////////////////////////////

export const AchievementSchema = z.object({
  id: z.cuid(),
  code: z.string(),
  key: z.string().nullable(),
  category: z.string(),
  tier: z.number().int(),
  title: z.string(),
  name: z.string().nullable(),
  description: z.string(),
  icon: z.string().nullable(),
  emoji: z.string().nullable(),
  xpReward: z.number().int(),
  rewardXp: z.number().int().nullable(),
  rewardGold: z.number().int(),
  updatedAt: z.coerce.date(),
  createdAt: z.coerce.date(),
})

export type Achievement = z.infer<typeof AchievementSchema>

/////////////////////////////////////////
// USER ACHIEVEMENT SCHEMA
/////////////////////////////////////////

export const UserAchievementSchema = z.object({
  id: z.cuid(),
  userId: z.string(),
  achievementId: z.string(),
  tier: z.number().int(),
  earnedAt: z.coerce.date(),
  unlockedAt: z.coerce.date().nullable(),
  animationShownAt: z.coerce.date().nullable(),
})

export type UserAchievement = z.infer<typeof UserAchievementSchema>

/////////////////////////////////////////
// EVENT LOG SCHEMA
/////////////////////////////////////////

export const EventLogSchema = z.object({
  id: z.cuid(),
  userId: z.string(),
  type: z.string().nullable(),
  title: z.string(),
  description: z.string().nullable(),
  metadata: JsonValueSchema.nullable(),
  visibility: z.string(),
  reactionsCount: z.number().int(),
  createdAt: z.coerce.date(),
  eventType: z.string().nullable(),
  eventData: JsonValueSchema.nullable(),
})

export type EventLog = z.infer<typeof EventLogSchema>

/////////////////////////////////////////
// WAITLIST SCHEMA
/////////////////////////////////////////

export const WaitlistSchema = z.object({
  id: z.cuid(),
  email: z.string(),
  refCode: z.string().nullable(),
  source: z.string(),
  status: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type Waitlist = z.infer<typeof WaitlistSchema>

/////////////////////////////////////////
// MARKETING CAMPAIGN SCHEMA
/////////////////////////////////////////

export const MarketingCampaignSchema = z.object({
  id: z.cuid(),
  title: z.string(),
  content: z.string(),
  link: z.string().nullable(),
  status: z.string(),
  sentAt: z.coerce.date().nullable(),
  deliveredCount: z.number().int(),
  openedCount: z.number().int(),
  clickedCount: z.number().int(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type MarketingCampaign = z.infer<typeof MarketingCampaignSchema>

/////////////////////////////////////////
// ACTIVITY SCHEMA
/////////////////////////////////////////

export const ActivitySchema = z.object({
  type: ActivityTypeSchema,
  id: z.cuid(),
  userId: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  metadata: JsonValueSchema.nullable(),
  createdAt: z.coerce.date(),
})

export type Activity = z.infer<typeof ActivitySchema>

/////////////////////////////////////////
// NOTIFICATION SCHEMA
/////////////////////////////////////////

export const NotificationSchema = z.object({
  type: NotificationTypeSchema,
  id: z.cuid(),
  userId: z.string(),
  senderId: z.string().nullable(),
  title: z.string(),
  body: z.string().nullable(),
  isRead: z.boolean(),
  createdAt: z.coerce.date(),
})

export type Notification = z.infer<typeof NotificationSchema>

/////////////////////////////////////////
// PRESENCE SCHEMA
/////////////////////////////////////////

export const PresenceSchema = z.object({
  userId: z.string(),
  status: z.string(),
  lastActive: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type Presence = z.infer<typeof PresenceSchema>

/////////////////////////////////////////
// ITEM SCHEMA
/////////////////////////////////////////

export const ItemSchema = z.object({
  id: z.cuid(),
  name: z.string(),
  type: z.string(),
  rarity: z.string(),
  description: z.string().nullable(),
  power: z.number().int().nullable(),
  defense: z.number().int().nullable(),
  effect: z.string().nullable(),
  bonus: z.string().nullable(),
  icon: z.string().nullable(),
  key: z.string().nullable(),
  emoji: z.string().nullable(),
  createdAt: z.coerce.date(),
  availableUntil: z.coerce.date().nullable(),
  cosmeticSubtype: z.string().nullable(),
  cosmeticType: z.string().nullable(),
  diamondPrice: z.number().int().nullable(),
  eventCurrency: z.string().nullable(),
  eventPrice: z.number().int().nullable(),
  goldPrice: z.number().int().nullable(),
  isFeatured: z.boolean(),
  isLimited: z.boolean(),
  isShopItem: z.boolean(),
  visualConfig: JsonValueSchema.nullable(),
  rarityId: z.string().nullable(),
})

export type Item = z.infer<typeof ItemSchema>

/////////////////////////////////////////
// INVENTORY ITEM SCHEMA
/////////////////////////////////////////

export const InventoryItemSchema = z.object({
  id: z.cuid(),
  userId: z.string(),
  itemId: z.string(),
  itemKey: z.string().nullable(),
  rarity: z.string(),
  power: z.number().int(),
  effectKey: z.string().nullable(),
  quantity: z.number().int(),
  equipped: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type InventoryItem = z.infer<typeof InventoryItemSchema>

/////////////////////////////////////////
// ITEM EFFECT SCHEMA
/////////////////////////////////////////

export const ItemEffectSchema = z.object({
  key: z.string(),
  name: z.string(),
  description: z.string(),
  type: z.string(),
  magnitude: z.number(),
  trigger: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type ItemEffect = z.infer<typeof ItemEffectSchema>

/////////////////////////////////////////
// FRIEND SCHEMA
/////////////////////////////////////////

export const FriendSchema = z.object({
  id: z.cuid(),
  userId: z.string(),
  friendId: z.string(),
  status: z.string(),
  createdAt: z.coerce.date(),
  acceptedAt: z.coerce.date().nullable(),
})

export type Friend = z.infer<typeof FriendSchema>

/////////////////////////////////////////
// REACTION SCHEMA
/////////////////////////////////////////

export const ReactionSchema = z.object({
  id: z.cuid(),
  userId: z.string(),
  targetType: z.string(),
  targetId: z.string(),
  emoji: z.string(),
  createdAt: z.coerce.date(),
})

export type Reaction = z.infer<typeof ReactionSchema>

/////////////////////////////////////////
// DUEL SCHEMA
/////////////////////////////////////////

export const DuelSchema = z.object({
  id: z.cuid(),
  initiatorId: z.string(),
  receiverId: z.string(),
  categoryId: z.string().nullable(),
  status: z.string(),
  initiatorScore: z.number().int(),
  receiverScore: z.number().int(),
  winnerId: z.string().nullable(),
  createdAt: z.coerce.date(),
  expiresAt: z.coerce.date().nullable(),
  completedAt: z.coerce.date().nullable(),
})

export type Duel = z.infer<typeof DuelSchema>

/////////////////////////////////////////
// CHALLENGE SCHEMA
/////////////////////////////////////////

export const ChallengeSchema = z.object({
  id: z.cuid(),
  initiatorId: z.string(),
  receiverId: z.string(),
  type: z.string(),
  categoryId: z.string().nullable(),
  status: z.string(),
  message: z.string().nullable(),
  createdAt: z.coerce.date(),
  respondedAt: z.coerce.date().nullable(),
  completedAt: z.coerce.date().nullable(),
  prompt: z.string().nullable(),
  response: z.string().nullable(),
  rewardKarma: z.number().int(),
  rewardXp: z.number().int(),
})

export type Challenge = z.infer<typeof ChallengeSchema>

/////////////////////////////////////////
// GLOBAL EVENT SCHEMA
/////////////////////////////////////////

export const GlobalEventSchema = z.object({
  id: z.cuid(),
  title: z.string(),
  description: z.string().nullable(),
  emoji: z.string().nullable(),
  type: z.string(),
  bonusType: z.string(),
  bonusValue: z.number().int(),
  targetScope: z.string().nullable(),
  startAt: z.coerce.date(),
  endAt: z.coerce.date(),
  active: z.boolean(),
  createdBy: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type GlobalEvent = z.infer<typeof GlobalEventSchema>

/////////////////////////////////////////
// WEEKLY CHALLENGE SCHEMA
/////////////////////////////////////////

export const WeeklyChallengeSchema = z.object({
  id: z.cuid(),
  weekNumber: z.number().int(),
  year: z.number().int(),
  type: z.string(),
  prompt: z.string(),
  dareVariant: z.string().nullable(),
  truthVariant: z.string().nullable(),
  generationSource: z.string(),
  trendingTopics: JsonValueSchema.nullable(),
  rewardXp: z.number().int(),
  rewardKarma: z.number().int(),
  participantCount: z.number().int(),
  status: z.string(),
  publishedAt: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
})

export type WeeklyChallenge = z.infer<typeof WeeklyChallengeSchema>

/////////////////////////////////////////
// WEEKLY CHALLENGE PARTICIPATION SCHEMA
/////////////////////////////////////////

export const WeeklyChallengeParticipationSchema = z.object({
  id: z.cuid(),
  userId: z.string(),
  challengeId: z.string(),
  response: z.string(),
  submitted: z.boolean(),
  submittedAt: z.coerce.date().nullable(),
  rewardXp: z.number().int(),
  rewardKarma: z.number().int(),
})

export type WeeklyChallengeParticipation = z.infer<typeof WeeklyChallengeParticipationSchema>

/////////////////////////////////////////
// USER INSIGHT SCHEMA
/////////////////////////////////////////

export const UserInsightSchema = z.object({
  id: z.cuid(),
  userId: z.string(),
  templateId: z.string(),
  title: z.string(),
  description: z.string(),
  emoji: z.string(),
  color: z.string(),
  metrics: JsonValueSchema,
  generatedAt: z.coerce.date(),
  expiresAt: z.coerce.date(),
})

export type UserInsight = z.infer<typeof UserInsightSchema>

/////////////////////////////////////////
// DAILY QUEST SCHEMA
/////////////////////////////////////////

export const DailyQuestSchema = z.object({
  id: z.cuid(),
  date: z.coerce.date(),
  type: z.string(),
  title: z.string(),
  objective: z.string(),
  targetCount: z.number().int(),
  rewardXp: z.number().int(),
  rewardGold: z.number().int(),
  rewardItem: z.string().nullable(),
  dropChance: z.number().int(),
  expiresAt: z.coerce.date(),
  createdAt: z.coerce.date(),
})

export type DailyQuest = z.infer<typeof DailyQuestSchema>

/////////////////////////////////////////
// QUEST COMPLETION SCHEMA
/////////////////////////////////////////

export const QuestCompletionSchema = z.object({
  id: z.cuid(),
  userId: z.string(),
  questId: z.string(),
  progress: z.number().int(),
  completed: z.boolean(),
  itemDropped: z.string().nullable(),
  completedAt: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
})

export type QuestCompletion = z.infer<typeof QuestCompletionSchema>

/////////////////////////////////////////
// MARKET LISTING SCHEMA
/////////////////////////////////////////

export const MarketListingSchema = z.object({
  id: z.cuid(),
  sellerId: z.string(),
  itemId: z.string(),
  price: z.number().int(),
  currencyKey: z.string(),
  status: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  buyerId: z.string().nullable(),
})

export type MarketListing = z.infer<typeof MarketListingSchema>

/////////////////////////////////////////
// GLOBAL POOL SCHEMA
/////////////////////////////////////////

export const GlobalPoolSchema = z.object({
  id: z.cuid(),
  poolType: z.string(),
  goldAmount: z.number().int(),
  diamondAmount: z.number().int(),
  updatedAt: z.coerce.date(),
})

export type GlobalPool = z.infer<typeof GlobalPoolSchema>

/////////////////////////////////////////
// CRAFTING RECIPE SCHEMA
/////////////////////////////////////////

export const CraftingRecipeSchema = z.object({
  id: z.cuid(),
  name: z.string(),
  description: z.string().nullable(),
  inputItemIds: z.string().array(),
  outputItemId: z.string(),
  goldCost: z.number().int(),
  requiresToken: z.boolean(),
  rarityBoost: z.number().int(),
  successRate: z.number().int(),
  craftingTime: z.number().int(),
  unlockLevel: z.number().int(),
  createdAt: z.coerce.date(),
})

export type CraftingRecipe = z.infer<typeof CraftingRecipeSchema>

/////////////////////////////////////////
// CRAFTING LOG SCHEMA
/////////////////////////////////////////

export const CraftingLogSchema = z.object({
  id: z.cuid(),
  userId: z.string(),
  recipeId: z.string().nullable(),
  inputItems: JsonValueSchema,
  outputItem: JsonValueSchema.nullable(),
  success: z.boolean(),
  goldSpent: z.number().int(),
  rarityAchieved: z.string().nullable(),
  statVariance: JsonValueSchema.nullable(),
  craftedAt: z.coerce.date(),
})

export type CraftingLog = z.infer<typeof CraftingLogSchema>

/////////////////////////////////////////
// DAILY QUIZ SCHEMA
/////////////////////////////////////////

export const DailyQuizSchema = z.object({
  id: z.cuid(),
  date: z.coerce.date(),
  questionIds: z.string().array(),
  rewardXp: z.number().int(),
  rewardHearts: z.number().int(),
  completions: z.number().int(),
  createdAt: z.coerce.date(),
})

export type DailyQuiz = z.infer<typeof DailyQuizSchema>

/////////////////////////////////////////
// DAILY QUIZ COMPLETION SCHEMA
/////////////////////////////////////////

export const DailyQuizCompletionSchema = z.object({
  id: z.cuid(),
  userId: z.string(),
  quizId: z.string(),
  score: z.number().int(),
  completedAt: z.coerce.date(),
})

export type DailyQuizCompletion = z.infer<typeof DailyQuizCompletionSchema>

/////////////////////////////////////////
// USER ENERGY SCHEMA
/////////////////////////////////////////

export const UserEnergySchema = z.object({
  id: z.cuid(),
  userId: z.string(),
  hearts: z.number().int(),
  maxHearts: z.number().int(),
  lastRegenAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type UserEnergy = z.infer<typeof UserEnergySchema>

/////////////////////////////////////////
// GLOBAL FEED ITEM SCHEMA
/////////////////////////////////////////

export const GlobalFeedItemSchema = z.object({
  id: z.cuid(),
  type: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  userId: z.string(),
  metadata: JsonValueSchema.nullable(),
  reactionsCount: z.number().int(),
  createdAt: z.coerce.date(),
})

export type GlobalFeedItem = z.infer<typeof GlobalFeedItemSchema>

/////////////////////////////////////////
// PROFILE THEME SCHEMA
/////////////////////////////////////////

export const ProfileThemeSchema = z.object({
  id: z.cuid(),
  userId: z.string(),
  themeId: z.string(),
  isActive: z.boolean(),
  unlockedAt: z.coerce.date(),
  rarityId: z.string().nullable(),
})

export type ProfileTheme = z.infer<typeof ProfileThemeSchema>

/////////////////////////////////////////
// WORLD CHRONICLE SCHEMA
/////////////////////////////////////////

export const WorldChronicleSchema = z.object({
  id: z.cuid(),
  seasonNumber: z.number().int(),
  seasonName: z.string(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  title: z.string(),
  summary: z.string(),
  fullChronicle: z.string(),
  totalPlayers: z.number().int(),
  totalXpEarned: z.bigint(),
  totalChallenges: z.number().int(),
  totalMessages: z.number().int(),
  topFaction: z.string().nullable(),
  topPlayer: z.string().nullable(),
  topGroup: z.string().nullable(),
  worldStateStart: JsonValueSchema.nullable(),
  worldStateEnd: JsonValueSchema.nullable(),
  generatedBy: z.string(),
  generatedAt: z.coerce.date().nullable(),
  isPublished: z.boolean(),
  publishedAt: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type WorldChronicle = z.infer<typeof WorldChronicleSchema>

/////////////////////////////////////////
// SEASON SUMMARY SCHEMA
/////////////////////////////////////////

export const SeasonSummarySchema = z.object({
  id: z.cuid(),
  chronicleId: z.string(),
  category: z.string(),
  title: z.string(),
  content: z.string(),
  highlights: JsonValueSchema.nullable(),
  stats: JsonValueSchema.nullable(),
  order: z.number().int(),
  createdAt: z.coerce.date(),
})

export type SeasonSummary = z.infer<typeof SeasonSummarySchema>

/////////////////////////////////////////
// PLAYER QUOTE SCHEMA
/////////////////////////////////////////

export const PlayerQuoteSchema = z.object({
  id: z.cuid(),
  chronicleId: z.string(),
  userId: z.string(),
  quote: z.string(),
  context: z.string().nullable(),
  sourceType: z.string().nullable(),
  sourceId: z.string().nullable(),
  isFeatured: z.boolean(),
  createdAt: z.coerce.date(),
})

export type PlayerQuote = z.infer<typeof PlayerQuoteSchema>

/////////////////////////////////////////
// NARRATIVE QUEST SCHEMA
/////////////////////////////////////////

export const NarrativeQuestSchema = z.object({
  id: z.cuid(),
  userId: z.string(),
  title: z.string(),
  intro: z.string(),
  context: JsonValueSchema.nullable(),
  generatedBy: z.string(),
  aiModel: z.string().nullable(),
  prompt: z.string().nullable(),
  status: z.string(),
  completedAt: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type NarrativeQuest = z.infer<typeof NarrativeQuestSchema>

/////////////////////////////////////////
// NARRATIVE CHOICE SCHEMA
/////////////////////////////////////////

export const NarrativeChoiceSchema = z.object({
  id: z.cuid(),
  questId: z.string(),
  step: z.number().int(),
  prompt: z.string(),
  option1: z.string(),
  option2: z.string(),
  option3: z.string().nullable(),
  option1Effect: JsonValueSchema.nullable(),
  option2Effect: JsonValueSchema.nullable(),
  option3Effect: JsonValueSchema.nullable(),
  selectedOption: z.number().int().nullable(),
  selectedAt: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
})

export type NarrativeChoice = z.infer<typeof NarrativeChoiceSchema>

/////////////////////////////////////////
// NARRATIVE OUTCOME SCHEMA
/////////////////////////////////////////

export const NarrativeOutcomeSchema = z.object({
  id: z.cuid(),
  questId: z.string(),
  conclusion: z.string(),
  karmaChange: z.number().int(),
  prestigeChange: z.number().int(),
  xpReward: z.number().int(),
  goldReward: z.number().int(),
  archetypeShift: JsonValueSchema.nullable(),
  itemsGranted: z.string().array(),
  createdAt: z.coerce.date(),
})

export type NarrativeOutcome = z.infer<typeof NarrativeOutcomeSchema>

/////////////////////////////////////////
// LORE ERA SCHEMA
/////////////////////////////////////////

export const LoreEraSchema = z.object({
  id: z.cuid(),
  name: z.string(),
  displayName: z.string(),
  description: z.string().nullable(),
  order: z.number().int(),
  startYear: z.number().int().nullable(),
  endYear: z.number().int().nullable(),
  isActive: z.boolean(),
  isCurrent: z.boolean(),
  icon: z.string().nullable(),
  color: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type LoreEra = z.infer<typeof LoreEraSchema>

/////////////////////////////////////////
// LORE ENTRY SCHEMA
/////////////////////////////////////////

export const LoreEntrySchema = z.object({
  id: z.cuid(),
  title: z.string(),
  slug: z.string(),
  summary: z.string(),
  content: z.string(),
  eraId: z.string().nullable(),
  author: z.string().nullable(),
  publishedAt: z.coerce.date().nullable(),
  category: z.string().nullable(),
  importance: z.number().int(),
  relatedFactions: z.string().array(),
  relatedEvents: z.string().array(),
  relatedCharacters: z.string().array(),
  isPublished: z.boolean(),
  isSecret: z.boolean(),
  viewCount: z.number().int(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type LoreEntry = z.infer<typeof LoreEntrySchema>

/////////////////////////////////////////
// LORE TAG SCHEMA
/////////////////////////////////////////

export const LoreTagSchema = z.object({
  id: z.cuid(),
  entryId: z.string(),
  tag: z.string(),
  createdAt: z.coerce.date(),
})

export type LoreTag = z.infer<typeof LoreTagSchema>

/////////////////////////////////////////
// USER TIME ZONE SCHEMA
/////////////////////////////////////////

export const UserTimeZoneSchema = z.object({
  id: z.cuid(),
  userId: z.string(),
  timezone: z.string(),
  utcOffset: z.number().int(),
  detectedFrom: z.string().nullable(),
  localMidnight: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type UserTimeZone = z.infer<typeof UserTimeZoneSchema>

/////////////////////////////////////////
// REGION SCHEDULE SCHEMA
/////////////////////////////////////////

export const RegionScheduleSchema = z.object({
  id: z.cuid(),
  region: z.string(),
  timezone: z.string(),
  dailyResetOffset: z.number().int(),
  quizResetOffset: z.number().int(),
  energyResetOffset: z.number().int(),
  nextDailyReset: z.coerce.date().nullable(),
  nextQuizReset: z.coerce.date().nullable(),
  nextEnergyReset: z.coerce.date().nullable(),
  updatedAt: z.coerce.date(),
})

export type RegionSchedule = z.infer<typeof RegionScheduleSchema>

/////////////////////////////////////////
// REGIONAL EVENT SCHEMA
/////////////////////////////////////////

export const RegionalEventSchema = z.object({
  id: z.cuid(),
  name: z.string(),
  description: z.string().nullable(),
  region: z.string(),
  country: z.string().nullable(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  timezone: z.string().nullable(),
  eventType: z.string(),
  theme: z.string().nullable(),
  rewardXp: z.number().int(),
  rewardGold: z.number().int(),
  rewardItems: JsonValueSchema.nullable(),
  isActive: z.boolean(),
  isRecurring: z.boolean(),
  recurrence: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type RegionalEvent = z.infer<typeof RegionalEventSchema>

/////////////////////////////////////////
// REGION CONFIG SCHEMA
/////////////////////////////////////////

export const RegionConfigSchema = z.object({
  id: z.cuid(),
  region: z.string(),
  timezone: z.string(),
  locale: z.string(),
  hasRegionalLeaderboard: z.boolean(),
  preferredThemes: JsonValueSchema.nullable(),
  displayName: z.string(),
  flagEmoji: z.string().nullable(),
  updatedAt: z.coerce.date(),
})

export type RegionConfig = z.infer<typeof RegionConfigSchema>

/////////////////////////////////////////
// CULTURAL ITEM SCHEMA
/////////////////////////////////////////

export const CulturalItemSchema = z.object({
  id: z.cuid(),
  itemId: z.string(),
  region: z.string(),
  culture: z.string().nullable(),
  eventType: z.string().nullable(),
  eventName: z.string().nullable(),
  isSeasonalOnly: z.boolean(),
  availableMonths: z.number().int().array(),
  createdAt: z.coerce.date(),
})

export type CulturalItem = z.infer<typeof CulturalItemSchema>

/////////////////////////////////////////
// LANGUAGE PREFERENCE SCHEMA
/////////////////////////////////////////

export const LanguagePreferenceSchema = z.object({
  id: z.cuid(),
  userId: z.string(),
  locale: z.string(),
  fallbackLocale: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type LanguagePreference = z.infer<typeof LanguagePreferenceSchema>

/////////////////////////////////////////
// TRANSLATION KEY SCHEMA
/////////////////////////////////////////

export const TranslationKeySchema = z.object({
  id: z.cuid(),
  key: z.string(),
  namespace: z.string().nullable(),
  en: z.string().nullable(),
  cs: z.string().nullable(),
  de: z.string().nullable(),
  fr: z.string().nullable(),
  es: z.string().nullable(),
  jp: z.string().nullable(),
  context: z.string().nullable(),
  isMissing: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type TranslationKey = z.infer<typeof TranslationKeySchema>

/////////////////////////////////////////
// ECONOMY STAT SCHEMA
/////////////////////////////////////////

export const EconomyStatSchema = z.object({
  id: z.cuid(),
  date: z.coerce.date(),
  totalGold: z.bigint(),
  totalDiamonds: z.bigint(),
  totalXp: z.bigint(),
  goldCreated: z.bigint(),
  goldDestroyed: z.bigint(),
  diamondsCreated: z.bigint(),
  diamondsDestroyed: z.bigint(),
  marketTransactions: z.number().int(),
  marketVolume: z.bigint(),
  craftingVolume: z.number().int(),
  inflationRate: z.number(),
  createdAt: z.coerce.date(),
})

export type EconomyStat = z.infer<typeof EconomyStatSchema>

/////////////////////////////////////////
// TREASURY SCHEMA
/////////////////////////////////////////

export const TreasurySchema = z.object({
  id: z.cuid(),
  gold: z.bigint(),
  diamonds: z.bigint(),
  taxCollected: z.bigint(),
  donationsReceived: z.bigint(),
  eventsSpent: z.bigint(),
  projectsSpent: z.bigint(),
  lifetimeCollected: z.bigint(),
  lifetimeSpent: z.bigint(),
  updatedAt: z.coerce.date(),
})

export type Treasury = z.infer<typeof TreasurySchema>

/////////////////////////////////////////
// DYNAMIC PRICE SCHEMA
/////////////////////////////////////////

export const DynamicPriceSchema = z.object({
  id: z.cuid(),
  itemId: z.string(),
  basePrice: z.number().int(),
  currentPrice: z.number().int(),
  demand: z.number(),
  supply: z.number(),
  purchaseVolume: z.number().int(),
  craftingVolume: z.number().int(),
  lastAdjustedAt: z.coerce.date().nullable(),
  priceHistory: JsonValueSchema.nullable(),
  updatedAt: z.coerce.date(),
})

export type DynamicPrice = z.infer<typeof DynamicPriceSchema>

/////////////////////////////////////////
// TAX TRANSACTION SCHEMA
/////////////////////////////////////////

export const TaxTransactionSchema = z.object({
  id: z.cuid(),
  sourceType: z.string(),
  sourceId: z.string().nullable(),
  amount: z.bigint(),
  taxAmount: z.bigint(),
  taxRate: z.number(),
  currency: z.string(),
  userId: z.string().nullable(),
  createdAt: z.coerce.date(),
})

export type TaxTransaction = z.infer<typeof TaxTransactionSchema>

/////////////////////////////////////////
// CREATOR WALLET SCHEMA
/////////////////////////////////////////

export const CreatorWalletSchema = z.object({
  id: z.cuid(),
  userId: z.string(),
  pendingBalance: z.number().int(),
  paidBalance: z.number().int(),
  totalEarned: z.number().int(),
  stripeAccountId: z.string().nullable(),
  lastPayoutAt: z.coerce.date().nullable(),
  nextPayoutAt: z.coerce.date().nullable(),
  isActive: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type CreatorWallet = z.infer<typeof CreatorWalletSchema>

/////////////////////////////////////////
// CREATOR TRANSACTION SCHEMA
/////////////////////////////////////////

export const CreatorTransactionSchema = z.object({
  id: z.cuid(),
  walletId: z.string(),
  type: z.string(),
  amount: z.number().int(),
  sourceType: z.string().nullable(),
  sourceId: z.string().nullable(),
  payoutPoolId: z.string().nullable(),
  stripeTransferId: z.string().nullable(),
  description: z.string().nullable(),
  metadata: JsonValueSchema.nullable(),
  createdAt: z.coerce.date(),
})

export type CreatorTransaction = z.infer<typeof CreatorTransactionSchema>

/////////////////////////////////////////
// PAYOUT POOL SCHEMA
/////////////////////////////////////////

export const PayoutPoolSchema = z.object({
  id: z.cuid(),
  weekStart: z.coerce.date(),
  weekEnd: z.coerce.date(),
  totalPool: z.number().int(),
  fromSubscriptions: z.number().int(),
  fromCosmetics: z.number().int(),
  fromDonations: z.number().int(),
  totalDistributed: z.number().int(),
  totalCreators: z.number().int(),
  status: z.string(),
  calculatedAt: z.coerce.date().nullable(),
  distributedAt: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
})

export type PayoutPool = z.infer<typeof PayoutPoolSchema>

/////////////////////////////////////////
// ENGAGEMENT METRIC SCHEMA
/////////////////////////////////////////

export const EngagementMetricSchema = z.object({
  id: z.cuid(),
  contentType: z.string(),
  contentId: z.string(),
  creatorId: z.string(),
  userId: z.string().nullable(),
  type: z.string(),
  value: z.number(),
  weekStart: z.coerce.date(),
  fingerprint: z.string().nullable(),
  createdAt: z.coerce.date(),
})

export type EngagementMetric = z.infer<typeof EngagementMetricSchema>

/////////////////////////////////////////
// SUBSCRIPTION PLAN SCHEMA
/////////////////////////////////////////

export const SubscriptionPlanSchema = z.object({
  id: z.cuid(),
  name: z.string(),
  displayName: z.string(),
  description: z.string().nullable(),
  price: z.number().int(),
  currency: z.string(),
  interval: z.string(),
  stripeProductId: z.string().nullable(),
  stripePriceId: z.string().nullable(),
  xpMultiplier: z.number(),
  features: JsonValueSchema,
  isActive: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type SubscriptionPlan = z.infer<typeof SubscriptionPlanSchema>

/////////////////////////////////////////
// USER SUBSCRIPTION SCHEMA
/////////////////////////////////////////

export const UserSubscriptionSchema = z.object({
  id: z.cuid(),
  userId: z.string(),
  planId: z.string(),
  stripeSubscriptionId: z.string().nullable(),
  stripeCustomerId: z.string().nullable(),
  status: z.string(),
  startedAt: z.coerce.date(),
  renewsAt: z.coerce.date().nullable(),
  cancelledAt: z.coerce.date().nullable(),
  expiresAt: z.coerce.date().nullable(),
  trialEndsAt: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type UserSubscription = z.infer<typeof UserSubscriptionSchema>

/////////////////////////////////////////
// PAYMENT LOG SCHEMA
/////////////////////////////////////////

export const PaymentLogSchema = z.object({
  id: z.cuid(),
  subscriptionId: z.string().nullable(),
  userId: z.string(),
  amount: z.number().int(),
  currency: z.string(),
  status: z.string(),
  stripePaymentIntentId: z.string().nullable(),
  stripeChargeId: z.string().nullable(),
  description: z.string().nullable(),
  metadata: JsonValueSchema.nullable(),
  failureReason: z.string().nullable(),
  refundedAt: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
})

export type PaymentLog = z.infer<typeof PaymentLogSchema>

/////////////////////////////////////////
// REPORT SCHEMA
/////////////////////////////////////////

export const ReportSchema = z.object({
  id: z.cuid(),
  reporterId: z.string(),
  reportedUserId: z.string().nullable(),
  contentType: z.string().nullable(),
  contentId: z.string().nullable(),
  reason: z.string(),
  description: z.string().nullable(),
  status: z.string(),
  priority: z.string(),
  resolvedBy: z.string().nullable(),
  resolvedAt: z.coerce.date().nullable(),
  resolution: z.string().nullable(),
  createdAt: z.coerce.date(),
})

export type Report = z.infer<typeof ReportSchema>

/////////////////////////////////////////
// REPUTATION SCORE SCHEMA
/////////////////////////////////////////

export const ReputationScoreSchema = z.object({
  id: z.cuid(),
  userId: z.string(),
  score: z.number(),
  reportsReceived: z.number().int(),
  reportsDismissed: z.number().int(),
  positiveReactions: z.number().int(),
  negativeReactions: z.number().int(),
  challengesCompleted: z.number().int(),
  helpfulVotes: z.number().int(),
  trustLevel: z.string(),
  isRestricted: z.boolean(),
  canMessage: z.boolean(),
  canChallenge: z.boolean(),
  canPost: z.boolean(),
  updatedAt: z.coerce.date(),
})

export type ReputationScore = z.infer<typeof ReputationScoreSchema>

/////////////////////////////////////////
// MODERATION ACTION SCHEMA
/////////////////////////////////////////

export const ModerationActionSchema = z.object({
  id: z.cuid(),
  userId: z.string(),
  moderatorId: z.string(),
  actionType: z.string(),
  reason: z.string(),
  duration: z.number().int().nullable(),
  reportId: z.string().nullable(),
  isActive: z.boolean(),
  expiresAt: z.coerce.date().nullable(),
  revokedAt: z.coerce.date().nullable(),
  revokedBy: z.string().nullable(),
  isPublic: z.boolean(),
  createdAt: z.coerce.date(),
})

export type ModerationAction = z.infer<typeof ModerationActionSchema>

/////////////////////////////////////////
// BLOCKED USER SCHEMA
/////////////////////////////////////////

export const BlockedUserSchema = z.object({
  id: z.cuid(),
  userId: z.string(),
  blockedUserId: z.string(),
  reason: z.string().nullable(),
  createdAt: z.coerce.date(),
})

export type BlockedUser = z.infer<typeof BlockedUserSchema>

/////////////////////////////////////////
// CONTENT REVIEW SCHEMA
/////////////////////////////////////////

export const ContentReviewSchema = z.object({
  id: z.cuid(),
  contentType: z.string(),
  contentId: z.string(),
  content: z.string(),
  flagged: z.boolean(),
  confidence: z.number().nullable(),
  categories: z.string().array(),
  reviewed: z.boolean(),
  reviewedBy: z.string().nullable(),
  reviewedAt: z.coerce.date().nullable(),
  approved: z.boolean().nullable(),
  createdAt: z.coerce.date(),
})

export type ContentReview = z.infer<typeof ContentReviewSchema>

/////////////////////////////////////////
// USER STREAK SCHEMA
/////////////////////////////////////////

export const UserStreakSchema = z.object({
  id: z.cuid(),
  userId: z.string(),
  currentStreak: z.number().int(),
  longestStreak: z.number().int(),
  lastLoginAt: z.coerce.date().nullable(),
  lastQuizAt: z.coerce.date().nullable(),
  lastDuelAt: z.coerce.date().nullable(),
  lastChallengeAt: z.coerce.date().nullable(),
  loginStreak: z.number().int(),
  quizStreak: z.number().int(),
  duelStreak: z.number().int(),
  totalDaysActive: z.number().int(),
  updatedAt: z.coerce.date(),
})

export type UserStreak = z.infer<typeof UserStreakSchema>

/////////////////////////////////////////
// REWARD CALENDAR SCHEMA
/////////////////////////////////////////

export const RewardCalendarSchema = z.object({
  id: z.cuid(),
  userId: z.string(),
  calendarType: z.string(),
  day: z.number().int(),
  rewardType: z.string(),
  rewardAmount: z.number().int().nullable(),
  rewardItemId: z.string().nullable(),
  claimed: z.boolean(),
  claimedAt: z.coerce.date().nullable(),
  cycleStart: z.coerce.date(),
  createdAt: z.coerce.date(),
})

export type RewardCalendar = z.infer<typeof RewardCalendarSchema>

/////////////////////////////////////////
// RETURN BONUS SCHEMA
/////////////////////////////////////////

export const ReturnBonusSchema = z.object({
  id: z.cuid(),
  userId: z.string(),
  inactiveDays: z.number().int(),
  xpBonus: z.number().int(),
  goldBonus: z.number().int(),
  diamondBonus: z.number().int(),
  granted: z.boolean(),
  grantedAt: z.coerce.date().nullable(),
  expiresAt: z.coerce.date(),
  createdAt: z.coerce.date(),
})

export type ReturnBonus = z.infer<typeof ReturnBonusSchema>

/////////////////////////////////////////
// FEEDBACK MOOD SCHEMA
/////////////////////////////////////////

export const FeedbackMoodSchema = z.object({
  id: z.cuid(),
  userId: z.string(),
  emoji: z.string(),
  rating: z.number().int(),
  context: z.string().nullable(),
  sessionId: z.string().nullable(),
  comment: z.string().nullable(),
  sentiment: z.number().nullable(),
  analyzed: z.boolean(),
  createdAt: z.coerce.date(),
})

export type FeedbackMood = z.infer<typeof FeedbackMoodSchema>

/////////////////////////////////////////
// DAILY SUMMARY SCHEMA
/////////////////////////////////////////

export const DailySummarySchema = z.object({
  id: z.cuid(),
  userId: z.string(),
  date: z.coerce.date(),
  questionsAnswered: z.number().int(),
  challengesSent: z.number().int(),
  challengesReceived: z.number().int(),
  xpEarned: z.number().int(),
  sessionCount: z.number().int(),
  totalSessionTime: z.number().int(),
  averageMood: z.number().nullable(),
  viewed: z.boolean(),
  viewedAt: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
})

export type DailySummary = z.infer<typeof DailySummarySchema>

/////////////////////////////////////////
// BETA INVITE SCHEMA
/////////////////////////////////////////

export const BetaInviteSchema = z.object({
  id: z.cuid(),
  code: z.string(),
  creatorId: z.string().nullable(),
  maxUses: z.number().int(),
  usedCount: z.number().int(),
  rewardsGranted: z.boolean(),
  isActive: z.boolean(),
  expiresAt: z.coerce.date().nullable(),
  source: z.string().nullable(),
  utmSource: z.string().nullable(),
  utmMedium: z.string().nullable(),
  utmCampaign: z.string().nullable(),
  createdAt: z.coerce.date(),
})

export type BetaInvite = z.infer<typeof BetaInviteSchema>

/////////////////////////////////////////
// REFERRAL SCHEMA
/////////////////////////////////////////

export const ReferralSchema = z.object({
  id: z.cuid(),
  referrerId: z.string(),
  referredId: z.string(),
  inviteId: z.string(),
  xpRewarded: z.number().int(),
  diamondsRewarded: z.number().int(),
  rewardsGranted: z.boolean(),
  status: z.string(),
  createdAt: z.coerce.date(),
  rewardedAt: z.coerce.date().nullable(),
})

export type Referral = z.infer<typeof ReferralSchema>

/////////////////////////////////////////
// BETA USER SCHEMA
/////////////////////////////////////////

export const BetaUserSchema = z.object({
  id: z.cuid(),
  userId: z.string(),
  inviteCode: z.string().nullable(),
  wave: z.number().int().nullable(),
  firstLoginAt: z.coerce.date().nullable(),
  lastActiveAt: z.coerce.date().nullable(),
  onboardingComplete: z.boolean(),
  referralsSent: z.number().int(),
  referralsAccepted: z.number().int(),
  joinedAt: z.coerce.date(),
})

export type BetaUser = z.infer<typeof BetaUserSchema>

/////////////////////////////////////////
// TELEMETRY EVENT SCHEMA
/////////////////////////////////////////

export const TelemetryEventSchema = z.object({
  id: z.cuid(),
  type: z.string(),
  page: z.string().nullable(),
  action: z.string().nullable(),
  duration: z.number().int().nullable(),
  metadata: JsonValueSchema.nullable(),
  userAgent: z.string().nullable(),
  platform: z.string().nullable(),
  sessionId: z.string().nullable(),
  userId: z.string().nullable(),
  anonymousId: z.string().nullable(),
  deviceType: z.string().nullable(),
  region: z.string().nullable(),
  createdAt: z.coerce.date(),
})

export type TelemetryEvent = z.infer<typeof TelemetryEventSchema>

/////////////////////////////////////////
// TELEMETRY AGGREGATE SCHEMA
/////////////////////////////////////////

export const TelemetryAggregateSchema = z.object({
  id: z.cuid(),
  date: z.coerce.date(),
  type: z.string(),
  count: z.number().int(),
  avgDuration: z.number().nullable(),
  p50Duration: z.number().nullable(),
  p95Duration: z.number().nullable(),
  p99Duration: z.number().nullable(),
  errorRate: z.number().nullable(),
  context: z.string().nullable(),
  metadata: JsonValueSchema.nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type TelemetryAggregate = z.infer<typeof TelemetryAggregateSchema>

/////////////////////////////////////////
// USER PREFERENCES SCHEMA
/////////////////////////////////////////

export const UserPreferencesSchema = z.object({
  id: z.cuid(),
  userId: z.string(),
  soundEnabled: z.boolean(),
  soundVolume: z.number(),
  levelUpSound: z.boolean(),
  purchaseSound: z.boolean(),
  challengeSound: z.boolean(),
  notificationSound: z.boolean(),
  ambientMusicEnabled: z.boolean(),
  ambientTheme: z.string().nullable(),
  animationsEnabled: z.boolean(),
  reducedMotion: z.boolean(),
  particleEffects: z.boolean(),
  backgroundAnimation: z.boolean(),
  transitionSpeed: z.string(),
  glowEffects: z.boolean(),
  shimmerEffects: z.boolean(),
  confettiEnabled: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type UserPreferences = z.infer<typeof UserPreferencesSchema>

/////////////////////////////////////////
// SOUND ASSET SCHEMA
/////////////////////////////////////////

export const SoundAssetSchema = z.object({
  id: z.cuid(),
  assetId: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  filePath: z.string(),
  fileSize: z.number().int().nullable(),
  duration: z.number().nullable(),
  category: z.string(),
  eventType: z.string(),
  defaultVolume: z.number(),
  loop: z.boolean(),
  isActive: z.boolean(),
  createdAt: z.coerce.date(),
})

export type SoundAsset = z.infer<typeof SoundAssetSchema>

/////////////////////////////////////////
// ONBOARDING PROGRESS SCHEMA
/////////////////////////////////////////

export const OnboardingProgressSchema = z.object({
  id: z.cuid(),
  userId: z.string(),
  sawWelcomeOverlay: z.boolean(),
  sawDashboard: z.boolean(),
  completedAnswer: z.boolean(),
  completedCompare: z.boolean(),
  completedChallenge: z.boolean(),
  completedTutorial: z.boolean(),
  tutorialStarted: z.boolean(),
  tutorialStep: z.number().int(),
  tutorialCompleted: z.boolean(),
  tutorialReward: z.boolean(),
  tooltipsSeen: z.string().array(),
  showTooltips: z.boolean(),
  skipOnboarding: z.boolean(),
  startedAt: z.coerce.date(),
  completedAt: z.coerce.date().nullable(),
  lastStepAt: z.coerce.date(),
})

export type OnboardingProgress = z.infer<typeof OnboardingProgressSchema>

/////////////////////////////////////////
// FEEDBACK SUBMISSION SCHEMA
/////////////////////////////////////////

export const FeedbackSubmissionSchema = z.object({
  id: z.cuid(),
  userId: z.string(),
  type: z.string(),
  category: z.string().nullable(),
  title: z.string(),
  description: z.string(),
  page: z.string().nullable(),
  userAgent: z.string().nullable(),
  screenshot: z.string().nullable(),
  priority: z.string(),
  status: z.string(),
  adminNotes: z.string().nullable(),
  respondedAt: z.coerce.date().nullable(),
  respondedBy: z.string().nullable(),
  submittedAt: z.coerce.date(),
})

export type FeedbackSubmission = z.infer<typeof FeedbackSubmissionSchema>

/////////////////////////////////////////
// ERROR LOG SCHEMA
/////////////////////////////////////////

export const ErrorLogSchema = z.object({
  id: z.cuid(),
  errorType: z.string(),
  message: z.string(),
  stack: z.string().nullable(),
  page: z.string().nullable(),
  userAgent: z.string().nullable(),
  userId: z.string().nullable(),
  sessionId: z.string().nullable(),
  buildId: z.string().nullable(),
  environment: z.string().nullable(),
  severity: z.string(),
  frequency: z.number().int(),
  firstSeen: z.coerce.date(),
  lastSeen: z.coerce.date(),
  status: z.string(),
  assignedTo: z.string().nullable(),
  metadata: JsonValueSchema.nullable(),
  resolved: z.boolean(),
  resolvedAt: z.coerce.date().nullable(),
  resolvedBy: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type ErrorLog = z.infer<typeof ErrorLogSchema>

/////////////////////////////////////////
// TOOLTIP DEFINITION SCHEMA
/////////////////////////////////////////

export const TooltipDefinitionSchema = z.object({
  id: z.cuid(),
  tooltipId: z.string(),
  title: z.string(),
  description: z.string(),
  icon: z.string().nullable(),
  page: z.string(),
  elementId: z.string().nullable(),
  position: z.string(),
  showOnce: z.boolean(),
  priority: z.number().int(),
  delayMs: z.number().int(),
  minLevel: z.number().int(),
  maxLevel: z.number().int(),
  requiresFlag: z.string().nullable(),
  isActive: z.boolean(),
  createdAt: z.coerce.date(),
})

export type TooltipDefinition = z.infer<typeof TooltipDefinitionSchema>

/////////////////////////////////////////
// WORLD CYCLE SCHEMA
/////////////////////////////////////////

export const WorldCycleSchema = z.object({
  id: z.cuid(),
  cycleNumber: z.number().int(),
  cycleName: z.string(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().nullable(),
  duration: z.number().int(),
  finalHope: z.number().nullable(),
  finalChaos: z.number().nullable(),
  finalCreativity: z.number().nullable(),
  finalKnowledge: z.number().nullable(),
  finalHarmony: z.number().nullable(),
  dominantForce: z.string().nullable(),
  totalPlayers: z.number().int(),
  totalXp: z.number().int(),
  threatsDefeated: z.number().int(),
  eventsCompleted: z.number().int(),
  topPlayerId: z.string().nullable(),
  topFactionId: z.string().nullable(),
  topClanId: z.string().nullable(),
  unlockedFactions: z.string().array(),
  unlockedResources: z.string().array(),
  unlockedEnvironments: z.string().array(),
  status: z.string(),
})

export type WorldCycle = z.infer<typeof WorldCycleSchema>

/////////////////////////////////////////
// LEGACY RECORD SCHEMA
/////////////////////////////////////////

export const LegacyRecordSchema = z.object({
  id: z.cuid(),
  cycleId: z.string(),
  userId: z.string(),
  finalLevel: z.number().int(),
  finalXp: z.number().int(),
  finalGold: z.number().int(),
  finalDiamonds: z.number().int(),
  finalPrestige: z.number().int(),
  finalKarma: z.number().int(),
  xpRank: z.number().int().nullable(),
  karmaRank: z.number().int().nullable(),
  prestigeRank: z.number().int().nullable(),
  achievements: z.string().array(),
  titles: z.string().array(),
  badges: z.string().array(),
  ascensionChoice: z.string(),
  playTime: z.number().int(),
  majorEvents: JsonValueSchema.nullable(),
  archivedAt: z.coerce.date(),
})

export type LegacyRecord = z.infer<typeof LegacyRecordSchema>

/////////////////////////////////////////
// USER LEGACY BONUS SCHEMA
/////////////////////////////////////////

export const UserLegacyBonusSchema = z.object({
  id: z.cuid(),
  userId: z.string(),
  bonusType: z.string(),
  prestigeCarry: z.number().int().nullable(),
  legacyTitle: z.string().nullable(),
  xpBoostPercent: z.number().nullable(),
  mutation: z.string().nullable(),
  artifactId: z.string().nullable(),
  artifactType: z.string().nullable(),
  earnedInCycle: z.number().int(),
  isActive: z.boolean(),
  createdAt: z.coerce.date(),
  expiresAt: z.coerce.date().nullable(),
})

export type UserLegacyBonus = z.infer<typeof UserLegacyBonusSchema>

/////////////////////////////////////////
// ABYSS PROGRESS SCHEMA
/////////////////////////////////////////

export const AbyssProgressSchema = z.object({
  id: z.cuid(),
  userId: z.string(),
  currentLayer: z.number().int(),
  maxLayer: z.number().int(),
  totalClears: z.number().int(),
  layerMultiplier: z.number(),
  abyssTokens: z.number().int(),
  abyssArtifacts: z.string().array(),
  isActive: z.boolean(),
  lastClear: z.coerce.date().nullable(),
})

export type AbyssProgress = z.infer<typeof AbyssProgressSchema>

/////////////////////////////////////////
// WORLD THREAT SCHEMA
/////////////////////////////////////////

export const WorldThreatSchema = z.object({
  id: z.cuid(),
  threatId: z.string(),
  name: z.string(),
  title: z.string(),
  description: z.string(),
  loreText: z.string().nullable(),
  avatar: z.string(),
  type: z.string(),
  difficulty: z.string(),
  maxHealth: z.number().int(),
  currentHealth: z.number().int(),
  defense: z.number().int(),
  threatLevel: z.number().int(),
  spawnedBy: z.string(),
  triggerMetrics: JsonValueSchema.nullable(),
  region: z.string().nullable(),
  controlledBy: z.string().nullable(),
  status: z.string(),
  totalDamage: z.number().int(),
  attackCount: z.number().int(),
  participantCount: z.number().int(),
  xpReward: z.number().int(),
  goldReward: z.number().int(),
  specialReward: JsonValueSchema.nullable(),
  spawnedAt: z.coerce.date(),
  expiresAt: z.coerce.date().nullable(),
  defeatedAt: z.coerce.date().nullable(),
  isPostedToFeed: z.boolean(),
})

export type WorldThreat = z.infer<typeof WorldThreatSchema>

/////////////////////////////////////////
// THREAT BATTLE SCHEMA
/////////////////////////////////////////

export const ThreatBattleSchema = z.object({
  id: z.cuid(),
  threatId: z.string(),
  userId: z.string().nullable(),
  factionId: z.string().nullable(),
  attackType: z.string(),
  damageDealt: z.number().int(),
  isCritical: z.boolean(),
  attackerLevel: z.number().int(),
  attackerPrestige: z.number().int(),
  randomFactor: z.number(),
  xpGained: z.number().int(),
  goldGained: z.number().int(),
  rewardClaimed: z.boolean(),
  attackedAt: z.coerce.date(),
})

export type ThreatBattle = z.infer<typeof ThreatBattleSchema>

/////////////////////////////////////////
// FACTION TERRITORY SCHEMA
/////////////////////////////////////////

export const FactionTerritorySchema = z.object({
  id: z.cuid(),
  territoryId: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  region: z.string(),
  mapPosition: JsonValueSchema.nullable(),
  controlledBy: z.string().nullable(),
  controlStrength: z.number().int(),
  xpBonus: z.number(),
  goldBonus: z.number(),
  resourceType: z.string().nullable(),
  isContested: z.boolean(),
  contestStarted: z.coerce.date().nullable(),
  lastCaptured: z.coerce.date().nullable(),
  captureCount: z.number().int(),
})

export type FactionTerritory = z.infer<typeof FactionTerritorySchema>

/////////////////////////////////////////
// TERRITORY CONTEST SCHEMA
/////////////////////////////////////////

export const TerritoryContestSchema = z.object({
  id: z.cuid(),
  territoryId: z.string(),
  attackerFaction: z.string(),
  defenderFaction: z.string().nullable(),
  attackerScore: z.number().int(),
  defenderScore: z.number().int(),
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
  status: z.string(),
  winnerId: z.string().nullable(),
  completedAt: z.coerce.date().nullable(),
})

export type TerritoryContest = z.infer<typeof TerritoryContestSchema>

/////////////////////////////////////////
// FACTION LEGACY SCHEMA
/////////////////////////////////////////

export const FactionLegacySchema = z.object({
  id: z.cuid(),
  factionId: z.string(),
  name: z.string(),
  title: z.string(),
  description: z.string(),
  color: z.string(),
  secondaryColor: z.string(),
  emblem: z.string(),
  pattern: z.string().nullable(),
  glowEffect: z.string().nullable(),
  moralAxis: z.string(),
  orderAxis: z.string(),
  philosophy: z.string(),
  xpBonus: z.number(),
  goldBonus: z.number(),
  karmaMultiplier: z.number(),
  specialAbility: z.string().nullable(),
  memberCount: z.number().int(),
  totalXp: z.number().int(),
  avgKarma: z.number(),
  avgPrestige: z.number(),
  hasCouncil: z.boolean(),
  councilSize: z.number().int(),
  votingPower: z.string(),
  lore: z.string().nullable(),
  motto: z.string().nullable(),
  isActive: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type FactionLegacy = z.infer<typeof FactionLegacySchema>

/////////////////////////////////////////
// FACTION MEMBER SCHEMA
/////////////////////////////////////////

export const FactionMemberSchema = z.object({
  id: z.cuid(),
  factionId: z.string(),
  userId: z.string(),
  role: z.string(),
  rank: z.number().int(),
  title: z.string().nullable(),
  xpContributed: z.number().int(),
  karmaContributed: z.number().int(),
  reputation: z.number().int(),
  loyaltyScore: z.number().int(),
  joinedAt: z.coerce.date(),
  lastActive: z.coerce.date(),
  canSwitchAt: z.coerce.date().nullable(),
  switchCount: z.number().int(),
})

export type FactionMember = z.infer<typeof FactionMemberSchema>

/////////////////////////////////////////
// FACTION CHANGE LOG SCHEMA
/////////////////////////////////////////

export const FactionChangeLogSchema = z.object({
  id: z.cuid(),
  userId: z.string(),
  fromFactionId: z.string().nullable(),
  toFactionId: z.string().nullable(),
  changeType: z.string(),
  reason: z.string().nullable(),
  penaltyType: z.string().nullable(),
  penaltyAmount: z.number().int().nullable(),
  questCompleted: z.boolean().nullable(),
  changedAt: z.coerce.date(),
})

export type FactionChangeLog = z.infer<typeof FactionChangeLogSchema>

/////////////////////////////////////////
// FACTION VOTE SCHEMA
/////////////////////////////////////////

export const FactionVoteSchema = z.object({
  id: z.cuid(),
  factionId: z.string(),
  userId: z.string(),
  voteType: z.string(),
  proposalId: z.string(),
  vote: z.string(),
  votingPower: z.number().int(),
  comment: z.string().nullable(),
  votedAt: z.coerce.date(),
})

export type FactionVote = z.infer<typeof FactionVoteSchema>

/////////////////////////////////////////
// FACTION PROPOSAL SCHEMA
/////////////////////////////////////////

export const FactionProposalSchema = z.object({
  id: z.cuid(),
  proposalId: z.string(),
  factionId: z.string().nullable(),
  title: z.string(),
  description: z.string(),
  proposalType: z.string(),
  status: z.string(),
  votesFor: z.number().int(),
  votesAgainst: z.number().int(),
  votesAbstain: z.number().int(),
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
  result: z.string().nullable(),
  executedAt: z.coerce.date().nullable(),
  createdBy: z.string(),
  createdAt: z.coerce.date(),
})

export type FactionProposal = z.infer<typeof FactionProposalSchema>

/////////////////////////////////////////
// MENTOR PROFILE SCHEMA
/////////////////////////////////////////

export const MentorProfileSchema = z.object({
  id: z.cuid(),
  userId: z.string(),
  mentorName: z.string(),
  mentorAvatar: z.string(),
  mentorTone: z.string(),
  preferredTopics: z.string().array(),
  communicationStyle: z.string(),
  reminderFrequency: z.string(),
  lastAnalyzedAt: z.coerce.date().nullable(),
  currentFocus: z.string().nullable(),
  growthAreas: z.string().array(),
  strengths: z.string().array(),
  isEnabled: z.boolean(),
  journalingEnabled: z.boolean(),
  reflectionPrompts: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type MentorProfile = z.infer<typeof MentorProfileSchema>

/////////////////////////////////////////
// MENTOR LOG SCHEMA
/////////////////////////////////////////

export const MentorLogSchema = z.object({
  id: z.cuid(),
  userId: z.string(),
  logType: z.string(),
  title: z.string(),
  message: z.string(),
  category: z.string().nullable(),
  timeframe: z.string().nullable(),
  metrics: JsonValueSchema.nullable(),
  suggestions: z.string().array(),
  flowLinks: z.string().array(),
  isRead: z.boolean(),
  readAt: z.coerce.date().nullable(),
  userRating: z.number().int().nullable(),
  createdAt: z.coerce.date(),
})

export type MentorLog = z.infer<typeof MentorLogSchema>

/////////////////////////////////////////
// INSIGHT PROMPT SCHEMA
/////////////////////////////////////////

export const InsightPromptSchema = z.object({
  id: z.cuid(),
  promptId: z.string(),
  category: z.string(),
  question: z.string(),
  subtext: z.string().nullable(),
  icon: z.string(),
  archetypes: z.string().array(),
  minLevel: z.number().int(),
  karmaRange: JsonValueSchema.nullable(),
  expectedWordCount: z.number().int().nullable(),
  tags: z.string().array(),
  isActive: z.boolean(),
  createdAt: z.coerce.date(),
})

export type InsightPrompt = z.infer<typeof InsightPromptSchema>

/////////////////////////////////////////
// REFLECTION ENTRY SCHEMA
/////////////////////////////////////////

export const ReflectionEntrySchema = z.object({
  id: z.cuid(),
  userId: z.string(),
  promptId: z.string().nullable(),
  title: z.string().nullable(),
  content: z.string(),
  mood: z.string().nullable(),
  aiInsights: z.string().nullable(),
  themes: z.string().array(),
  sentiment: z.string().nullable(),
  isPrivate: z.boolean(),
  createdAt: z.coerce.date(),
  localeCode: z.string().nullable(),
})

export type ReflectionEntry = z.infer<typeof ReflectionEntrySchema>

/////////////////////////////////////////
// WORLD STATE SCHEMA
/////////////////////////////////////////

export const WorldStateSchema = z.object({
  id: z.cuid(),
  timestamp: z.coerce.date(),
  hope: z.number(),
  chaos: z.number(),
  creativity: z.number(),
  knowledge: z.number(),
  harmony: z.number(),
  overallAlignment: z.string(),
  dominantForce: z.string().nullable(),
  totalPlayers: z.number().int(),
  activeEvents: z.number().int(),
  dayNumber: z.number().int(),
  hopeChange: z.number(),
  chaosChange: z.number(),
  creativityChange: z.number(),
  knowledgeChange: z.number(),
  harmonyChange: z.number(),
})

export type WorldState = z.infer<typeof WorldStateSchema>

/////////////////////////////////////////
// WORLD VARIABLE SCHEMA
/////////////////////////////////////////

export const WorldVariableSchema = z.object({
  id: z.cuid(),
  stateId: z.string(),
  variableName: z.string(),
  value: z.number(),
  category: z.string().nullable(),
})

export type WorldVariable = z.infer<typeof WorldVariableSchema>

/////////////////////////////////////////
// WORLD EVENT SCHEMA
/////////////////////////////////////////

export const WorldEventSchema = z.object({
  id: z.cuid(),
  eventId: z.string(),
  name: z.string(),
  description: z.string(),
  loreText: z.string().nullable(),
  triggerType: z.string(),
  triggerConditions: JsonValueSchema,
  variableImpacts: JsonValueSchema,
  duration: z.number().int().nullable(),
  status: z.string(),
  triggeredAt: z.coerce.date(),
  startsAt: z.coerce.date().nullable(),
  endsAt: z.coerce.date().nullable(),
  completedAt: z.coerce.date().nullable(),
  participantCount: z.number().int(),
  requiredActions: z.number().int().nullable(),
  currentProgress: z.number().int(),
  rewards: JsonValueSchema.nullable(),
  isPostedToFeed: z.boolean(),
})

export type WorldEvent = z.infer<typeof WorldEventSchema>

/////////////////////////////////////////
// WORLD CONTRIBUTION SCHEMA
/////////////////////////////////////////

export const WorldContributionSchema = z.object({
  id: z.cuid(),
  userId: z.string(),
  date: z.coerce.date(),
  hopePoints: z.number(),
  chaosPoints: z.number(),
  creativityPoints: z.number(),
  knowledgePoints: z.number(),
  harmonyPoints: z.number(),
  fromAnswers: z.number().int(),
  fromChallenges: z.number().int(),
  fromFlows: z.number().int(),
  fromSocialActions: z.number().int(),
})

export type WorldContribution = z.infer<typeof WorldContributionSchema>

/////////////////////////////////////////
// NPC PROFILE SCHEMA
/////////////////////////////////////////

export const NpcProfileSchema = z.object({
  archetypeAffinity: ArchetypeAffinitySchema,
  tone: NPCToneSchema,
  id: z.cuid(),
  npcId: z.string(),
  name: z.string(),
  title: z.string().nullable(),
  avatar: z.string(),
  bio: z.string().nullable(),
  portraitUrl: z.string().nullable(),
  personality: JsonValueSchema.nullable(),
  alignment: z.string().nullable(),
  karmaAffinity: z.number().int(),
  archetypeMatch: z.string().array(),
  greetings: JsonValueSchema.nullable(),
  farewells: JsonValueSchema.nullable(),
  quirks: z.string().array(),
  canGiveQuests: z.boolean(),
  canGiveRewards: z.boolean(),
  canGiveAdvice: z.boolean(),
  isActive: z.boolean(),
  appearanceRate: z.number(),
  minLevel: z.number().int(),
  backstory: z.string().nullable(),
  voice: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type NpcProfile = z.infer<typeof NpcProfileSchema>

/////////////////////////////////////////
// NPC INTERACTION SCHEMA
/////////////////////////////////////////

export const NpcInteractionSchema = z.object({
  id: z.cuid(),
  npcId: z.string(),
  userId: z.string(),
  interactionType: z.string(),
  userArchetype: z.string().nullable(),
  userKarma: z.number().int().nullable(),
  userPrestige: z.number().int().nullable(),
  npcMessage: z.string(),
  userResponse: z.string().nullable(),
  sentiment: z.string().nullable(),
  questOffered: z.string().nullable(),
  rewardGiven: JsonValueSchema.nullable(),
  adviceGiven: z.string().nullable(),
  duration: z.number().int().nullable(),
  createdAt: z.coerce.date(),
})

export type NpcInteraction = z.infer<typeof NpcInteractionSchema>

/////////////////////////////////////////
// NPC MEMORY SCHEMA
/////////////////////////////////////////

export const NpcMemorySchema = z.object({
  id: z.cuid(),
  npcId: z.string(),
  userId: z.string(),
  memoryType: z.string(),
  key: z.string(),
  value: JsonValueSchema,
  importance: z.number().int(),
  lastAccessed: z.coerce.date(),
  accessCount: z.number().int(),
  createdAt: z.coerce.date(),
  expiresAt: z.coerce.date().nullable(),
})

export type NpcMemory = z.infer<typeof NpcMemorySchema>

/////////////////////////////////////////
// NPC AFFINITY SCHEMA
/////////////////////////////////////////

export const NpcAffinitySchema = z.object({
  id: z.cuid(),
  userId: z.string(),
  npcId: z.string(),
  lastInteraction: z.coerce.date(),
  affinityScore: z.number(),
  note: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type NpcAffinity = z.infer<typeof NpcAffinitySchema>

/////////////////////////////////////////
// NPC DIALOGUE SCHEMA
/////////////////////////////////////////

export const NPCDialogueSchema = z.object({
  triggerType: DialogueTriggerTypeSchema,
  rarity: DialogueRaritySchema,
  id: z.cuid(),
  npcId: z.string(),
  text: z.string(),
  moodTag: z.string().nullable(),
  createdAt: z.coerce.date(),
})

export type NPCDialogue = z.infer<typeof NPCDialogueSchema>

/////////////////////////////////////////
// NPC DIALOGUE TREE SCHEMA
/////////////////////////////////////////

export const NpcDialogueTreeSchema = z.object({
  id: z.cuid(),
  npcId: z.string(),
  treeId: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  triggerType: z.string(),
  conditions: JsonValueSchema,
  nodes: JsonValueSchema,
  category: z.string().nullable(),
  priority: z.number().int(),
  isActive: z.boolean(),
  createdAt: z.coerce.date(),
})

export type NpcDialogueTree = z.infer<typeof NpcDialogueTreeSchema>

/////////////////////////////////////////
// REWARD OFFER SCHEMA
/////////////////////////////////////////

export const RewardOfferSchema = z.object({
  id: z.cuid(),
  offerId: z.string(),
  name: z.string(),
  description: z.string(),
  type: z.string(),
  partnerId: z.string().nullable(),
  partnerName: z.string(),
  partnerLogo: z.string().nullable(),
  minPrestige: z.number().int(),
  minLevel: z.number().int(),
  requiredBadges: z.string().array(),
  requiredTitles: z.string().array(),
  value: z.string(),
  rewardCode: z.string().nullable(),
  qrCodeUrl: z.string().nullable(),
  externalUrl: z.string().nullable(),
  totalStock: z.number().int().nullable(),
  remainingStock: z.number().int().nullable(),
  maxPerUser: z.number().int(),
  isActive: z.boolean(),
  startsAt: z.coerce.date().nullable(),
  expiresAt: z.coerce.date().nullable(),
  category: z.string().nullable(),
  imageUrl: z.string().nullable(),
  termsUrl: z.string().nullable(),
  nftEnabled: z.boolean(),
  nftContract: z.string().nullable(),
  nftMetadata: JsonValueSchema.nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type RewardOffer = z.infer<typeof RewardOfferSchema>

/////////////////////////////////////////
// REWARD REDEMPTION SCHEMA
/////////////////////////////////////////

export const RewardRedemptionSchema = z.object({
  id: z.cuid(),
  offerId: z.string(),
  userId: z.string(),
  redemptionCode: z.string(),
  qrCode: z.string().nullable(),
  status: z.string(),
  verificationCode: z.string().nullable(),
  verifiedAt: z.coerce.date().nullable(),
  verifiedBy: z.string().nullable(),
  redeemedAt: z.coerce.date().nullable(),
  expiresAt: z.coerce.date(),
  nftMinted: z.boolean(),
  nftTokenId: z.string().nullable(),
  nftTxHash: z.string().nullable(),
  metadata: JsonValueSchema.nullable(),
  notes: z.string().nullable(),
  createdAt: z.coerce.date(),
})

export type RewardRedemption = z.infer<typeof RewardRedemptionSchema>

/////////////////////////////////////////
// REWARD PROOF SCHEMA
/////////////////////////////////////////

export const RewardProofSchema = z.object({
  id: z.cuid(),
  redemptionId: z.string(),
  proofType: z.string(),
  proofData: JsonValueSchema,
  uploadedAt: z.coerce.date(),
  verifiedAt: z.coerce.date().nullable(),
  isVerified: z.boolean(),
})

export type RewardProof = z.infer<typeof RewardProofSchema>

/////////////////////////////////////////
// PARTNER APP SCHEMA
/////////////////////////////////////////

export const PartnerAppSchema = z.object({
  id: z.cuid(),
  name: z.string(),
  description: z.string().nullable(),
  website: z.string().nullable(),
  contactEmail: z.string(),
  clientId: z.string(),
  clientSecret: z.string(),
  status: z.string(),
  tier: z.string(),
  rateLimit: z.number().int(),
  dailyLimit: z.number().int(),
  webhookUrl: z.string().nullable(),
  webhookSecret: z.string().nullable(),
  webhookEvents: z.string().array(),
  canEmbed: z.boolean(),
  canAccessData: z.boolean(),
  canCreateContent: z.boolean(),
  logoUrl: z.string().nullable(),
  industry: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  lastUsedAt: z.coerce.date().nullable(),
})

export type PartnerApp = z.infer<typeof PartnerAppSchema>

/////////////////////////////////////////
// PARTNER API KEY SCHEMA
/////////////////////////////////////////

export const PartnerApiKeySchema = z.object({
  id: z.cuid(),
  partnerId: z.string(),
  keyHash: z.string(),
  keyPreview: z.string(),
  name: z.string().nullable(),
  scopes: z.string().array(),
  isActive: z.boolean(),
  expiresAt: z.coerce.date().nullable(),
  lastUsedAt: z.coerce.date().nullable(),
  usageCount: z.number().int(),
  createdAt: z.coerce.date(),
  revokedAt: z.coerce.date().nullable(),
})

export type PartnerApiKey = z.infer<typeof PartnerApiKeySchema>

/////////////////////////////////////////
// PARTNER STATS SCHEMA
/////////////////////////////////////////

export const PartnerStatsSchema = z.object({
  id: z.cuid(),
  partnerId: z.string(),
  date: z.coerce.date(),
  totalRequests: z.number().int(),
  successRequests: z.number().int(),
  failedRequests: z.number().int(),
  rateLimitHits: z.number().int(),
  embedViews: z.number().int(),
  embedClicks: z.number().int(),
  embedResponses: z.number().int(),
  questionsServed: z.number().int(),
  answersReceived: z.number().int(),
  uniqueUsers: z.number().int(),
  avgResponseTime: z.number().nullable(),
  errorRate: z.number().nullable(),
})

export type PartnerStats = z.infer<typeof PartnerStatsSchema>

/////////////////////////////////////////
// PARTNER WEBHOOK SCHEMA
/////////////////////////////////////////

export const PartnerWebhookSchema = z.object({
  id: z.cuid(),
  partnerId: z.string(),
  eventType: z.string(),
  payload: JsonValueSchema,
  signature: z.string(),
  status: z.string(),
  attempts: z.number().int(),
  maxAttempts: z.number().int(),
  deliveredAt: z.coerce.date().nullable(),
  failedAt: z.coerce.date().nullable(),
  error: z.string().nullable(),
  nextRetryAt: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
})

export type PartnerWebhook = z.infer<typeof PartnerWebhookSchema>

/////////////////////////////////////////
// PUSH SUBSCRIPTION SCHEMA
/////////////////////////////////////////

export const PushSubscriptionSchema = z.object({
  id: z.cuid(),
  userId: z.string(),
  endpoint: z.string(),
  keys: JsonValueSchema,
  userAgent: z.string().nullable(),
  deviceType: z.string().nullable(),
  isEnabled: z.boolean(),
  createdAt: z.coerce.date(),
  lastUsed: z.coerce.date(),
})

export type PushSubscription = z.infer<typeof PushSubscriptionSchema>

/////////////////////////////////////////
// OFFLINE ACTION SCHEMA
/////////////////////////////////////////

export const OfflineActionSchema = z.object({
  id: z.cuid(),
  userId: z.string(),
  actionType: z.string(),
  payload: JsonValueSchema,
  status: z.string(),
  retryCount: z.number().int(),
  createdAt: z.coerce.date(),
  syncedAt: z.coerce.date().nullable(),
  error: z.string().nullable(),
})

export type OfflineAction = z.infer<typeof OfflineActionSchema>

/////////////////////////////////////////
// PWA METRICS SCHEMA
/////////////////////////////////////////

export const PWAMetricsSchema = z.object({
  id: z.cuid(),
  date: z.coerce.date(),
  installCount: z.number().int(),
  uninstallCount: z.number().int(),
  activeInstalls: z.number().int(),
  mobileUsers: z.number().int(),
  tabletUsers: z.number().int(),
  desktopUsers: z.number().int(),
  pushSent: z.number().int(),
  pushDelivered: z.number().int(),
  pushClicked: z.number().int(),
  offlineActions: z.number().int(),
  syncedActions: z.number().int(),
  failedActions: z.number().int(),
  avgLoadTime: z.number().nullable(),
  cacheHitRate: z.number().nullable(),
})

export type PWAMetrics = z.infer<typeof PWAMetricsSchema>

/////////////////////////////////////////
// MINI EVENT SCHEMA
/////////////////////////////////////////

export const MiniEventSchema = z.object({
  id: z.cuid(),
  eventId: z.string(),
  name: z.string(),
  description: z.string(),
  icon: z.string(),
  eventType: z.string(),
  goalType: z.string(),
  targetCount: z.number().int(),
  currentProgress: z.number().int(),
  duration: z.number().int(),
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
  rewards: JsonValueSchema,
  status: z.string(),
  participantCount: z.number().int(),
  isSuccessful: z.boolean().nullable(),
  completedAt: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
})

export type MiniEvent = z.infer<typeof MiniEventSchema>

/////////////////////////////////////////
// MINI EVENT PROGRESS SCHEMA
/////////////////////////////////////////

export const MiniEventProgressSchema = z.object({
  id: z.cuid(),
  eventId: z.string(),
  userId: z.string(),
  contribution: z.number().int(),
  lastUpdate: z.coerce.date(),
  rewardsClaimed: z.boolean(),
  claimedAt: z.coerce.date().nullable(),
})

export type MiniEventProgress = z.infer<typeof MiniEventProgressSchema>

/////////////////////////////////////////
// MINI EVENT REWARD SCHEMA
/////////////////////////////////////////

export const MiniEventRewardSchema = z.object({
  id: z.cuid(),
  eventId: z.string(),
  userId: z.string(),
  rewardType: z.string(),
  rewardId: z.string().nullable(),
  amount: z.number().int().nullable(),
  description: z.string(),
  awardedAt: z.coerce.date(),
})

export type MiniEventReward = z.infer<typeof MiniEventRewardSchema>

/////////////////////////////////////////
// CREATOR PROFILE SCHEMA
/////////////////////////////////////////

export const CreatorProfileSchema = z.object({
  id: z.cuid(),
  userId: z.string(),
  displayName: z.string(),
  bio: z.string().nullable(),
  avatar: z.string().nullable(),
  bannerImage: z.string().nullable(),
  isVerified: z.boolean(),
  badge: z.string(),
  tier: z.string(),
  totalFlows: z.number().int(),
  totalEngagement: z.number().int(),
  totalEarnings: z.number().int(),
  followerCount: z.number().int(),
  revenueShare: z.number(),
  goldPerPlay: z.number().int(),
  isActive: z.boolean(),
  allowComments: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type CreatorProfile = z.infer<typeof CreatorProfileSchema>

/////////////////////////////////////////
// CREATOR FLOW SCHEMA
/////////////////////////////////////////

export const CreatorFlowSchema = z.object({
  id: z.cuid(),
  creatorId: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  coverImage: z.string().nullable(),
  difficulty: z.string(),
  category: z.string(),
  tags: z.string().array(),
  questions: JsonValueSchema,
  questionCount: z.number().int(),
  status: z.string(),
  approvedBy: z.string().nullable(),
  approvedAt: z.coerce.date().nullable(),
  publishedAt: z.coerce.date().nullable(),
  rejectionReason: z.string().nullable(),
  playCount: z.number().int(),
  completionCount: z.number().int(),
  avgRating: z.number().nullable(),
  ratingCount: z.number().int(),
  xpReward: z.number().int(),
  goldReward: z.number().int(),
  isFeatured: z.boolean(),
  isPremium: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type CreatorFlow = z.infer<typeof CreatorFlowSchema>

/////////////////////////////////////////
// CREATOR FOLLOWER SCHEMA
/////////////////////////////////////////

export const CreatorFollowerSchema = z.object({
  id: z.cuid(),
  creatorId: z.string(),
  userId: z.string(),
  followedAt: z.coerce.date(),
})

export type CreatorFollower = z.infer<typeof CreatorFollowerSchema>

/////////////////////////////////////////
// CREATOR REWARD SCHEMA
/////////////////////////////////////////

export const CreatorRewardSchema = z.object({
  id: z.cuid(),
  creatorId: z.string(),
  flowId: z.string().nullable(),
  type: z.string(),
  amount: z.number().int(),
  source: z.string(),
  description: z.string(),
  earnedAt: z.coerce.date(),
})

export type CreatorReward = z.infer<typeof CreatorRewardSchema>

/////////////////////////////////////////
// CLAN SCHEMA
/////////////////////////////////////////

export const ClanSchema = z.object({
  id: z.cuid(),
  name: z.string(),
  tag: z.string(),
  description: z.string().nullable(),
  emblem: z.string(),
  color: z.string(),
  leaderId: z.string(),
  totalXp: z.number().int(),
  weeklyXp: z.number().int(),
  clanGold: z.number().int(),
  level: z.number().int(),
  memberCount: z.number().int(),
  maxMembers: z.number().int(),
  isPublic: z.boolean(),
  requireApproval: z.boolean(),
  minLevel: z.number().int(),
  lastXpReset: z.coerce.date(),
  totalChestsEarned: z.number().int(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type Clan = z.infer<typeof ClanSchema>

/////////////////////////////////////////
// CLAN MEMBER SCHEMA
/////////////////////////////////////////

export const ClanMemberSchema = z.object({
  id: z.cuid(),
  clanId: z.string(),
  userId: z.string(),
  role: z.string(),
  xpContributed: z.number().int(),
  weeklyXpContributed: z.number().int(),
  goldContributed: z.number().int(),
  rank: z.number().int(),
  title: z.string().nullable(),
  joinedAt: z.coerce.date(),
  lastActive: z.coerce.date(),
})

export type ClanMember = z.infer<typeof ClanMemberSchema>

/////////////////////////////////////////
// CLAN UPGRADE SCHEMA
/////////////////////////////////////////

export const ClanUpgradeSchema = z.object({
  id: z.cuid(),
  clanId: z.string(),
  upgradeType: z.string(),
  name: z.string(),
  level: z.number().int(),
  maxLevel: z.number().int(),
  boostAmount: z.number().nullable(),
  duration: z.number().int().nullable(),
  purchasedAt: z.coerce.date(),
  expiresAt: z.coerce.date().nullable(),
})

export type ClanUpgrade = z.infer<typeof ClanUpgradeSchema>

/////////////////////////////////////////
// CLAN ACTIVITY SCHEMA
/////////////////////////////////////////

export const ClanActivitySchema = z.object({
  id: z.cuid(),
  clanId: z.string(),
  activityType: z.string(),
  userId: z.string().nullable(),
  message: z.string(),
  metadata: JsonValueSchema.nullable(),
  createdAt: z.coerce.date(),
})

export type ClanActivity = z.infer<typeof ClanActivitySchema>

/////////////////////////////////////////
// SYSTEM METRIC SCHEMA
/////////////////////////////////////////

export const SystemMetricSchema = z.object({
  id: z.cuid(),
  metricType: z.string(),
  name: z.string(),
  value: z.number(),
  unit: z.string(),
  endpoint: z.string().nullable(),
  timestamp: z.coerce.date(),
})

export type SystemMetric = z.infer<typeof SystemMetricSchema>

/////////////////////////////////////////
// HEALTH LOG SCHEMA
/////////////////////////////////////////

export const HealthLogSchema = z.object({
  id: z.cuid(),
  checkType: z.string(),
  status: z.string(),
  message: z.string().nullable(),
  responseTime: z.number().nullable(),
  metadata: JsonValueSchema.nullable(),
  checkedAt: z.coerce.date(),
})

export type HealthLog = z.infer<typeof HealthLogSchema>

/////////////////////////////////////////
// AUTO HEAL LOG SCHEMA
/////////////////////////////////////////

export const AutoHealLogSchema = z.object({
  id: z.cuid(),
  healType: z.string(),
  description: z.string(),
  itemsAffected: z.number().int(),
  success: z.boolean(),
  error: z.string().nullable(),
  executedAt: z.coerce.date(),
})

export type AutoHealLog = z.infer<typeof AutoHealLogSchema>

/////////////////////////////////////////
// CRON JOB LOG SCHEMA
/////////////////////////////////////////

export const CronJobLogSchema = z.object({
  status: CronJobStatusSchema,
  id: z.cuid(),
  jobKey: z.string(),
  startedAt: z.coerce.date(),
  finishedAt: z.coerce.date().nullable(),
  durationMs: z.number().int().nullable(),
  errorMessage: z.string().nullable(),
})

export type CronJobLog = z.infer<typeof CronJobLogSchema>

/////////////////////////////////////////
// ERROR ALERT SCHEMA
/////////////////////////////////////////

export const ErrorAlertSchema = z.object({
  id: z.cuid(),
  severity: z.string(),
  source: z.string(),
  message: z.string(),
  stackTrace: z.string().nullable(),
  metadata: JsonValueSchema.nullable(),
  notifiedAt: z.coerce.date().nullable(),
  resolvedAt: z.coerce.date().nullable(),
  isResolved: z.boolean(),
  createdAt: z.coerce.date(),
})

export type ErrorAlert = z.infer<typeof ErrorAlertSchema>

/////////////////////////////////////////
// JOB QUEUE SCHEMA
/////////////////////////////////////////

export const JobQueueSchema = z.object({
  id: z.cuid(),
  queueName: z.string(),
  displayName: z.string(),
  description: z.string().nullable(),
  priority: z.number().int(),
  concurrency: z.number().int(),
  maxRetries: z.number().int(),
  backoffStrategy: z.string(),
  backoffDelay: z.number().int(),
  isEnabled: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type JobQueue = z.infer<typeof JobQueueSchema>

/////////////////////////////////////////
// JOB QUEUE METRICS SCHEMA
/////////////////////////////////////////

export const JobQueueMetricsSchema = z.object({
  id: z.cuid(),
  queueName: z.string(),
  date: z.coerce.date(),
  processed: z.number().int(),
  completed: z.number().int(),
  failed: z.number().int(),
  retried: z.number().int(),
  stalled: z.number().int(),
  avgProcessTime: z.number().nullable(),
  maxProcessTime: z.number().nullable(),
  minProcessTime: z.number().nullable(),
  processedPerSec: z.number().nullable(),
  failureRate: z.number().nullable(),
})

export type JobQueueMetrics = z.infer<typeof JobQueueMetricsSchema>

/////////////////////////////////////////
// JOB FAILURE SCHEMA
/////////////////////////////////////////

export const JobFailureSchema = z.object({
  id: z.cuid(),
  queueName: z.string(),
  jobId: z.string(),
  jobName: z.string(),
  payload: JsonValueSchema.nullable(),
  error: z.string(),
  stackTrace: z.string().nullable(),
  attempts: z.number().int(),
  maxRetries: z.number().int(),
  willRetry: z.boolean(),
  nextRetryAt: z.coerce.date().nullable(),
  failedAt: z.coerce.date(),
  resolvedAt: z.coerce.date().nullable(),
  isResolved: z.boolean(),
})

export type JobFailure = z.infer<typeof JobFailureSchema>

/////////////////////////////////////////
// CACHE CONFIG SCHEMA
/////////////////////////////////////////

export const CacheConfigSchema = z.object({
  id: z.cuid(),
  key: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  ttlSeconds: z.number().int(),
  isEnabled: z.boolean(),
  strategy: z.string(),
  invalidateOn: z.string().array(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type CacheConfig = z.infer<typeof CacheConfigSchema>

/////////////////////////////////////////
// CACHE METRICS SCHEMA
/////////////////////////////////////////

export const CacheMetricsSchema = z.object({
  id: z.cuid(),
  cacheKey: z.string(),
  endpoint: z.string(),
  hitCount: z.number().int(),
  missCount: z.number().int(),
  avgHitTime: z.number().nullable(),
  avgMissTime: z.number().nullable(),
  lastHitAt: z.coerce.date().nullable(),
  lastMissAt: z.coerce.date().nullable(),
  date: z.coerce.date(),
})

export type CacheMetrics = z.infer<typeof CacheMetricsSchema>

/////////////////////////////////////////
// ACHIEVEMENT COLLECTION SCHEMA
/////////////////////////////////////////

export const AchievementCollectionSchema = z.object({
  id: z.cuid(),
  collectionId: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  theme: z.string(),
  icon: z.string().nullable(),
  rarity: z.string(),
  titleReward: z.string().nullable(),
  xpReward: z.number().int(),
  goldReward: z.number().int(),
  diamondReward: z.number().int(),
  auraUnlock: z.string().nullable(),
  themeUnlock: z.string().nullable(),
  isSeasonal: z.boolean(),
  seasonType: z.string().nullable(),
  isEvent: z.boolean(),
  eventId: z.string().nullable(),
  availableFrom: z.coerce.date().nullable(),
  availableUntil: z.coerce.date().nullable(),
  isActive: z.boolean(),
  createdAt: z.coerce.date(),
})

export type AchievementCollection = z.infer<typeof AchievementCollectionSchema>

/////////////////////////////////////////
// ACHIEVEMENT COLLECTION MEMBER SCHEMA
/////////////////////////////////////////

export const AchievementCollectionMemberSchema = z.object({
  id: z.cuid(),
  collectionId: z.string(),
  achievementId: z.string(),
  sortOrder: z.number().int(),
})

export type AchievementCollectionMember = z.infer<typeof AchievementCollectionMemberSchema>

/////////////////////////////////////////
// USER ACHIEVEMENT COLLECTION SCHEMA
/////////////////////////////////////////

export const UserAchievementCollectionSchema = z.object({
  id: z.cuid(),
  userId: z.string(),
  collectionId: z.string(),
  progress: z.number().int(),
  totalRequired: z.number().int(),
  isCompleted: z.boolean(),
  completedAt: z.coerce.date().nullable(),
  rewardClaimed: z.boolean(),
  claimedAt: z.coerce.date().nullable(),
})

export type UserAchievementCollection = z.infer<typeof UserAchievementCollectionSchema>

/////////////////////////////////////////
// THEME PACK SCHEMA
/////////////////////////////////////////

export const ThemePackSchema = z.object({
  id: z.cuid(),
  themeId: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  type: z.string(),
  rarity: z.string(),
  isSeasonal: z.boolean(),
  seasonType: z.string().nullable(),
  gradientConfig: JsonValueSchema,
  particleConfig: JsonValueSchema.nullable(),
  animationConfig: JsonValueSchema.nullable(),
  unlockLevel: z.number().int(),
  unlockCondition: z.string().nullable(),
  goldCost: z.number().int().nullable(),
  diamondCost: z.number().int().nullable(),
  vipOnly: z.boolean(),
  isActive: z.boolean(),
  availableFrom: z.coerce.date().nullable(),
  availableUntil: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
})

export type ThemePack = z.infer<typeof ThemePackSchema>

/////////////////////////////////////////
// USER THEME SETTINGS SCHEMA
/////////////////////////////////////////

export const UserThemeSettingsSchema = z.object({
  id: z.cuid(),
  userId: z.string(),
  autoSeasonalTheme: z.boolean(),
  preferredThemeId: z.string().nullable(),
  lastAutoSwitchAt: z.coerce.date().nullable(),
})

export type UserThemeSettings = z.infer<typeof UserThemeSettingsSchema>

/////////////////////////////////////////
// ARCHETYPE SCHEMA
/////////////////////////////////////////

export const ArchetypeSchema = z.object({
  key: z.string(),
  name: z.string(),
  description: z.string(),
  baseStats: JsonValueSchema,
  growthRates: JsonValueSchema,
  emoji: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  fusionWith: z.string().array(),
  fusionResult: z.string().nullable(),
  fusionCost: z.number().int(),
  fusionVisual: JsonValueSchema.nullable(),
})

export type Archetype = z.infer<typeof ArchetypeSchema>

/////////////////////////////////////////
// USER ARCHETYPE FUSION SCHEMA
/////////////////////////////////////////

export const UserArchetypeFusionSchema = z.object({
  id: z.cuid(),
  userId: z.string(),
  baseA: z.string(),
  baseB: z.string(),
  result: z.string(),
  createdAt: z.coerce.date(),
})

export type UserArchetypeFusion = z.infer<typeof UserArchetypeFusionSchema>

/////////////////////////////////////////
// USER ARCHETYPE HISTORY SCHEMA
/////////////////////////////////////////

export const UserArchetypeHistorySchema = z.object({
  id: z.cuid(),
  userId: z.string(),
  previousType: z.string().nullable(),
  newType: z.string(),
  reason: z.string(),
  statSnapshot: JsonValueSchema.nullable(),
  xpBonus: z.number().int(),
  evolvedAt: z.coerce.date(),
})

export type UserArchetypeHistory = z.infer<typeof UserArchetypeHistorySchema>

/////////////////////////////////////////
// AVATAR LAYER SCHEMA
/////////////////////////////////////////

export const AvatarLayerSchema = z.object({
  id: z.cuid(),
  layerType: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  rarity: z.string(),
  unlockLevel: z.number().int(),
  unlockCondition: z.string().nullable(),
  goldCost: z.number().int().nullable(),
  diamondCost: z.number().int().nullable(),
  imageUrl: z.string().nullable(),
  zIndex: z.number().int(),
  createdAt: z.coerce.date(),
})

export type AvatarLayer = z.infer<typeof AvatarLayerSchema>

/////////////////////////////////////////
// USER AVATAR ITEM SCHEMA
/////////////////////////////////////////

export const UserAvatarItemSchema = z.object({
  id: z.cuid(),
  userId: z.string(),
  layerId: z.string(),
  unlockedAt: z.coerce.date(),
})

export type UserAvatarItem = z.infer<typeof UserAvatarItemSchema>

/////////////////////////////////////////
// USER AVATAR SCHEMA
/////////////////////////////////////////

export const UserAvatarSchema = z.object({
  id: z.cuid(),
  userId: z.string(),
  equippedLayers: JsonValueSchema,
  presetName: z.string().nullable(),
  updatedAt: z.coerce.date(),
})

export type UserAvatar = z.infer<typeof UserAvatarSchema>

/////////////////////////////////////////
// DUEL SPECTATOR SCHEMA
/////////////////////////////////////////

export const DuelSpectatorSchema = z.object({
  id: z.cuid(),
  duelId: z.string(),
  userId: z.string(),
  joinedAt: z.coerce.date(),
  reactedAt: z.coerce.date().nullable(),
})

export type DuelSpectator = z.infer<typeof DuelSpectatorSchema>

/////////////////////////////////////////
// DUEL HIGHLIGHT SCHEMA
/////////////////////////////////////////

export const DuelHighlightSchema = z.object({
  id: z.cuid(),
  duelId: z.string(),
  initiatorName: z.string(),
  receiverName: z.string(),
  scoreDiff: z.number().int(),
  finalScore: z.string(),
  category: z.string().nullable(),
  isTopOfDay: z.boolean(),
  viewCount: z.number().int(),
  reactionsCount: z.number().int(),
  createdAt: z.coerce.date(),
})

export type DuelHighlight = z.infer<typeof DuelHighlightSchema>

/////////////////////////////////////////
// COOP MISSION SCHEMA
/////////////////////////////////////////

export const CoopMissionSchema = z.object({
  id: z.cuid(),
  type: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  questionIds: z.string().array(),
  minMembers: z.number().int(),
  maxMembers: z.number().int(),
  rewardXp: z.number().int(),
  rewardGold: z.number().int(),
  timeLimit: z.number().int(),
  requiresSync: z.boolean(),
  status: z.string(),
  createdBy: z.string(),
  startedAt: z.coerce.date().nullable(),
  completedAt: z.coerce.date().nullable(),
  expiresAt: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
})

export type CoopMission = z.infer<typeof CoopMissionSchema>

/////////////////////////////////////////
// COOP MEMBER SCHEMA
/////////////////////////////////////////

export const CoopMemberSchema = z.object({
  id: z.cuid(),
  missionId: z.string(),
  userId: z.string(),
  role: z.string(),
  joinedAt: z.coerce.date(),
  isReady: z.boolean(),
})

export type CoopMember = z.infer<typeof CoopMemberSchema>

/////////////////////////////////////////
// COOP PROGRESS SCHEMA
/////////////////////////////////////////

export const CoopProgressSchema = z.object({
  id: z.cuid(),
  missionId: z.string(),
  questionId: z.string(),
  userId: z.string(),
  answer: z.string().nullable(),
  confirmed: z.boolean(),
  submittedAt: z.coerce.date().nullable(),
})

export type CoopProgress = z.infer<typeof CoopProgressSchema>

/////////////////////////////////////////
// TOTEM BATTLE SCHEMA
/////////////////////////////////////////

export const TotemBattleSchema = z.object({
  id: z.cuid(),
  weekNumber: z.number().int(),
  year: z.number().int(),
  groupAId: z.string(),
  groupBId: z.string(),
  phase: z.string(),
  scoreA: z.number().int(),
  scoreB: z.number().int(),
  winnerId: z.string().nullable(),
  startAt: z.coerce.date(),
  endAt: z.coerce.date(),
  rewardEmblem: z.string().nullable(),
  rewardXp: z.number().int(),
  createdAt: z.coerce.date(),
})

export type TotemBattle = z.infer<typeof TotemBattleSchema>

/////////////////////////////////////////
// TOTEM BATTLE RESULT SCHEMA
/////////////////////////////////////////

export const TotemBattleResultSchema = z.object({
  id: z.cuid(),
  battleId: z.string(),
  groupId: z.string(),
  finalScore: z.number().int(),
  memberCount: z.number().int(),
  avgLevel: z.number(),
  xpGained: z.number().int(),
  challengesCompleted: z.number().int(),
  ranking: z.number().int(),
  rewardsJson: JsonValueSchema.nullable(),
  createdAt: z.coerce.date(),
})

export type TotemBattleResult = z.infer<typeof TotemBattleResultSchema>

/////////////////////////////////////////
// GROUP MEMBER SCHEMA
/////////////////////////////////////////

export const GroupMemberSchema = z.object({
  id: z.cuid(),
  userId: z.string(),
  groupId: z.string(),
  role: z.string(),
  joinedAt: z.coerce.date(),
})

export type GroupMember = z.infer<typeof GroupMemberSchema>

/////////////////////////////////////////
// GROUP ACTIVITY SCHEMA
/////////////////////////////////////////

export const GroupActivitySchema = z.object({
  id: z.cuid(),
  groupId: z.string(),
  userId: z.string().nullable(),
  type: z.string(),
  message: z.string(),
  metadata: JsonValueSchema.nullable(),
  createdAt: z.coerce.date(),
})

export type GroupActivity = z.infer<typeof GroupActivitySchema>

/////////////////////////////////////////
// FLOW SCHEMA
/////////////////////////////////////////

export const FlowSchema = z.object({
  id: z.cuid(),
  name: z.string(),
  description: z.string().nullable(),
  createdAt: z.coerce.date(),
  metadata: JsonValueSchema.nullable(),
})

export type Flow = z.infer<typeof FlowSchema>

/////////////////////////////////////////
// FLOW STEP SCHEMA
/////////////////////////////////////////

export const FlowStepSchema = z.object({
  id: z.cuid(),
  flowId: z.string(),
  questionVersionId: z.string(),
  order: z.number().int(),
  section: z.string().nullable(),
  branchCondition: JsonValueSchema.nullable(),
  randomGroup: z.string().nullable(),
  isOptional: z.boolean(),
  metadata: JsonValueSchema.nullable(),
})

export type FlowStep = z.infer<typeof FlowStepSchema>

/////////////////////////////////////////
// FLOW STEP LINK SCHEMA
/////////////////////////////////////////

export const FlowStepLinkSchema = z.object({
  id: z.cuid(),
  fromStepId: z.string(),
  toStepId: z.string(),
  condition: JsonValueSchema.nullable(),
})

export type FlowStepLink = z.infer<typeof FlowStepLinkSchema>

/////////////////////////////////////////
// FLOW PROGRESS SCHEMA
/////////////////////////////////////////

export const FlowProgressSchema = z.object({
  id: z.cuid(),
  userId: z.string(),
  flowId: z.string(),
  currentStepId: z.string().nullable(),
  startedAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  completedAt: z.coerce.date().nullable(),
})

export type FlowProgress = z.infer<typeof FlowProgressSchema>

/////////////////////////////////////////
// ANSWER SCHEMA
/////////////////////////////////////////

export const AnswerSchema = z.object({
  id: z.cuid(),
  sessionId: z.string(),
  stepId: z.string(),
  questionVersionId: z.string(),
  value: z.string(),
  createdAt: z.coerce.date(),
})

export type Answer = z.infer<typeof AnswerSchema>

/////////////////////////////////////////
// LANGUAGE SCHEMA
/////////////////////////////////////////

export const LanguageSchema = z.object({
  id: z.cuid(),
  code: z.string(),
  name: z.string(),
})

export type Language = z.infer<typeof LanguageSchema>

/////////////////////////////////////////
// VERSION SCHEMA
/////////////////////////////////////////

export const VersionSchema = z.object({
  id: z.cuid(),
  name: z.string(),
  value: z.string(),
  createdAt: z.coerce.date(),
})

export type Version = z.infer<typeof VersionSchema>

/////////////////////////////////////////
// CATEGORY SCHEMA
/////////////////////////////////////////

export const CategorySchema = z.object({
  id: z.cuid(),
  name: z.string(),
})

export type Category = z.infer<typeof CategorySchema>

/////////////////////////////////////////
// SUB CATEGORY SCHEMA
/////////////////////////////////////////

export const SubCategorySchema = z.object({
  id: z.cuid(),
  name: z.string(),
  categoryId: z.string(),
})

export type SubCategory = z.infer<typeof SubCategorySchema>

/////////////////////////////////////////
// SUB SUB CATEGORY SCHEMA
/////////////////////////////////////////

export const SubSubCategorySchema = z.object({
  id: z.cuid(),
  name: z.string(),
  subCategoryId: z.string(),
})

export type SubSubCategory = z.infer<typeof SubSubCategorySchema>

/////////////////////////////////////////
// SSS CATEGORY SCHEMA
/////////////////////////////////////////

export const SssCategorySchema = z.object({
  id: z.cuid(),
  name: z.string(),
  subSubCategoryId: z.string(),
  status: z.string(),
  generatedAt: z.coerce.date().nullable(),
  error: z.string().nullable(),
  review: z.string().nullable(),
  finalText: z.string().nullable(),
  responseType: z.string().nullable(),
  outcome: z.string().nullable(),
  multiplication: z.number().int().nullable(),
  difficulty: z.string().nullable(),
  ageCategory: z.string().nullable(),
  gender: z.string().nullable(),
  author: z.string().nullable(),
  wildcard: z.string().nullable(),
})

export type SssCategory = z.infer<typeof SssCategorySchema>

/////////////////////////////////////////
// USER QUESTION SCHEMA
/////////////////////////////////////////

export const UserQuestionSchema = z.object({
  id: z.cuid(),
  userId: z.string(),
  questionId: z.string().nullable(),
  questionTemplateId: z.string().nullable(),
  status: z.string(),
  servedAt: z.coerce.date(),
  answeredAt: z.coerce.date().nullable(),
  archetypeContext: z.string().nullable(),
  moodContext: z.string().nullable(),
  seasonId: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type UserQuestion = z.infer<typeof UserQuestionSchema>

/////////////////////////////////////////
// QUESTION TEMPLATE SCHEMA
/////////////////////////////////////////

export const QuestionTemplateSchema = z.object({
  category: QuestionTemplateCategorySchema,
  archetypeAffinity: ArchetypeAffinitySchema.nullable(),
  tone: QuestionToneSchema,
  id: z.cuid(),
  text: z.string(),
  tags: z.string().array(),
  weight: z.number(),
  isActive: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type QuestionTemplate = z.infer<typeof QuestionTemplateSchema>

/////////////////////////////////////////
// BATTLE ACHIEVEMENT SCHEMA
/////////////////////////////////////////

export const BattleAchievementSchema = z.object({
  triggerType: BattleAchievementTriggerTypeSchema,
  rarity: BattleAchievementRaritySchema,
  id: z.cuid(),
  key: z.string(),
  title: z.string(),
  description: z.string(),
  thresholdValue: z.number().int(),
  rewardXP: z.number().int(),
  rewardBadgeId: z.string().nullable(),
  isActive: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type BattleAchievement = z.infer<typeof BattleAchievementSchema>

/////////////////////////////////////////
// USER BATTLE ACHIEVEMENT SCHEMA
/////////////////////////////////////////

export const UserBattleAchievementSchema = z.object({
  id: z.cuid(),
  userId: z.string(),
  achievementId: z.string(),
  progress: z.number().int(),
  isUnlocked: z.boolean(),
  isClaimed: z.boolean(),
  unlockedAt: z.coerce.date().nullable(),
  claimedAt: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type UserBattleAchievement = z.infer<typeof UserBattleAchievementSchema>

/////////////////////////////////////////
// GROUP SCHEMA
/////////////////////////////////////////

export const GroupSchema = z.object({
  id: z.cuid(),
  name: z.string(),
  emblem: z.string().nullable(),
  motto: z.string().nullable(),
  ownerId: z.string().nullable(),
  description: z.string().nullable(),
  visibility: z.string(),
  transparency: z.string(),
  maxMembers: z.number().int(),
  totalXp: z.number().int(),
  avgKarma: z.number().int(),
  avgPrestige: z.number().int(),
  cost: z.number().int(),
  weeklyBonus: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type Group = z.infer<typeof GroupSchema>

/////////////////////////////////////////
// GROUP STAT SCHEMA
/////////////////////////////////////////

export const GroupStatSchema = z.object({
  id: z.cuid(),
  groupId: z.string(),
  totalXP: z.number().int(),
  reflections: z.number().int(),
  avgLevel: z.number().int(),
  updatedAt: z.coerce.date(),
})

export type GroupStat = z.infer<typeof GroupStatSchema>

/////////////////////////////////////////
// USER GROUP SCHEMA
/////////////////////////////////////////

export const UserGroupSchema = z.object({
  id: z.cuid(),
  userId: z.string(),
  groupId: z.string(),
})

export type UserGroup = z.infer<typeof UserGroupSchema>

/////////////////////////////////////////
// PUBLIC POLL SCHEMA
/////////////////////////////////////////

export const PublicPollSchema = z.object({
  id: z.cuid(),
  title: z.string(),
  question: z.string(),
  options: z.string().array(),
  region: z.string().nullable(),
  visibility: z.string(),
  creatorId: z.string(),
  allowFreetext: z.boolean(),
  premiumCost: z.number().int(),
  rewardXP: z.number().int(),
  createdAt: z.coerce.date(),
  expiresAt: z.coerce.date().nullable(),
})

export type PublicPoll = z.infer<typeof PublicPollSchema>

/////////////////////////////////////////
// POLL RESPONSE SCHEMA
/////////////////////////////////////////

export const PollResponseSchema = z.object({
  id: z.cuid(),
  pollId: z.string(),
  userId: z.string(),
  optionIdx: z.number().int().nullable(),
  freetext: z.string().nullable(),
  region: z.string().nullable(),
  createdAt: z.coerce.date(),
})

export type PollResponse = z.infer<typeof PollResponseSchema>

/////////////////////////////////////////
// PUBLIC CHALLENGE SCHEMA
/////////////////////////////////////////

export const PublicChallengeSchema = z.object({
  id: z.cuid(),
  title: z.string(),
  description: z.string(),
  region: z.string().nullable(),
  rewardXP: z.number().int(),
  rewardItem: z.string().nullable(),
  activeFrom: z.coerce.date(),
  activeTo: z.coerce.date().nullable(),
  isActive: z.boolean(),
  createdAt: z.coerce.date(),
})

export type PublicChallenge = z.infer<typeof PublicChallengeSchema>

/////////////////////////////////////////
// CONTENT PACK SCHEMA
/////////////////////////////////////////

export const ContentPackSchema = z.object({
  id: z.cuid(),
  key: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  category: z.string().nullable(),
  price: z.number().int(),
  premiumOnly: z.boolean(),
  isActive: z.boolean(),
  themeColor: z.string().nullable(),
  icon: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type ContentPack = z.infer<typeof ContentPackSchema>

/////////////////////////////////////////
// PACK ITEM SCHEMA
/////////////////////////////////////////

export const PackItemSchema = z.object({
  id: z.cuid(),
  packId: z.string(),
  type: z.string(),
  refId: z.string().nullable(),
  data: JsonValueSchema.nullable(),
  createdAt: z.coerce.date(),
})

export type PackItem = z.infer<typeof PackItemSchema>

/////////////////////////////////////////
// USER PACK SCHEMA
/////////////////////////////////////////

export const UserPackSchema = z.object({
  id: z.cuid(),
  userId: z.string(),
  packId: z.string(),
  unlockedAt: z.coerce.date(),
})

export type UserPack = z.infer<typeof UserPackSchema>

/////////////////////////////////////////
// FIRESIDE SCHEMA
/////////////////////////////////////////

export const FiresideSchema = z.object({
  id: z.cuid(),
  title: z.string().nullable(),
  creatorId: z.string(),
  participantIds: z.string().array(),
  expiresAt: z.coerce.date(),
  isActive: z.boolean(),
  createdAt: z.coerce.date(),
})

export type Fireside = z.infer<typeof FiresideSchema>

/////////////////////////////////////////
// FIRESIDE REACTION SCHEMA
/////////////////////////////////////////

export const FiresideReactionSchema = z.object({
  id: z.cuid(),
  firesideId: z.string(),
  userId: z.string(),
  emoji: z.string(),
  createdAt: z.coerce.date(),
})

export type FiresideReaction = z.infer<typeof FiresideReactionSchema>

/////////////////////////////////////////
// MEMORY JOURNAL SCHEMA
/////////////////////////////////////////

export const MemoryJournalSchema = z.object({
  id: z.cuid(),
  userId: z.string(),
  title: z.string(),
  summary: z.string().nullable(),
  content: z.string(),
  periodStart: z.coerce.date(),
  periodEnd: z.coerce.date(),
  sourceCount: z.number().int(),
  createdAt: z.coerce.date(),
})

export type MemoryJournal = z.infer<typeof MemoryJournalSchema>

/////////////////////////////////////////
// COMPARISON CARD SCHEMA
/////////////////////////////////////////

export const ComparisonCardSchema = z.object({
  id: z.cuid(),
  userId: z.string(),
  statsJson: JsonValueSchema,
  funText: z.string(),
  imageUrl: z.string(),
  generatedAt: z.coerce.date(),
  autoGenerated: z.boolean(),
})

export type ComparisonCard = z.infer<typeof ComparisonCardSchema>

/////////////////////////////////////////
// MICRO MISSION SCHEMA
/////////////////////////////////////////

export const MicroMissionSchema = z.object({
  id: z.cuid(),
  key: z.string(),
  title: z.string(),
  description: z.string(),
  type: z.string(),
  rarity: z.string(),
  durationSec: z.number().int(),
  rewardXP: z.number().int(),
  rewardItem: z.string().nullable(),
  rewardGold: z.number().int().nullable(),
  skipCostFood: z.number().int().nullable(),
  skipCostGold: z.number().int().nullable(),
  skipCostPremium: z.number().int().nullable(),
  isActive: z.boolean(),
  createdAt: z.coerce.date(),
})

export type MicroMission = z.infer<typeof MicroMissionSchema>

/////////////////////////////////////////
// USER MICRO MISSION SCHEMA
/////////////////////////////////////////

export const UserMicroMissionSchema = z.object({
  id: z.cuid(),
  userId: z.string(),
  missionId: z.string(),
  status: z.string(),
  startedAt: z.coerce.date(),
  completedAt: z.coerce.date().nullable(),
})

export type UserMicroMission = z.infer<typeof UserMicroMissionSchema>

/////////////////////////////////////////
// AVATAR MOOD SCHEMA
/////////////////////////////////////////

export const AvatarMoodSchema = z.object({
  id: z.cuid(),
  userId: z.string(),
  mood: z.string(),
  pose: z.string(),
  emotionScore: z.number(),
  source: z.string(),
  updatedAt: z.coerce.date(),
})

export type AvatarMood = z.infer<typeof AvatarMoodSchema>

/////////////////////////////////////////
// GLOBAL MOOD SCHEMA
/////////////////////////////////////////

export const GlobalMoodSchema = z.object({
  dominantMood: GlobalMoodTypeSchema,
  id: z.cuid(),
  calmScore: z.number(),
  chaosScore: z.number(),
  neutralScore: z.number(),
  updatedAt: z.coerce.date(),
  worldModifier: JsonValueSchema.nullable(),
})

export type GlobalMood = z.infer<typeof GlobalMoodSchema>

/////////////////////////////////////////
// USER MOOD LOG SCHEMA
/////////////////////////////////////////

export const UserMoodLogSchema = z.object({
  mood: GlobalMoodTypeSchema,
  id: z.cuid(),
  userId: z.string(),
  reflectionId: z.string().nullable(),
  loggedAt: z.coerce.date(),
})

export type UserMoodLog = z.infer<typeof UserMoodLogSchema>

/////////////////////////////////////////
// MOOD PRESET SCHEMA
/////////////////////////////////////////

export const MoodPresetSchema = z.object({
  key: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  toneProfile: JsonValueSchema.nullable(),
  createdAt: z.coerce.date(),
  isActive: z.boolean(),
})

export type MoodPreset = z.infer<typeof MoodPresetSchema>

/////////////////////////////////////////
// MENTOR NPC SCHEMA
/////////////////////////////////////////

export const MentorNPCSchema = z.object({
  id: z.cuid(),
  key: z.string(),
  name: z.string(),
  archetypeAffinity: z.string().array(),
  personality: z.string(),
  introText: z.string().nullable(),
  tips: z.string().array(),
  voiceTone: z.string(),
  isActive: z.boolean(),
  createdAt: z.coerce.date(),
})

export type MentorNPC = z.infer<typeof MentorNPCSchema>

/////////////////////////////////////////
// USER MENTOR SCHEMA
/////////////////////////////////////////

export const UserMentorSchema = z.object({
  id: z.cuid(),
  userId: z.string(),
  mentorId: z.string(),
  affinityScore: z.number(),
  lastInteractionAt: z.coerce.date(),
})

export type UserMentor = z.infer<typeof UserMentorSchema>

/////////////////////////////////////////
// SEASON STORYLINE SCHEMA
/////////////////////////////////////////

export const SeasonStorylineSchema = z.object({
  id: z.cuid(),
  key: z.string(),
  title: z.string(),
  description: z.string(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().nullable(),
  isActive: z.boolean(),
  xpBonus: z.number().nullable(),
  goldBonus: z.number().nullable(),
  eventModifier: JsonValueSchema.nullable(),
  npcIds: z.string().array(),
  themeColor: z.string().nullable(),
  posterUrl: z.string().nullable(),
  createdAt: z.coerce.date(),
})

export type SeasonStoryline = z.infer<typeof SeasonStorylineSchema>

/////////////////////////////////////////
// STORYLINE ACHIEVEMENT SCHEMA
/////////////////////////////////////////

export const StorylineAchievementSchema = z.object({
  id: z.cuid(),
  seasonId: z.string(),
  title: z.string(),
  description: z.string(),
  rewardItem: z.string().nullable(),
  rewardXP: z.number().int().nullable(),
  createdAt: z.coerce.date(),
})

export type StorylineAchievement = z.infer<typeof StorylineAchievementSchema>

/////////////////////////////////////////
// WALLET SCHEMA
/////////////////////////////////////////

export const WalletSchema = z.object({
  id: z.cuid(),
  userId: z.string(),
  tenantId: z.string(),
  funds: z.instanceof(Decimal, { message: "Field 'funds' must be a Decimal. Location: ['Models', 'Wallet']"}),
  diamonds: z.number().int(),
  badgesClaimedCount: z.number().int(),
})

export type Wallet = z.infer<typeof WalletSchema>

/////////////////////////////////////////
// LEDGER ENTRY SCHEMA
/////////////////////////////////////////

export const LedgerEntrySchema = z.object({
  kind: LedgerKindSchema,
  id: z.cuid(),
  walletId: z.string(),
  tenantId: z.string(),
  amount: z.number().int(),
  refType: z.string(),
  refId: z.string().nullable(),
  note: z.string().nullable(),
  createdAt: z.coerce.date(),
  currencyId: z.string(),
})

export type LedgerEntry = z.infer<typeof LedgerEntrySchema>

/////////////////////////////////////////
// PRODUCT SCHEMA
/////////////////////////////////////////

export const ProductSchema = z.object({
  kind: ProductKindSchema,
  id: z.cuid(),
  slug: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  payload: JsonValueSchema,
  stackable: z.boolean(),
  active: z.boolean(),
  createdAt: z.coerce.date(),
})

export type Product = z.infer<typeof ProductSchema>

/////////////////////////////////////////
// PRICE SCHEMA
/////////////////////////////////////////

export const PriceSchema = z.object({
  id: z.cuid(),
  productId: z.string(),
  stripePriceId: z.string().nullable(),
  currencyCode: z.string(),
  unitAmount: z.number().int(),
  active: z.boolean(),
})

export type Price = z.infer<typeof PriceSchema>

/////////////////////////////////////////
// PURCHASE SCHEMA
/////////////////////////////////////////

export const PurchaseSchema = z.object({
  status: PurchaseStatusSchema,
  id: z.cuid(),
  userId: z.string(),
  tenantId: z.string(),
  productId: z.string(),
  quantity: z.number().int(),
  totalMinor: z.number().int(),
  extRef: z.string().nullable(),
  createdAt: z.coerce.date(),
})

export type Purchase = z.infer<typeof PurchaseSchema>

/////////////////////////////////////////
// ENTITLEMENT SCHEMA
/////////////////////////////////////////

export const EntitlementSchema = z.object({
  id: z.cuid(),
  userId: z.string(),
  tenantId: z.string(),
  productId: z.string(),
  meta: JsonValueSchema.nullable(),
  createdAt: z.coerce.date(),
})

export type Entitlement = z.infer<typeof EntitlementSchema>

/////////////////////////////////////////
// SUBSCRIPTION SCHEMA
/////////////////////////////////////////

export const SubscriptionSchema = z.object({
  id: z.cuid(),
  userId: z.string(),
  stripeSubId: z.string(),
  plan: z.string(),
  status: z.string(),
  currentPeriodEnd: z.coerce.date(),
  perks: JsonValueSchema,
  createdAt: z.coerce.date(),
})

export type Subscription = z.infer<typeof SubscriptionSchema>

/////////////////////////////////////////
// USER PROFILE SCHEMA
/////////////////////////////////////////

export const UserProfileSchema = z.object({
  id: z.cuid(),
  userId: z.string(),
  equippedAvatarId: z.string().nullable(),
  equippedBackgroundId: z.string().nullable(),
  equippedSkinId: z.string().nullable(),
  updatedAt: z.coerce.date(),
})

export type UserProfile = z.infer<typeof UserProfileSchema>

/////////////////////////////////////////
// BADGE SCHEMA
/////////////////////////////////////////

export const BadgeSchema = z.object({
  rarity: BadgeRaritySchema,
  unlockType: BadgeUnlockTypeSchema,
  rewardType: BadgeRewardTypeSchema.nullable(),
  id: z.cuid(),
  key: z.string(),
  name: z.string(),
  description: z.string(),
  icon: z.string(),
  requirementValue: z.string().nullable(),
  rewardValue: z.string().nullable(),
  seasonId: z.string().nullable(),
  isActive: z.boolean(),
  createdAt: z.coerce.date(),
  slug: z.string().nullable(),
  title: z.string().nullable(),
  active: z.boolean().nullable(),
  rarityId: z.string().nullable(),
})

export type Badge = z.infer<typeof BadgeSchema>

/////////////////////////////////////////
// USER BADGE SCHEMA
/////////////////////////////////////////

export const UserBadgeSchema = z.object({
  id: z.cuid(),
  userId: z.string(),
  badgeId: z.string(),
  unlockedAt: z.coerce.date(),
  claimedAt: z.coerce.date().nullable(),
  isClaimed: z.boolean(),
  createdAt: z.coerce.date().nullable(),
})

export type UserBadge = z.infer<typeof UserBadgeSchema>

/////////////////////////////////////////
// FAILED LOGIN ATTEMPT SCHEMA
/////////////////////////////////////////

export const FailedLoginAttemptSchema = z.object({
  id: z.cuid(),
  ipAddress: z.string(),
  email: z.string(),
  createdAt: z.coerce.date(),
})

export type FailedLoginAttempt = z.infer<typeof FailedLoginAttemptSchema>

/////////////////////////////////////////
// PASSWORD RESET SCHEMA
/////////////////////////////////////////

export const PasswordResetSchema = z.object({
  id: z.cuid(),
  userId: z.string(),
  token: z.string(),
  expiresAt: z.coerce.date(),
  createdAt: z.coerce.date(),
})

export type PasswordReset = z.infer<typeof PasswordResetSchema>

/////////////////////////////////////////
// EMAIL VERIFY SCHEMA
/////////////////////////////////////////

export const EmailVerifySchema = z.object({
  id: z.cuid(),
  userId: z.string(),
  token: z.string(),
  expiresAt: z.coerce.date(),
  createdAt: z.coerce.date(),
})

export type EmailVerify = z.infer<typeof EmailVerifySchema>

/////////////////////////////////////////
// AUDIT LOG SCHEMA
/////////////////////////////////////////

export const AuditLogSchema = z.object({
  id: z.cuid(),
  userId: z.string().nullable(),
  ip: z.string(),
  action: z.string(),
  meta: JsonValueSchema.nullable(),
  createdAt: z.coerce.date(),
})

export type AuditLog = z.infer<typeof AuditLogSchema>

/////////////////////////////////////////
// GENERATION BATCH SCHEMA
/////////////////////////////////////////

export const GenerationBatchSchema = z.object({
  status: BatchStatusSchema,
  id: z.cuid(),
  createdAt: z.coerce.date(),
  startedAt: z.coerce.date().nullable(),
  finishedAt: z.coerce.date().nullable(),
  language: z.string(),
  targetCount: z.number().int(),
  processed: z.number().int(),
  succeeded: z.number().int(),
  failed: z.number().int(),
  note: z.string().nullable(),
})

export type GenerationBatch = z.infer<typeof GenerationBatchSchema>

/////////////////////////////////////////
// GENERATION JOB SCHEMA
/////////////////////////////////////////

export const GenerationJobSchema = z.object({
  status: JobStatusSchema,
  id: z.cuid(),
  createdAt: z.coerce.date(),
  startedAt: z.coerce.date().nullable(),
  finishedAt: z.coerce.date().nullable(),
  error: z.string().nullable(),
  language: z.string(),
  sssCategoryId: z.string(),
  batchId: z.string(),
  aiLogId: z.string().nullable(),
  moderatorNotes: z.string().nullable(),
  moderatorScore: z.number().nullable(),
  moderatorStatus: z.string().nullable(),
  moderatorUserId: z.string().nullable(),
  qualityScore: z.number().nullable(),
  retryCount: z.number().int(),
  weightScore: z.number().nullable(),
})

export type GenerationJob = z.infer<typeof GenerationJobSchema>

/////////////////////////////////////////
// AI RESPONSE LOG SCHEMA
/////////////////////////////////////////

export const AIResponseLogSchema = z.object({
  id: z.cuid(),
  createdAt: z.coerce.date(),
  prompt: z.string(),
  response: z.string(),
  tokensIn: z.number().int().nullable(),
  tokensOut: z.number().int().nullable(),
  model: z.string().nullable(),
})

export type AIResponseLog = z.infer<typeof AIResponseLogSchema>

/////////////////////////////////////////
// ACCOUNT SCHEMA
/////////////////////////////////////////

export const AccountSchema = z.object({
  id: z.cuid(),
  userId: z.string(),
  type: z.string(),
  provider: z.string(),
  providerAccountId: z.string(),
  refresh_token: z.string().nullable(),
  access_token: z.string().nullable(),
  expires_at: z.number().int().nullable(),
  token_type: z.string().nullable(),
  scope: z.string().nullable(),
  id_token: z.string().nullable(),
  session_state: z.string().nullable(),
})

export type Account = z.infer<typeof AccountSchema>

/////////////////////////////////////////
// SESSION SCHEMA
/////////////////////////////////////////

export const SessionSchema = z.object({
  id: z.cuid(),
  sessionToken: z.string(),
  userId: z.string(),
  expires: z.coerce.date(),
})

export type Session = z.infer<typeof SessionSchema>

/////////////////////////////////////////
// VERIFICATION TOKEN SCHEMA
/////////////////////////////////////////

export const VerificationTokenSchema = z.object({
  identifier: z.string(),
  token: z.string(),
  expires: z.coerce.date(),
})

export type VerificationToken = z.infer<typeof VerificationTokenSchema>

/////////////////////////////////////////
// USER SUBMISSION SCHEMA
/////////////////////////////////////////

export const UserSubmissionSchema = z.object({
  type: SubmissionTypeSchema,
  status: SubmissionStatusSchema,
  id: z.cuid(),
  userId: z.string(),
  title: z.string(),
  content: z.string(),
  description: z.string().nullable(),
  categoryId: z.string().nullable(),
  languageId: z.string().nullable(),
  tags: z.string().array(),
  imageUrl: z.string().nullable(),
  metadata: JsonValueSchema.nullable(),
  upvotes: z.number().int(),
  downvotes: z.number().int(),
  score: z.number().int(),
  moderatorId: z.string().nullable(),
  moderatorNote: z.string().nullable(),
  reviewedAt: z.coerce.date().nullable(),
  approvedAt: z.coerce.date().nullable(),
  rejectedAt: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type UserSubmission = z.infer<typeof UserSubmissionSchema>

/////////////////////////////////////////
// EVENT SCHEMA
/////////////////////////////////////////

export const EventSchema = z.object({
  type: EventTypeSchema,
  status: EventStatusSchema,
  visibility: ContentVisibilitySchema,
  id: z.cuid(),
  title: z.string(),
  description: z.string(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  rewardXP: z.number().int(),
  rewardDiamonds: z.number().int(),
  imageUrl: z.string().nullable(),
  metadata: JsonValueSchema.nullable(),
  participants: z.number().int(),
  creatorId: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  localeCode: z.string().nullable(),
  isFlagged: z.boolean(),
  flagReason: z.string().nullable(),
})

export type Event = z.infer<typeof EventSchema>

/////////////////////////////////////////
// VOTE SCHEMA
/////////////////////////////////////////

export const VoteSchema = z.object({
  voteType: VoteTypeSchema,
  id: z.cuid(),
  userId: z.string().nullable(),
  sessionId: z.string().nullable(),
  submissionId: z.string(),
  createdAt: z.coerce.date(),
})

export type Vote = z.infer<typeof VoteSchema>

/////////////////////////////////////////
// SEASON SCHEMA
/////////////////////////////////////////

export const SeasonSchema = z.object({
  status: SeasonStatusSchema,
  id: z.cuid(),
  name: z.string(),
  displayName: z.string(),
  number: z.number().int(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  metadata: JsonValueSchema.nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type Season = z.infer<typeof SeasonSchema>

/////////////////////////////////////////
// SEASON ARCHIVE SCHEMA
/////////////////////////////////////////

export const SeasonArchiveSchema = z.object({
  id: z.cuid(),
  userId: z.string(),
  seasonId: z.string(),
  finalXP: z.number().int(),
  finalCoins: z.number().int(),
  finalRank: z.number().int().nullable(),
  finalKarma: z.number().int(),
  achievements: JsonValueSchema.nullable(),
  createdAt: z.coerce.date(),
})

export type SeasonArchive = z.infer<typeof SeasonArchiveSchema>

/////////////////////////////////////////
// COSMETIC ITEM SCHEMA
/////////////////////////////////////////

export const CosmeticItemSchema = z.object({
  type: CosmeticTypeSchema,
  rarity: CosmeticRaritySchema,
  id: z.cuid(),
  slug: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  price: z.number().int(),
  imageUrl: z.string().nullable(),
  metadata: JsonValueSchema.nullable(),
  active: z.boolean(),
  seasonOnly: z.boolean(),
  seasonId: z.string().nullable(),
  createdAt: z.coerce.date(),
  rarityId: z.string().nullable(),
})

export type CosmeticItem = z.infer<typeof CosmeticItemSchema>

/////////////////////////////////////////
// USER COSMETIC SCHEMA
/////////////////////////////////////////

export const UserCosmeticSchema = z.object({
  id: z.cuid(),
  userId: z.string(),
  cosmeticId: z.string(),
  equipped: z.boolean(),
  purchasedAt: z.coerce.date(),
})

export type UserCosmetic = z.infer<typeof UserCosmeticSchema>

/////////////////////////////////////////
// SEASONAL EVENT SCHEMA
/////////////////////////////////////////

export const SeasonalEventSchema = z.object({
  status: SeasonalEventStatusSchema,
  id: z.cuid(),
  title: z.string(),
  description: z.string(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  bonusType: z.string(),
  bonusValue: z.number().int(),
  metadata: JsonValueSchema.nullable(),
  createdAt: z.coerce.date(),
})

export type SeasonalEvent = z.infer<typeof SeasonalEventSchema>

/////////////////////////////////////////
// MIRROR EVENT SCHEMA
/////////////////////////////////////////

export const MirrorEventSchema = z.object({
  id: z.cuid(),
  key: z.string(),
  title: z.string(),
  description: z.string(),
  theme: z.string().nullable(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  active: z.boolean(),
  questionSet: z.string().array(),
  rewardXP: z.number().int(),
  rewardBadgeId: z.string().nullable(),
  createdAt: z.coerce.date(),
})

export type MirrorEvent = z.infer<typeof MirrorEventSchema>

/////////////////////////////////////////
// WILDCARD EVENT SCHEMA
/////////////////////////////////////////

export const WildcardEventSchema = z.object({
  id: z.cuid(),
  title: z.string(),
  description: z.string(),
  triggerType: z.string(),
  rewardXP: z.number().int(),
  rewardKarma: z.number().int(),
  flavorText: z.string(),
  createdAt: z.coerce.date(),
})

export type WildcardEvent = z.infer<typeof WildcardEventSchema>

/////////////////////////////////////////
// USER WILDCARD EVENT SCHEMA
/////////////////////////////////////////

export const UserWildcardEventSchema = z.object({
  id: z.cuid(),
  userId: z.string(),
  wildcardId: z.string(),
  redeemed: z.boolean(),
  redeemedAt: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
})

export type UserWildcardEvent = z.infer<typeof UserWildcardEventSchema>

/////////////////////////////////////////
// SHARE CARD SCHEMA
/////////////////////////////////////////

export const ShareCardSchema = z.object({
  id: z.cuid(),
  userId: z.string(),
  type: z.string(),
  imageUrl: z.string().nullable(),
  caption: z.string().nullable(),
  createdAt: z.coerce.date(),
  expiresAt: z.coerce.date(),
})

export type ShareCard = z.infer<typeof ShareCardSchema>

/////////////////////////////////////////
// POSTER CARD SCHEMA
/////////////////////////////////////////

export const PosterCardSchema = z.object({
  id: z.cuid(),
  userId: z.string(),
  title: z.string(),
  statsJson: JsonValueSchema,
  imageUrl: z.string().nullable(),
  isShared: z.boolean(),
  createdAt: z.coerce.date(),
})

export type PosterCard = z.infer<typeof PosterCardSchema>

/////////////////////////////////////////
// DREAM EVENT SCHEMA
/////////////////////////////////////////

export const DreamEventSchema = z.object({
  id: z.cuid(),
  title: z.string(),
  description: z.string(),
  triggerType: z.string(),
  effect: JsonValueSchema,
  flavorTone: z.string(),
  createdAt: z.coerce.date(),
  isActive: z.boolean(),
})

export type DreamEvent = z.infer<typeof DreamEventSchema>

/////////////////////////////////////////
// USER DREAM EVENT SCHEMA
/////////////////////////////////////////

export const UserDreamEventSchema = z.object({
  id: z.cuid(),
  userId: z.string(),
  dreamId: z.string(),
  resolved: z.boolean(),
  resolvedAt: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
})

export type UserDreamEvent = z.infer<typeof UserDreamEventSchema>

/////////////////////////////////////////
// GENERATION RECORD SCHEMA
/////////////////////////////////////////

export const GenerationRecordSchema = z.object({
  id: z.cuid(),
  userId: z.string(),
  generationNumber: z.number().int(),
  prestigeId: z.string().nullable(),
  inheritedPerks: JsonValueSchema,
  summaryText: z.string().nullable(),
  createdAt: z.coerce.date(),
})

export type GenerationRecord = z.infer<typeof GenerationRecordSchema>

/////////////////////////////////////////
// FEEDBACK SCHEMA
/////////////////////////////////////////

export const FeedbackSchema = z.object({
  status: FeedbackStatusSchema,
  id: z.cuid(),
  userId: z.string().nullable(),
  message: z.string(),
  screenshotUrl: z.string().nullable(),
  context: z.string().nullable(),
  createdAt: z.coerce.date(),
  reviewedAt: z.coerce.date().nullable(),
  reviewedBy: z.string().nullable(),
})

export type Feedback = z.infer<typeof FeedbackSchema>

/////////////////////////////////////////
// CREATOR PACK SCHEMA
/////////////////////////////////////////

export const CreatorPackSchema = z.object({
  type: CreatorPackTypeSchema,
  status: CreatorPackStatusSchema,
  rewardType: CreatorRewardTypeSchema.nullable(),
  id: z.cuid(),
  creatorId: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  metadata: JsonValueSchema.nullable(),
  createdAt: z.coerce.date(),
  approvedAt: z.coerce.date().nullable(),
  approvedBy: z.string().nullable(),
  rewardValue: z.number().int().nullable(),
  publishedAt: z.coerce.date().nullable(),
  downloadsCount: z.number().int(),
})

export type CreatorPack = z.infer<typeof CreatorPackSchema>

/////////////////////////////////////////
// USER CREATED PACK SCHEMA
/////////////////////////////////////////

export const UserCreatedPackSchema = z.object({
  id: z.cuid(),
  userId: z.string(),
  packId: z.string(),
  isPublished: z.boolean(),
  earnedRewards: z.number().int(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type UserCreatedPack = z.infer<typeof UserCreatedPackSchema>

/////////////////////////////////////////
// ITEM RECIPE SCHEMA
/////////////////////////////////////////

export const ItemRecipeSchema = z.object({
  id: z.cuid(),
  itemId: z.string(),
  ingredients: JsonValueSchema,
  craftTime: z.number().int(),
  xpReward: z.number().int(),
  discoveredBy: z.string().nullable(),
  createdAt: z.coerce.date(),
})

export type ItemRecipe = z.infer<typeof ItemRecipeSchema>

/////////////////////////////////////////
// ITEM DISCOVERY SCHEMA
/////////////////////////////////////////

export const ItemDiscoverySchema = z.object({
  id: z.cuid(),
  userId: z.string(),
  itemId: z.string(),
  discoveredAt: z.coerce.date(),
})

export type ItemDiscovery = z.infer<typeof ItemDiscoverySchema>

/////////////////////////////////////////
// USER REFLECTION SCHEMA
/////////////////////////////////////////

export const UserReflectionSchema = z.object({
  type: ReflectionTypeSchema,
  id: z.cuid(),
  userId: z.string(),
  date: z.coerce.date(),
  content: z.string(),
  summary: z.string().nullable(),
  sentiment: z.string().nullable(),
  stats: JsonValueSchema.nullable(),
  metadata: JsonValueSchema.nullable(),
  mirrorEventId: z.string().nullable(),
  createdAt: z.coerce.date(),
})

export type UserReflection = z.infer<typeof UserReflectionSchema>

/////////////////////////////////////////
// REFLECTION CONVERSATION SCHEMA
/////////////////////////////////////////

export const ReflectionConversationSchema = z.object({
  id: z.cuid(),
  userId: z.string(),
  reflectionId: z.string(),
  prompt: z.string(),
  response: z.string(),
  toneLevel: z.number().int(),
  modelUsed: z.string().nullable(),
  createdAt: z.coerce.date(),
})

export type ReflectionConversation = z.infer<typeof ReflectionConversationSchema>

/////////////////////////////////////////
// USER STATS SCHEMA
/////////////////////////////////////////

export const UserStatsSchema = z.object({
  id: z.cuid(),
  userId: z.string(),
  totalXP: z.number().int(),
  totalCoins: z.number().int(),
  totalKarma: z.number().int(),
  questionsCount: z.number().int(),
  streakDays: z.number().int(),
  currentRank: z.number().int().nullable(),
  lastWeekXP: z.number().int(),
  lastWeekCoins: z.number().int(),
  lastWeekKarma: z.number().int(),
  lastWeekQuestions: z.number().int(),
  lastWeekStreak: z.number().int(),
  rankChange: z.number().int().nullable(),
  metadata: JsonValueSchema.nullable(),
  updatedAt: z.coerce.date(),
  createdAt: z.coerce.date(),
})

export type UserStats = z.infer<typeof UserStatsSchema>

/////////////////////////////////////////
// USER WEEKLY STATS SCHEMA
/////////////////////////////////////////

export const UserWeeklyStatsSchema = z.object({
  id: z.cuid(),
  userId: z.string(),
  weekStart: z.coerce.date(),
  weekEnd: z.coerce.date(),
  xpGain: z.number().int(),
  coinsGain: z.number().int(),
  karmaGain: z.number().int(),
  questionsCount: z.number().int(),
  streakDays: z.number().int(),
  rankChange: z.number().int().nullable(),
  metadata: JsonValueSchema.nullable(),
  createdAt: z.coerce.date(),
})

export type UserWeeklyStats = z.infer<typeof UserWeeklyStatsSchema>

/////////////////////////////////////////
// CHRONICLE SCHEMA
/////////////////////////////////////////

export const ChronicleSchema = z.object({
  type: ChronicleTypeSchema,
  id: z.cuid(),
  userId: z.string(),
  summaryText: z.string(),
  statsJson: JsonValueSchema,
  quote: z.string().nullable(),
  generatedAt: z.coerce.date(),
  seasonId: z.string().nullable(),
})

export type Chronicle = z.infer<typeof ChronicleSchema>

/////////////////////////////////////////
// REGION SCHEMA
/////////////////////////////////////////

export const RegionSchema = z.object({
  buffType: RegionBuffTypeSchema,
  unlockRequirementType: UnlockRequirementTypeSchema.nullable(),
  id: z.cuid(),
  key: z.string(),
  name: z.string(),
  description: z.string(),
  orderIndex: z.number().int(),
  buffValue: z.number(),
  unlockRequirementValue: z.string().nullable(),
  isActive: z.boolean(),
  createdAt: z.coerce.date(),
})

export type Region = z.infer<typeof RegionSchema>

/////////////////////////////////////////
// USER REGION SCHEMA
/////////////////////////////////////////

export const UserRegionSchema = z.object({
  id: z.cuid(),
  userId: z.string(),
  regionId: z.string(),
  isUnlocked: z.boolean(),
  visitedAt: z.coerce.date().nullable(),
  activeBuff: z.boolean(),
  lastTravelAt: z.coerce.date().nullable(),
})

export type UserRegion = z.infer<typeof UserRegionSchema>

/////////////////////////////////////////
// QUEST SCHEMA
/////////////////////////////////////////

export const QuestSchema = z.object({
  type: QuestTypeSchema,
  requirementType: QuestRequirementTypeSchema,
  id: z.cuid(),
  key: z.string(),
  title: z.string(),
  description: z.string(),
  requirementValue: z.number().int(),
  rewardXP: z.number().int(),
  rewardGold: z.number().int(),
  rewardItem: z.string().nullable(),
  rewardBadge: z.string().nullable(),
  rewardKarma: z.number().int(),
  isRepeatable: z.boolean(),
  isActive: z.boolean(),
  createdAt: z.coerce.date(),
})

export type Quest = z.infer<typeof QuestSchema>

/////////////////////////////////////////
// USER QUEST SCHEMA
/////////////////////////////////////////

export const UserQuestSchema = z.object({
  id: z.cuid(),
  userId: z.string(),
  questId: z.string(),
  progress: z.number().int(),
  isCompleted: z.boolean(),
  isClaimed: z.boolean(),
  startedAt: z.coerce.date(),
  completedAt: z.coerce.date().nullable(),
})

export type UserQuest = z.infer<typeof UserQuestSchema>

/////////////////////////////////////////
// USER LORE ENTRY SCHEMA
/////////////////////////////////////////

export const UserLoreEntrySchema = z.object({
  sourceType: LoreSourceTypeSchema,
  tone: LoreToneSchema,
  id: z.cuid(),
  userId: z.string(),
  sourceId: z.string().nullable(),
  text: z.string(),
  createdAt: z.coerce.date(),
})

export type UserLoreEntry = z.infer<typeof UserLoreEntrySchema>

/////////////////////////////////////////
// FRIENDSHIP SCHEMA
/////////////////////////////////////////

export const FriendshipSchema = z.object({
  status: FriendshipStatusSchema,
  id: z.cuid(),
  userA: z.string(),
  userB: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type Friendship = z.infer<typeof FriendshipSchema>

/////////////////////////////////////////
// SOCIAL DUEL SCHEMA
/////////////////////////////////////////

export const SocialDuelSchema = z.object({
  status: DuelStatusSchema,
  challengeType: ChallengeTypeSchema,
  id: z.cuid(),
  challengerId: z.string(),
  opponentId: z.string(),
  rewardXP: z.number().int(),
  winnerId: z.string().nullable(),
  createdAt: z.coerce.date(),
})

export type SocialDuel = z.infer<typeof SocialDuelSchema>

/////////////////////////////////////////
// SHARED MISSION SCHEMA
/////////////////////////////////////////

export const SharedMissionSchema = z.object({
  status: SharedMissionStatusSchema,
  id: z.cuid(),
  missionKey: z.string(),
  participants: z.string().array(),
  rewardXP: z.number().int(),
  createdAt: z.coerce.date(),
  completedAt: z.coerce.date().nullable(),
})

export type SharedMission = z.infer<typeof SharedMissionSchema>

/////////////////////////////////////////
// CURRENCY SCHEMA
/////////////////////////////////////////

export const CurrencySchema = z.object({
  id: z.cuid(),
  key: z.string(),
  name: z.string(),
  symbol: z.string(),
  exchangeRate: z.number(),
  isPremium: z.boolean(),
  createdAt: z.coerce.date(),
})

export type Currency = z.infer<typeof CurrencySchema>

/////////////////////////////////////////
// USER WALLET SCHEMA
/////////////////////////////////////////

export const UserWalletSchema = z.object({
  id: z.cuid(),
  userId: z.string(),
  currencyKey: z.string(),
  balance: z.instanceof(Decimal, { message: "Field 'balance' must be a Decimal. Location: ['Models', 'UserWallet']"}),
  updatedAt: z.coerce.date(),
})

export type UserWallet = z.infer<typeof UserWalletSchema>

/////////////////////////////////////////
// MARKET ITEM SCHEMA
/////////////////////////////////////////

export const MarketItemSchema = z.object({
  category: ItemCategorySchema,
  id: z.cuid(),
  name: z.string(),
  description: z.string(),
  price: z.instanceof(Decimal, { message: "Field 'price' must be a Decimal. Location: ['Models', 'MarketItem']"}),
  currencyKey: z.string(),
  rarity: z.string().nullable(),
  stock: z.number().int().nullable(),
  isEventItem: z.boolean(),
  createdAt: z.coerce.date(),
})

export type MarketItem = z.infer<typeof MarketItemSchema>

/////////////////////////////////////////
// TRANSACTION SCHEMA
/////////////////////////////////////////

export const TransactionSchema = z.object({
  type: TransactionTypeSchema,
  id: z.cuid(),
  userId: z.string(),
  itemId: z.string().nullable(),
  amount: z.instanceof(Decimal, { message: "Field 'amount' must be a Decimal. Location: ['Models', 'Transaction']"}),
  currencyKey: z.string(),
  note: z.string().nullable(),
  createdAt: z.coerce.date(),
})

export type Transaction = z.infer<typeof TransactionSchema>

/////////////////////////////////////////
// BALANCE SETTING SCHEMA
/////////////////////////////////////////

export const BalanceSettingSchema = z.object({
  id: z.cuid(),
  key: z.string(),
  value: z.number(),
  updatedAt: z.coerce.date(),
})

export type BalanceSetting = z.infer<typeof BalanceSettingSchema>

/////////////////////////////////////////
// ECONOMY PRESET SCHEMA
/////////////////////////////////////////

export const EconomyPresetSchema = z.object({
  id: z.cuid(),
  name: z.string(),
  description: z.string(),
  modifiers: JsonValueSchema,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type EconomyPreset = z.infer<typeof EconomyPresetSchema>

/////////////////////////////////////////
// SYSTEM ALERT SCHEMA
/////////////////////////////////////////

export const SystemAlertSchema = z.object({
  type: SystemAlertTypeSchema,
  level: SystemAlertLevelSchema,
  id: z.cuid(),
  message: z.string(),
  metadata: JsonValueSchema.nullable(),
  createdAt: z.coerce.date(),
  resolvedAt: z.coerce.date().nullable(),
  autoResolved: z.boolean(),
})

export type SystemAlert = z.infer<typeof SystemAlertSchema>

/////////////////////////////////////////
// ALERT WEBHOOK SCHEMA
/////////////////////////////////////////

export const AlertWebhookSchema = z.object({
  type: WebhookTypeSchema,
  id: z.cuid(),
  name: z.string(),
  url: z.string(),
  isActive: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type AlertWebhook = z.infer<typeof AlertWebhookSchema>

/////////////////////////////////////////
// META SEASON SCHEMA
/////////////////////////////////////////

export const MetaSeasonSchema = z.object({
  id: z.cuid(),
  key: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().nullable(),
  isActive: z.boolean(),
  createdAt: z.coerce.date(),
})

export type MetaSeason = z.infer<typeof MetaSeasonSchema>

/////////////////////////////////////////
// PRESTIGE RECORD SCHEMA
/////////////////////////////////////////

export const PrestigeRecordSchema = z.object({
  id: z.cuid(),
  userId: z.string(),
  seasonId: z.string(),
  oldLevel: z.number().int(),
  legacyXP: z.number().int(),
  prestigeCount: z.number().int(),
  rewardBadgeId: z.string().nullable(),
  prestigeTitle: z.string().nullable(),
  prestigeBadgeId: z.string().nullable(),
  prestigeColorTheme: z.string().nullable(),
  createdAt: z.coerce.date(),
})

export type PrestigeRecord = z.infer<typeof PrestigeRecordSchema>

/////////////////////////////////////////
// TRENDING QUESTION SCHEMA
/////////////////////////////////////////

export const TrendingQuestionSchema = z.object({
  id: z.cuid(),
  questionId: z.string(),
  region: z.string(),
  windowStart: z.coerce.date(),
  windowEnd: z.coerce.date(),
  reactions24h: z.number().int(),
  score: z.number(),
  updatedAt: z.coerce.date(),
})

export type TrendingQuestion = z.infer<typeof TrendingQuestionSchema>

/////////////////////////////////////////
// COMBAT SESSION SCHEMA
/////////////////////////////////////////

export const CombatSessionSchema = z.object({
  id: z.cuid(),
  userId: z.string(),
  heroHp: z.number().int(),
  heroMaxHp: z.number().int(),
  enemyHp: z.number().int(),
  enemyMaxHp: z.number().int(),
  enemyName: z.string(),
  enemyType: z.string(),
  xpGained: z.number().int(),
  goldGained: z.number().int(),
  kills: z.number().int(),
  currentStreak: z.number().int(),
  isActive: z.boolean(),
  lastActionAt: z.coerce.date(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type CombatSession = z.infer<typeof CombatSessionSchema>

/////////////////////////////////////////
// ENEMY SCHEMA
/////////////////////////////////////////

export const EnemySchema = z.object({
  id: z.cuid(),
  name: z.string(),
  hp: z.number().int(),
  str: z.number().int(),
  def: z.number().int(),
  speed: z.number().int(),
  rarity: z.string(),
  xpReward: z.number().int(),
  goldReward: z.number().int(),
  sprite: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type Enemy = z.infer<typeof EnemySchema>

/////////////////////////////////////////
// FIGHT SCHEMA
/////////////////////////////////////////

export const FightSchema = z.object({
  id: z.cuid(),
  heroId: z.string(),
  enemyId: z.string(),
  rounds: JsonValueSchema,
  winner: z.string(),
  createdAt: z.coerce.date(),
})

export type Fight = z.infer<typeof FightSchema>

/////////////////////////////////////////
// PUBLIC COMPARISON SCHEMA
/////////////////////////////////////////

export const PublicComparisonSchema = z.object({
  id: z.cuid(),
  question: z.string(),
  answers: z.string().array(),
  isPublic: z.boolean(),
  reactionsLike: z.number().int(),
  reactionsLaugh: z.number().int(),
  reactionsThink: z.number().int(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type PublicComparison = z.infer<typeof PublicComparisonSchema>
