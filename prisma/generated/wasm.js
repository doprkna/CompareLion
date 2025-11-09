
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('@prisma/client/runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.22.0
 * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
 */
Prisma.prismaVersion = {
  client: "5.22.0",
  engine: "605197351a3c8bdd595af2d2a9bc3025bca48ea2"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.NotFoundError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`NotFoundError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  email: 'email',
  passwordHash: 'passwordHash',
  name: 'name',
  phone: 'phone',
  language: 'language',
  country: 'country',
  dateOfBirth: 'dateOfBirth',
  avatarUrl: 'avatarUrl',
  username: 'username',
  bio: 'bio',
  visibility: 'visibility',
  banned: 'banned',
  motto: 'motto',
  theme: 'theme',
  funds: 'funds',
  diamonds: 'diamonds',
  xp: 'xp',
  level: 'level',
  lastLoginAt: 'lastLoginAt',
  lastActiveAt: 'lastActiveAt',
  createdAt: 'createdAt',
  image: 'image',
  streakCount: 'streakCount',
  lastAnsweredAt: 'lastAnsweredAt',
  score: 'score',
  questionsAnswered: 'questionsAnswered',
  questionsCreated: 'questionsCreated',
  emailVerified: 'emailVerified',
  emailVerifiedAt: 'emailVerifiedAt',
  newsletterOptIn: 'newsletterOptIn',
  role: 'role',
  archetype: 'archetype',
  archetypeKey: 'archetypeKey',
  stats: 'stats',
  lastArchetypeReroll: 'lastArchetypeReroll',
  settings: 'settings',
  lang: 'lang',
  localeCode: 'localeCode',
  ageGroup: 'ageGroup',
  region: 'region',
  interests: 'interests',
  tone: 'tone',
  onboardingCompleted: 'onboardingCompleted',
  combatKills: 'combatKills',
  combatBattles: 'combatBattles',
  combatHighestStreak: 'combatHighestStreak',
  statCreativity: 'statCreativity',
  statHealth: 'statHealth',
  statKnowledge: 'statKnowledge',
  statSleep: 'statSleep',
  statSocial: 'statSocial',
  allowPublicCompare: 'allowPublicCompare',
  canBeAdded: 'canBeAdded',
  badgeType: 'badgeType',
  karmaScore: 'karmaScore',
  prestigeScore: 'prestigeScore',
  showBadges: 'showBadges',
  coins: 'coins',
  seasonalXP: 'seasonalXP',
  seasonLevel: 'seasonLevel',
  seasonXP: 'seasonXP',
  prestigeCount: 'prestigeCount',
  legacyPerk: 'legacyPerk',
  prestigeTitle: 'prestigeTitle',
  prestigeBadgeId: 'prestigeBadgeId',
  prestigeColorTheme: 'prestigeColorTheme',
  currentGeneration: 'currentGeneration',
  avatarTheme: 'avatarTheme',
  moodFeed: 'moodFeed',
  equippedTitle: 'equippedTitle',
  equippedIcon: 'equippedIcon',
  equippedBackground: 'equippedBackground'
};

exports.Prisma.AffinityScalarFieldEnum = {
  id: 'id',
  sourceId: 'sourceId',
  targetId: 'targetId',
  type: 'type',
  strength: 'strength',
  mutual: 'mutual',
  visibility: 'visibility',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.OrgScalarFieldEnum = {
  id: 'id',
  name: 'name',
  createdAt: 'createdAt'
};

exports.Prisma.MembershipScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  orgId: 'orgId',
  role: 'role'
};

exports.Prisma.TaskScalarFieldEnum = {
  id: 'id',
  orgId: 'orgId',
  createdById: 'createdById',
  title: 'title',
  description: 'description',
  status: 'status',
  priority: 'priority',
  source: 'source',
  assigneeType: 'assigneeType',
  assigneeId: 'assigneeId',
  dueAt: 'dueAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AttachmentScalarFieldEnum = {
  id: 'id',
  taskId: 'taskId',
  name: 'name',
  url: 'url',
  mimeType: 'mimeType',
  size: 'size'
};

exports.Prisma.TaskMessageScalarFieldEnum = {
  id: 'id',
  taskId: 'taskId',
  authorType: 'authorType',
  text: 'text',
  createdAt: 'createdAt'
};

exports.Prisma.WorkflowScalarFieldEnum = {
  id: 'id',
  orgId: 'orgId',
  name: 'name',
  trigger: 'trigger',
  action: 'action',
  keywords: 'keywords',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.RunScalarFieldEnum = {
  id: 'id',
  taskId: 'taskId',
  workflowId: 'workflowId',
  status: 'status',
  logs: 'logs',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.IntegrationScalarFieldEnum = {
  id: 'id',
  orgId: 'orgId',
  type: 'type',
  config: 'config',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.QuestionScalarFieldEnum = {
  text: 'text',
  normalizedText: 'normalizedText',
  difficulty: 'difficulty',
  source: 'source',
  approved: 'approved',
  reviewNotes: 'reviewNotes',
  createdByUserId: 'createdByUserId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  id: 'id',
  categoryId: 'categoryId',
  subCategoryId: 'subCategoryId',
  subSubCategoryId: 'subSubCategoryId',
  relatedToId: 'relatedToId',
  metadata: 'metadata',
  currentVersionId: 'currentVersionId',
  ssscId: 'ssscId',
  lang: 'lang',
  region: 'region',
  isLocalized: 'isLocalized',
  localeCode: 'localeCode',
  isFlagged: 'isFlagged',
  flagReason: 'flagReason',
  visibility: 'visibility',
  reactionsLike: 'reactionsLike',
  reactionsLaugh: 'reactionsLaugh',
  reactionsThink: 'reactionsThink'
};

exports.Prisma.QuestionVersionScalarFieldEnum = {
  id: 'id',
  questionId: 'questionId',
  text: 'text',
  displayText: 'displayText',
  type: 'type',
  options: 'options',
  metadata: 'metadata',
  createdAt: 'createdAt',
  version: 'version'
};

exports.Prisma.QuestionTagScalarFieldEnum = {
  id: 'id',
  name: 'name',
  type: 'type',
  description: 'description'
};

exports.Prisma.QuestionVersionTagScalarFieldEnum = {
  id: 'id',
  questionVersionId: 'questionVersionId',
  tagId: 'tagId'
};

exports.Prisma.QuestionGenerationScalarFieldEnum = {
  id: 'id',
  ssscId: 'ssscId',
  targetCount: 'targetCount',
  status: 'status',
  prompt: 'prompt',
  insertedCount: 'insertedCount',
  rawResponse: 'rawResponse',
  finishedAt: 'finishedAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.FlowQuestionScalarFieldEnum = {
  id: 'id',
  categoryId: 'categoryId',
  locale: 'locale',
  text: 'text',
  type: 'type',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.FlowQuestionOptionScalarFieldEnum = {
  id: 'id',
  questionId: 'questionId',
  label: 'label',
  value: 'value',
  order: 'order'
};

exports.Prisma.UserResponseScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  questionId: 'questionId',
  optionIds: 'optionIds',
  numericVal: 'numericVal',
  textVal: 'textVal',
  skipped: 'skipped',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SynchTestScalarFieldEnum = {
  id: 'id',
  key: 'key',
  title: 'title',
  description: 'description',
  questions: 'questions',
  resultTextTemplates: 'resultTextTemplates',
  rewardXP: 'rewardXP',
  rewardKarma: 'rewardKarma',
  isActive: 'isActive',
  createdAt: 'createdAt'
};

exports.Prisma.UserSynchTestScalarFieldEnum = {
  id: 'id',
  testId: 'testId',
  userA: 'userA',
  userB: 'userB',
  answersA: 'answersA',
  answersB: 'answersB',
  compatibilityScore: 'compatibilityScore',
  shared: 'shared',
  status: 'status',
  createdAt: 'createdAt'
};

exports.Prisma.FactionScalarFieldEnum = {
  id: 'id',
  key: 'key',
  name: 'name',
  motto: 'motto',
  description: 'description',
  colorPrimary: 'colorPrimary',
  colorSecondary: 'colorSecondary',
  buffType: 'buffType',
  buffValue: 'buffValue',
  regionScope: 'regionScope',
  isActive: 'isActive',
  createdAt: 'createdAt'
};

exports.Prisma.FactionInfluenceScalarFieldEnum = {
  id: 'id',
  factionId: 'factionId',
  region: 'region',
  influenceScore: 'influenceScore',
  lastUpdated: 'lastUpdated',
  dailyDelta: 'dailyDelta',
  contributionsCount: 'contributionsCount'
};

exports.Prisma.UserFactionScalarFieldEnum = {
  userId: 'userId',
  factionId: 'factionId',
  joinedAt: 'joinedAt',
  contributedXP: 'contributedXP',
  isLeader: 'isLeader'
};

exports.Prisma.CommunityCreationScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  title: 'title',
  type: 'type',
  content: 'content',
  status: 'status',
  likes: 'likes',
  rewardXP: 'rewardXP',
  rewardKarma: 'rewardKarma',
  createdAt: 'createdAt'
};

exports.Prisma.CommunityCreationLikeScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  creationId: 'creationId',
  createdAt: 'createdAt'
};

exports.Prisma.PostcardScalarFieldEnum = {
  id: 'id',
  senderId: 'senderId',
  receiverId: 'receiverId',
  message: 'message',
  status: 'status',
  deliveryAt: 'deliveryAt',
  createdAt: 'createdAt'
};

exports.Prisma.RarityTierScalarFieldEnum = {
  id: 'id',
  key: 'key',
  name: 'name',
  colorPrimary: 'colorPrimary',
  colorGlow: 'colorGlow',
  frameStyle: 'frameStyle',
  rankOrder: 'rankOrder',
  description: 'description',
  isActive: 'isActive',
  createdAt: 'createdAt'
};

exports.Prisma.DailyForkScalarFieldEnum = {
  id: 'id',
  key: 'key',
  title: 'title',
  description: 'description',
  optionA: 'optionA',
  optionB: 'optionB',
  effectA: 'effectA',
  effectB: 'effectB',
  rarity: 'rarity',
  createdAt: 'createdAt',
  isActive: 'isActive'
};

exports.Prisma.UserDailyForkScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  forkId: 'forkId',
  choice: 'choice',
  resultSummary: 'resultSummary',
  createdAt: 'createdAt'
};

exports.Prisma.DuetRunScalarFieldEnum = {
  id: 'id',
  missionKey: 'missionKey',
  title: 'title',
  description: 'description',
  type: 'type',
  durationSec: 'durationSec',
  rewardXP: 'rewardXP',
  rewardKarma: 'rewardKarma',
  createdAt: 'createdAt',
  isActive: 'isActive'
};

exports.Prisma.UserDuetRunScalarFieldEnum = {
  id: 'id',
  runId: 'runId',
  userA: 'userA',
  userB: 'userB',
  status: 'status',
  startedAt: 'startedAt',
  endedAt: 'endedAt',
  progressA: 'progressA',
  progressB: 'progressB'
};

exports.Prisma.RitualScalarFieldEnum = {
  id: 'id',
  key: 'key',
  title: 'title',
  description: 'description',
  rewardXP: 'rewardXP',
  rewardKarma: 'rewardKarma',
  timeOfDay: 'timeOfDay',
  createdAt: 'createdAt',
  isActive: 'isActive'
};

exports.Prisma.UserRitualScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  ritualId: 'ritualId',
  lastCompleted: 'lastCompleted',
  streakCount: 'streakCount',
  totalCompleted: 'totalCompleted'
};

exports.Prisma.MicroClanScalarFieldEnum = {
  id: 'id',
  name: 'name',
  description: 'description',
  leaderId: 'leaderId',
  memberIds: 'memberIds',
  buffType: 'buffType',
  buffValue: 'buffValue',
  seasonId: 'seasonId',
  createdAt: 'createdAt',
  isActive: 'isActive'
};

exports.Prisma.MicroClanStatsScalarFieldEnum = {
  id: 'id',
  clanId: 'clanId',
  xpTotal: 'xpTotal',
  activityScore: 'activityScore',
  rank: 'rank',
  updatedAt: 'updatedAt'
};

exports.Prisma.LootMomentScalarFieldEnum = {
  id: 'id',
  key: 'key',
  trigger: 'trigger',
  rewardType: 'rewardType',
  rewardValue: 'rewardValue',
  rarity: 'rarity',
  flavorText: 'flavorText',
  createdAt: 'createdAt',
  isActive: 'isActive'
};

exports.Prisma.UserLootMomentScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  momentId: 'momentId',
  rewardData: 'rewardData',
  triggeredAt: 'triggeredAt',
  redeemedAt: 'redeemedAt'
};

exports.Prisma.MessageScalarFieldEnum = {
  id: 'id',
  createdAt: 'createdAt',
  content: 'content',
  isRead: 'isRead',
  receiverId: 'receiverId',
  senderId: 'senderId',
  flagged: 'flagged',
  hiddenBySender: 'hiddenBySender',
  hiddenByReceiver: 'hiddenByReceiver'
};

exports.Prisma.CommentScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  targetType: 'targetType',
  targetId: 'targetId',
  content: 'content',
  flagged: 'flagged',
  isFlagged: 'isFlagged',
  flagReason: 'flagReason',
  visibility: 'visibility',
  createdAt: 'createdAt'
};

exports.Prisma.ActionLogScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  action: 'action',
  metadata: 'metadata',
  createdAt: 'createdAt'
};

exports.Prisma.ModerationLogScalarFieldEnum = {
  id: 'id',
  moderatorId: 'moderatorId',
  action: 'action',
  targetType: 'targetType',
  targetId: 'targetId',
  reason: 'reason',
  createdAt: 'createdAt'
};

exports.Prisma.CulturalFilterScalarFieldEnum = {
  id: 'id',
  region: 'region',
  tag: 'tag',
  category: 'category',
  description: 'description',
  severity: 'severity',
  createdBy: 'createdBy',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ModerationReportScalarFieldEnum = {
  id: 'id',
  contentId: 'contentId',
  type: 'type',
  reasonTag: 'reasonTag',
  region: 'region',
  reporterId: 'reporterId',
  isAnonymous: 'isAnonymous',
  createdAt: 'createdAt'
};

exports.Prisma.AIRegionalContextScalarFieldEnum = {
  id: 'id',
  region: 'region',
  localeCode: 'localeCode',
  toneProfile: 'toneProfile',
  culturalNotes: 'culturalNotes',
  humorStyle: 'humorStyle',
  tabooTopics: 'tabooTopics',
  updatedAt: 'updatedAt'
};

exports.Prisma.ReflectionScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  text: 'text',
  createdAt: 'createdAt'
};

exports.Prisma.AchievementScalarFieldEnum = {
  id: 'id',
  code: 'code',
  key: 'key',
  category: 'category',
  tier: 'tier',
  title: 'title',
  name: 'name',
  description: 'description',
  icon: 'icon',
  emoji: 'emoji',
  xpReward: 'xpReward',
  rewardXp: 'rewardXp',
  rewardGold: 'rewardGold',
  updatedAt: 'updatedAt',
  createdAt: 'createdAt'
};

exports.Prisma.UserAchievementScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  achievementId: 'achievementId',
  tier: 'tier',
  earnedAt: 'earnedAt',
  unlockedAt: 'unlockedAt',
  animationShownAt: 'animationShownAt'
};

exports.Prisma.EventLogScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  type: 'type',
  title: 'title',
  description: 'description',
  metadata: 'metadata',
  visibility: 'visibility',
  reactionsCount: 'reactionsCount',
  createdAt: 'createdAt',
  eventType: 'eventType',
  eventData: 'eventData'
};

exports.Prisma.WaitlistScalarFieldEnum = {
  id: 'id',
  email: 'email',
  refCode: 'refCode',
  source: 'source',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.MarketingCampaignScalarFieldEnum = {
  id: 'id',
  title: 'title',
  content: 'content',
  link: 'link',
  status: 'status',
  sentAt: 'sentAt',
  deliveredCount: 'deliveredCount',
  openedCount: 'openedCount',
  clickedCount: 'clickedCount',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ActivityScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  type: 'type',
  title: 'title',
  description: 'description',
  metadata: 'metadata',
  createdAt: 'createdAt'
};

exports.Prisma.NotificationScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  senderId: 'senderId',
  type: 'type',
  title: 'title',
  body: 'body',
  isRead: 'isRead',
  createdAt: 'createdAt'
};

exports.Prisma.PresenceScalarFieldEnum = {
  userId: 'userId',
  status: 'status',
  lastActive: 'lastActive',
  updatedAt: 'updatedAt'
};

exports.Prisma.ItemScalarFieldEnum = {
  id: 'id',
  name: 'name',
  type: 'type',
  rarity: 'rarity',
  description: 'description',
  power: 'power',
  defense: 'defense',
  effect: 'effect',
  bonus: 'bonus',
  icon: 'icon',
  key: 'key',
  emoji: 'emoji',
  createdAt: 'createdAt',
  availableUntil: 'availableUntil',
  cosmeticSubtype: 'cosmeticSubtype',
  cosmeticType: 'cosmeticType',
  diamondPrice: 'diamondPrice',
  eventCurrency: 'eventCurrency',
  eventPrice: 'eventPrice',
  goldPrice: 'goldPrice',
  isFeatured: 'isFeatured',
  isLimited: 'isLimited',
  isShopItem: 'isShopItem',
  visualConfig: 'visualConfig',
  rarityId: 'rarityId'
};

exports.Prisma.InventoryItemScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  itemId: 'itemId',
  itemKey: 'itemKey',
  rarity: 'rarity',
  power: 'power',
  effectKey: 'effectKey',
  quantity: 'quantity',
  equipped: 'equipped',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ItemEffectScalarFieldEnum = {
  key: 'key',
  name: 'name',
  description: 'description',
  type: 'type',
  magnitude: 'magnitude',
  trigger: 'trigger',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.FriendScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  friendId: 'friendId',
  status: 'status',
  createdAt: 'createdAt',
  acceptedAt: 'acceptedAt'
};

exports.Prisma.ReactionScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  targetType: 'targetType',
  targetId: 'targetId',
  emoji: 'emoji',
  createdAt: 'createdAt'
};

exports.Prisma.DuelScalarFieldEnum = {
  id: 'id',
  initiatorId: 'initiatorId',
  receiverId: 'receiverId',
  categoryId: 'categoryId',
  status: 'status',
  initiatorScore: 'initiatorScore',
  receiverScore: 'receiverScore',
  winnerId: 'winnerId',
  createdAt: 'createdAt',
  expiresAt: 'expiresAt',
  completedAt: 'completedAt'
};

exports.Prisma.ChallengeScalarFieldEnum = {
  id: 'id',
  initiatorId: 'initiatorId',
  receiverId: 'receiverId',
  type: 'type',
  categoryId: 'categoryId',
  status: 'status',
  message: 'message',
  createdAt: 'createdAt',
  respondedAt: 'respondedAt',
  completedAt: 'completedAt',
  prompt: 'prompt',
  response: 'response',
  rewardKarma: 'rewardKarma',
  rewardXp: 'rewardXp'
};

exports.Prisma.GlobalEventScalarFieldEnum = {
  id: 'id',
  title: 'title',
  description: 'description',
  emoji: 'emoji',
  type: 'type',
  bonusType: 'bonusType',
  bonusValue: 'bonusValue',
  targetScope: 'targetScope',
  startAt: 'startAt',
  endAt: 'endAt',
  active: 'active',
  createdBy: 'createdBy',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.WeeklyChallengeScalarFieldEnum = {
  id: 'id',
  weekNumber: 'weekNumber',
  year: 'year',
  type: 'type',
  prompt: 'prompt',
  dareVariant: 'dareVariant',
  truthVariant: 'truthVariant',
  generationSource: 'generationSource',
  trendingTopics: 'trendingTopics',
  rewardXp: 'rewardXp',
  rewardKarma: 'rewardKarma',
  participantCount: 'participantCount',
  status: 'status',
  publishedAt: 'publishedAt',
  createdAt: 'createdAt'
};

exports.Prisma.WeeklyChallengeParticipationScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  challengeId: 'challengeId',
  response: 'response',
  submitted: 'submitted',
  submittedAt: 'submittedAt',
  rewardXp: 'rewardXp',
  rewardKarma: 'rewardKarma'
};

exports.Prisma.UserInsightScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  templateId: 'templateId',
  title: 'title',
  description: 'description',
  emoji: 'emoji',
  color: 'color',
  metrics: 'metrics',
  generatedAt: 'generatedAt',
  expiresAt: 'expiresAt'
};

exports.Prisma.DailyQuestScalarFieldEnum = {
  id: 'id',
  date: 'date',
  type: 'type',
  title: 'title',
  objective: 'objective',
  targetCount: 'targetCount',
  rewardXp: 'rewardXp',
  rewardGold: 'rewardGold',
  rewardItem: 'rewardItem',
  dropChance: 'dropChance',
  expiresAt: 'expiresAt',
  createdAt: 'createdAt'
};

exports.Prisma.QuestCompletionScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  questId: 'questId',
  progress: 'progress',
  completed: 'completed',
  itemDropped: 'itemDropped',
  completedAt: 'completedAt',
  createdAt: 'createdAt'
};

exports.Prisma.MarketListingScalarFieldEnum = {
  id: 'id',
  sellerId: 'sellerId',
  itemId: 'itemId',
  price: 'price',
  currencyKey: 'currencyKey',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  buyerId: 'buyerId'
};

exports.Prisma.GlobalPoolScalarFieldEnum = {
  id: 'id',
  poolType: 'poolType',
  goldAmount: 'goldAmount',
  diamondAmount: 'diamondAmount',
  updatedAt: 'updatedAt'
};

exports.Prisma.CraftingRecipeScalarFieldEnum = {
  id: 'id',
  name: 'name',
  description: 'description',
  inputItemIds: 'inputItemIds',
  outputItemId: 'outputItemId',
  goldCost: 'goldCost',
  requiresToken: 'requiresToken',
  rarityBoost: 'rarityBoost',
  successRate: 'successRate',
  craftingTime: 'craftingTime',
  unlockLevel: 'unlockLevel',
  createdAt: 'createdAt'
};

exports.Prisma.CraftingLogScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  recipeId: 'recipeId',
  inputItems: 'inputItems',
  outputItem: 'outputItem',
  success: 'success',
  goldSpent: 'goldSpent',
  rarityAchieved: 'rarityAchieved',
  statVariance: 'statVariance',
  craftedAt: 'craftedAt'
};

exports.Prisma.DailyQuizScalarFieldEnum = {
  id: 'id',
  date: 'date',
  questionIds: 'questionIds',
  rewardXp: 'rewardXp',
  rewardHearts: 'rewardHearts',
  completions: 'completions',
  createdAt: 'createdAt'
};

exports.Prisma.DailyQuizCompletionScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  quizId: 'quizId',
  score: 'score',
  completedAt: 'completedAt'
};

exports.Prisma.UserEnergyScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  hearts: 'hearts',
  maxHearts: 'maxHearts',
  lastRegenAt: 'lastRegenAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.GlobalFeedItemScalarFieldEnum = {
  id: 'id',
  type: 'type',
  title: 'title',
  description: 'description',
  userId: 'userId',
  metadata: 'metadata',
  reactionsCount: 'reactionsCount',
  createdAt: 'createdAt'
};

exports.Prisma.ProfileThemeScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  themeId: 'themeId',
  isActive: 'isActive',
  unlockedAt: 'unlockedAt',
  rarityId: 'rarityId'
};

exports.Prisma.WorldChronicleScalarFieldEnum = {
  id: 'id',
  seasonNumber: 'seasonNumber',
  seasonName: 'seasonName',
  startDate: 'startDate',
  endDate: 'endDate',
  title: 'title',
  summary: 'summary',
  fullChronicle: 'fullChronicle',
  totalPlayers: 'totalPlayers',
  totalXpEarned: 'totalXpEarned',
  totalChallenges: 'totalChallenges',
  totalMessages: 'totalMessages',
  topFaction: 'topFaction',
  topPlayer: 'topPlayer',
  topGroup: 'topGroup',
  worldStateStart: 'worldStateStart',
  worldStateEnd: 'worldStateEnd',
  generatedBy: 'generatedBy',
  generatedAt: 'generatedAt',
  isPublished: 'isPublished',
  publishedAt: 'publishedAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SeasonSummaryScalarFieldEnum = {
  id: 'id',
  chronicleId: 'chronicleId',
  category: 'category',
  title: 'title',
  content: 'content',
  highlights: 'highlights',
  stats: 'stats',
  order: 'order',
  createdAt: 'createdAt'
};

exports.Prisma.PlayerQuoteScalarFieldEnum = {
  id: 'id',
  chronicleId: 'chronicleId',
  userId: 'userId',
  quote: 'quote',
  context: 'context',
  sourceType: 'sourceType',
  sourceId: 'sourceId',
  isFeatured: 'isFeatured',
  createdAt: 'createdAt'
};

exports.Prisma.NarrativeQuestScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  title: 'title',
  intro: 'intro',
  context: 'context',
  generatedBy: 'generatedBy',
  aiModel: 'aiModel',
  prompt: 'prompt',
  status: 'status',
  completedAt: 'completedAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.NarrativeChoiceScalarFieldEnum = {
  id: 'id',
  questId: 'questId',
  step: 'step',
  prompt: 'prompt',
  option1: 'option1',
  option2: 'option2',
  option3: 'option3',
  option1Effect: 'option1Effect',
  option2Effect: 'option2Effect',
  option3Effect: 'option3Effect',
  selectedOption: 'selectedOption',
  selectedAt: 'selectedAt',
  createdAt: 'createdAt'
};

exports.Prisma.NarrativeOutcomeScalarFieldEnum = {
  id: 'id',
  questId: 'questId',
  conclusion: 'conclusion',
  karmaChange: 'karmaChange',
  prestigeChange: 'prestigeChange',
  xpReward: 'xpReward',
  goldReward: 'goldReward',
  archetypeShift: 'archetypeShift',
  itemsGranted: 'itemsGranted',
  createdAt: 'createdAt'
};

exports.Prisma.LoreEraScalarFieldEnum = {
  id: 'id',
  name: 'name',
  displayName: 'displayName',
  description: 'description',
  order: 'order',
  startYear: 'startYear',
  endYear: 'endYear',
  isActive: 'isActive',
  isCurrent: 'isCurrent',
  icon: 'icon',
  color: 'color',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.LoreEntryScalarFieldEnum = {
  id: 'id',
  title: 'title',
  slug: 'slug',
  summary: 'summary',
  content: 'content',
  eraId: 'eraId',
  author: 'author',
  publishedAt: 'publishedAt',
  category: 'category',
  importance: 'importance',
  relatedFactions: 'relatedFactions',
  relatedEvents: 'relatedEvents',
  relatedCharacters: 'relatedCharacters',
  isPublished: 'isPublished',
  isSecret: 'isSecret',
  viewCount: 'viewCount',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.LoreTagScalarFieldEnum = {
  id: 'id',
  entryId: 'entryId',
  tag: 'tag',
  createdAt: 'createdAt'
};

exports.Prisma.UserTimeZoneScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  timezone: 'timezone',
  utcOffset: 'utcOffset',
  detectedFrom: 'detectedFrom',
  localMidnight: 'localMidnight',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.RegionScheduleScalarFieldEnum = {
  id: 'id',
  region: 'region',
  timezone: 'timezone',
  dailyResetOffset: 'dailyResetOffset',
  quizResetOffset: 'quizResetOffset',
  energyResetOffset: 'energyResetOffset',
  nextDailyReset: 'nextDailyReset',
  nextQuizReset: 'nextQuizReset',
  nextEnergyReset: 'nextEnergyReset',
  updatedAt: 'updatedAt'
};

exports.Prisma.RegionalEventScalarFieldEnum = {
  id: 'id',
  name: 'name',
  description: 'description',
  region: 'region',
  country: 'country',
  startDate: 'startDate',
  endDate: 'endDate',
  timezone: 'timezone',
  eventType: 'eventType',
  theme: 'theme',
  rewardXp: 'rewardXp',
  rewardGold: 'rewardGold',
  rewardItems: 'rewardItems',
  isActive: 'isActive',
  isRecurring: 'isRecurring',
  recurrence: 'recurrence',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.RegionConfigScalarFieldEnum = {
  id: 'id',
  region: 'region',
  timezone: 'timezone',
  locale: 'locale',
  hasRegionalLeaderboard: 'hasRegionalLeaderboard',
  preferredThemes: 'preferredThemes',
  displayName: 'displayName',
  flagEmoji: 'flagEmoji',
  updatedAt: 'updatedAt'
};

exports.Prisma.CulturalItemScalarFieldEnum = {
  id: 'id',
  itemId: 'itemId',
  region: 'region',
  culture: 'culture',
  eventType: 'eventType',
  eventName: 'eventName',
  isSeasonalOnly: 'isSeasonalOnly',
  availableMonths: 'availableMonths',
  createdAt: 'createdAt'
};

exports.Prisma.LanguagePreferenceScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  locale: 'locale',
  fallbackLocale: 'fallbackLocale',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.TranslationKeyScalarFieldEnum = {
  id: 'id',
  key: 'key',
  namespace: 'namespace',
  en: 'en',
  cs: 'cs',
  de: 'de',
  fr: 'fr',
  es: 'es',
  jp: 'jp',
  context: 'context',
  isMissing: 'isMissing',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.EconomyStatScalarFieldEnum = {
  id: 'id',
  date: 'date',
  totalGold: 'totalGold',
  totalDiamonds: 'totalDiamonds',
  totalXp: 'totalXp',
  goldCreated: 'goldCreated',
  goldDestroyed: 'goldDestroyed',
  diamondsCreated: 'diamondsCreated',
  diamondsDestroyed: 'diamondsDestroyed',
  marketTransactions: 'marketTransactions',
  marketVolume: 'marketVolume',
  craftingVolume: 'craftingVolume',
  inflationRate: 'inflationRate',
  createdAt: 'createdAt'
};

exports.Prisma.TreasuryScalarFieldEnum = {
  id: 'id',
  gold: 'gold',
  diamonds: 'diamonds',
  taxCollected: 'taxCollected',
  donationsReceived: 'donationsReceived',
  eventsSpent: 'eventsSpent',
  projectsSpent: 'projectsSpent',
  lifetimeCollected: 'lifetimeCollected',
  lifetimeSpent: 'lifetimeSpent',
  updatedAt: 'updatedAt'
};

exports.Prisma.DynamicPriceScalarFieldEnum = {
  id: 'id',
  itemId: 'itemId',
  basePrice: 'basePrice',
  currentPrice: 'currentPrice',
  demand: 'demand',
  supply: 'supply',
  purchaseVolume: 'purchaseVolume',
  craftingVolume: 'craftingVolume',
  lastAdjustedAt: 'lastAdjustedAt',
  priceHistory: 'priceHistory',
  updatedAt: 'updatedAt'
};

exports.Prisma.TaxTransactionScalarFieldEnum = {
  id: 'id',
  sourceType: 'sourceType',
  sourceId: 'sourceId',
  amount: 'amount',
  taxAmount: 'taxAmount',
  taxRate: 'taxRate',
  currency: 'currency',
  userId: 'userId',
  createdAt: 'createdAt'
};

exports.Prisma.CreatorWalletScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  pendingBalance: 'pendingBalance',
  paidBalance: 'paidBalance',
  totalEarned: 'totalEarned',
  stripeAccountId: 'stripeAccountId',
  lastPayoutAt: 'lastPayoutAt',
  nextPayoutAt: 'nextPayoutAt',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.CreatorTransactionScalarFieldEnum = {
  id: 'id',
  walletId: 'walletId',
  type: 'type',
  amount: 'amount',
  sourceType: 'sourceType',
  sourceId: 'sourceId',
  payoutPoolId: 'payoutPoolId',
  stripeTransferId: 'stripeTransferId',
  description: 'description',
  metadata: 'metadata',
  createdAt: 'createdAt'
};

exports.Prisma.PayoutPoolScalarFieldEnum = {
  id: 'id',
  weekStart: 'weekStart',
  weekEnd: 'weekEnd',
  totalPool: 'totalPool',
  fromSubscriptions: 'fromSubscriptions',
  fromCosmetics: 'fromCosmetics',
  fromDonations: 'fromDonations',
  totalDistributed: 'totalDistributed',
  totalCreators: 'totalCreators',
  status: 'status',
  calculatedAt: 'calculatedAt',
  distributedAt: 'distributedAt',
  createdAt: 'createdAt'
};

exports.Prisma.EngagementMetricScalarFieldEnum = {
  id: 'id',
  contentType: 'contentType',
  contentId: 'contentId',
  creatorId: 'creatorId',
  userId: 'userId',
  type: 'type',
  value: 'value',
  weekStart: 'weekStart',
  fingerprint: 'fingerprint',
  createdAt: 'createdAt'
};

exports.Prisma.SubscriptionPlanScalarFieldEnum = {
  id: 'id',
  name: 'name',
  displayName: 'displayName',
  description: 'description',
  price: 'price',
  currency: 'currency',
  interval: 'interval',
  stripeProductId: 'stripeProductId',
  stripePriceId: 'stripePriceId',
  xpMultiplier: 'xpMultiplier',
  features: 'features',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.UserSubscriptionScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  planId: 'planId',
  stripeSubscriptionId: 'stripeSubscriptionId',
  stripeCustomerId: 'stripeCustomerId',
  status: 'status',
  startedAt: 'startedAt',
  renewsAt: 'renewsAt',
  cancelledAt: 'cancelledAt',
  expiresAt: 'expiresAt',
  trialEndsAt: 'trialEndsAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PaymentLogScalarFieldEnum = {
  id: 'id',
  subscriptionId: 'subscriptionId',
  userId: 'userId',
  amount: 'amount',
  currency: 'currency',
  status: 'status',
  stripePaymentIntentId: 'stripePaymentIntentId',
  stripeChargeId: 'stripeChargeId',
  description: 'description',
  metadata: 'metadata',
  failureReason: 'failureReason',
  refundedAt: 'refundedAt',
  createdAt: 'createdAt'
};

exports.Prisma.ReportScalarFieldEnum = {
  id: 'id',
  reporterId: 'reporterId',
  reportedUserId: 'reportedUserId',
  contentType: 'contentType',
  contentId: 'contentId',
  reason: 'reason',
  description: 'description',
  status: 'status',
  priority: 'priority',
  resolvedBy: 'resolvedBy',
  resolvedAt: 'resolvedAt',
  resolution: 'resolution',
  createdAt: 'createdAt'
};

exports.Prisma.ReputationScoreScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  score: 'score',
  reportsReceived: 'reportsReceived',
  reportsDismissed: 'reportsDismissed',
  positiveReactions: 'positiveReactions',
  negativeReactions: 'negativeReactions',
  challengesCompleted: 'challengesCompleted',
  helpfulVotes: 'helpfulVotes',
  trustLevel: 'trustLevel',
  isRestricted: 'isRestricted',
  canMessage: 'canMessage',
  canChallenge: 'canChallenge',
  canPost: 'canPost',
  updatedAt: 'updatedAt'
};

exports.Prisma.ModerationActionScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  moderatorId: 'moderatorId',
  actionType: 'actionType',
  reason: 'reason',
  duration: 'duration',
  reportId: 'reportId',
  isActive: 'isActive',
  expiresAt: 'expiresAt',
  revokedAt: 'revokedAt',
  revokedBy: 'revokedBy',
  isPublic: 'isPublic',
  createdAt: 'createdAt'
};

exports.Prisma.BlockedUserScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  blockedUserId: 'blockedUserId',
  reason: 'reason',
  createdAt: 'createdAt'
};

exports.Prisma.ContentReviewScalarFieldEnum = {
  id: 'id',
  contentType: 'contentType',
  contentId: 'contentId',
  content: 'content',
  flagged: 'flagged',
  confidence: 'confidence',
  categories: 'categories',
  reviewed: 'reviewed',
  reviewedBy: 'reviewedBy',
  reviewedAt: 'reviewedAt',
  approved: 'approved',
  createdAt: 'createdAt'
};

exports.Prisma.UserStreakScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  currentStreak: 'currentStreak',
  longestStreak: 'longestStreak',
  lastLoginAt: 'lastLoginAt',
  lastQuizAt: 'lastQuizAt',
  lastDuelAt: 'lastDuelAt',
  lastChallengeAt: 'lastChallengeAt',
  loginStreak: 'loginStreak',
  quizStreak: 'quizStreak',
  duelStreak: 'duelStreak',
  totalDaysActive: 'totalDaysActive',
  updatedAt: 'updatedAt'
};

exports.Prisma.RewardCalendarScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  calendarType: 'calendarType',
  day: 'day',
  rewardType: 'rewardType',
  rewardAmount: 'rewardAmount',
  rewardItemId: 'rewardItemId',
  claimed: 'claimed',
  claimedAt: 'claimedAt',
  cycleStart: 'cycleStart',
  createdAt: 'createdAt'
};

exports.Prisma.ReturnBonusScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  inactiveDays: 'inactiveDays',
  xpBonus: 'xpBonus',
  goldBonus: 'goldBonus',
  diamondBonus: 'diamondBonus',
  granted: 'granted',
  grantedAt: 'grantedAt',
  expiresAt: 'expiresAt',
  createdAt: 'createdAt'
};

exports.Prisma.FeedbackMoodScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  emoji: 'emoji',
  rating: 'rating',
  context: 'context',
  sessionId: 'sessionId',
  comment: 'comment',
  sentiment: 'sentiment',
  analyzed: 'analyzed',
  createdAt: 'createdAt'
};

exports.Prisma.DailySummaryScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  date: 'date',
  questionsAnswered: 'questionsAnswered',
  challengesSent: 'challengesSent',
  challengesReceived: 'challengesReceived',
  xpEarned: 'xpEarned',
  sessionCount: 'sessionCount',
  totalSessionTime: 'totalSessionTime',
  averageMood: 'averageMood',
  viewed: 'viewed',
  viewedAt: 'viewedAt',
  createdAt: 'createdAt'
};

exports.Prisma.BetaInviteScalarFieldEnum = {
  id: 'id',
  code: 'code',
  creatorId: 'creatorId',
  maxUses: 'maxUses',
  usedCount: 'usedCount',
  rewardsGranted: 'rewardsGranted',
  isActive: 'isActive',
  expiresAt: 'expiresAt',
  source: 'source',
  utmSource: 'utmSource',
  utmMedium: 'utmMedium',
  utmCampaign: 'utmCampaign',
  createdAt: 'createdAt'
};

exports.Prisma.ReferralScalarFieldEnum = {
  id: 'id',
  referrerId: 'referrerId',
  referredId: 'referredId',
  inviteId: 'inviteId',
  xpRewarded: 'xpRewarded',
  diamondsRewarded: 'diamondsRewarded',
  rewardsGranted: 'rewardsGranted',
  status: 'status',
  createdAt: 'createdAt',
  rewardedAt: 'rewardedAt'
};

exports.Prisma.BetaUserScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  inviteCode: 'inviteCode',
  wave: 'wave',
  firstLoginAt: 'firstLoginAt',
  lastActiveAt: 'lastActiveAt',
  onboardingComplete: 'onboardingComplete',
  referralsSent: 'referralsSent',
  referralsAccepted: 'referralsAccepted',
  joinedAt: 'joinedAt'
};

exports.Prisma.TelemetryEventScalarFieldEnum = {
  id: 'id',
  type: 'type',
  page: 'page',
  action: 'action',
  duration: 'duration',
  metadata: 'metadata',
  userAgent: 'userAgent',
  platform: 'platform',
  sessionId: 'sessionId',
  userId: 'userId',
  anonymousId: 'anonymousId',
  deviceType: 'deviceType',
  region: 'region',
  createdAt: 'createdAt'
};

exports.Prisma.TelemetryAggregateScalarFieldEnum = {
  id: 'id',
  date: 'date',
  type: 'type',
  count: 'count',
  avgDuration: 'avgDuration',
  p50Duration: 'p50Duration',
  p95Duration: 'p95Duration',
  p99Duration: 'p99Duration',
  errorRate: 'errorRate',
  context: 'context',
  metadata: 'metadata',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.UserPreferencesScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  soundEnabled: 'soundEnabled',
  soundVolume: 'soundVolume',
  levelUpSound: 'levelUpSound',
  purchaseSound: 'purchaseSound',
  challengeSound: 'challengeSound',
  notificationSound: 'notificationSound',
  ambientMusicEnabled: 'ambientMusicEnabled',
  ambientTheme: 'ambientTheme',
  animationsEnabled: 'animationsEnabled',
  reducedMotion: 'reducedMotion',
  particleEffects: 'particleEffects',
  backgroundAnimation: 'backgroundAnimation',
  transitionSpeed: 'transitionSpeed',
  glowEffects: 'glowEffects',
  shimmerEffects: 'shimmerEffects',
  confettiEnabled: 'confettiEnabled',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SoundAssetScalarFieldEnum = {
  id: 'id',
  assetId: 'assetId',
  name: 'name',
  description: 'description',
  filePath: 'filePath',
  fileSize: 'fileSize',
  duration: 'duration',
  category: 'category',
  eventType: 'eventType',
  defaultVolume: 'defaultVolume',
  loop: 'loop',
  isActive: 'isActive',
  createdAt: 'createdAt'
};

exports.Prisma.OnboardingProgressScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  sawWelcomeOverlay: 'sawWelcomeOverlay',
  sawDashboard: 'sawDashboard',
  completedAnswer: 'completedAnswer',
  completedCompare: 'completedCompare',
  completedChallenge: 'completedChallenge',
  completedTutorial: 'completedTutorial',
  tutorialStarted: 'tutorialStarted',
  tutorialStep: 'tutorialStep',
  tutorialCompleted: 'tutorialCompleted',
  tutorialReward: 'tutorialReward',
  tooltipsSeen: 'tooltipsSeen',
  showTooltips: 'showTooltips',
  skipOnboarding: 'skipOnboarding',
  startedAt: 'startedAt',
  completedAt: 'completedAt',
  lastStepAt: 'lastStepAt'
};

exports.Prisma.FeedbackSubmissionScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  type: 'type',
  category: 'category',
  title: 'title',
  description: 'description',
  page: 'page',
  userAgent: 'userAgent',
  screenshot: 'screenshot',
  priority: 'priority',
  status: 'status',
  adminNotes: 'adminNotes',
  respondedAt: 'respondedAt',
  respondedBy: 'respondedBy',
  submittedAt: 'submittedAt'
};

exports.Prisma.ErrorLogScalarFieldEnum = {
  id: 'id',
  errorType: 'errorType',
  message: 'message',
  stack: 'stack',
  page: 'page',
  userAgent: 'userAgent',
  userId: 'userId',
  sessionId: 'sessionId',
  buildId: 'buildId',
  environment: 'environment',
  severity: 'severity',
  frequency: 'frequency',
  firstSeen: 'firstSeen',
  lastSeen: 'lastSeen',
  status: 'status',
  assignedTo: 'assignedTo',
  metadata: 'metadata',
  resolved: 'resolved',
  resolvedAt: 'resolvedAt',
  resolvedBy: 'resolvedBy',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.TooltipDefinitionScalarFieldEnum = {
  id: 'id',
  tooltipId: 'tooltipId',
  title: 'title',
  description: 'description',
  icon: 'icon',
  page: 'page',
  elementId: 'elementId',
  position: 'position',
  showOnce: 'showOnce',
  priority: 'priority',
  delayMs: 'delayMs',
  minLevel: 'minLevel',
  maxLevel: 'maxLevel',
  requiresFlag: 'requiresFlag',
  isActive: 'isActive',
  createdAt: 'createdAt'
};

exports.Prisma.WorldCycleScalarFieldEnum = {
  id: 'id',
  cycleNumber: 'cycleNumber',
  cycleName: 'cycleName',
  startDate: 'startDate',
  endDate: 'endDate',
  duration: 'duration',
  finalHope: 'finalHope',
  finalChaos: 'finalChaos',
  finalCreativity: 'finalCreativity',
  finalKnowledge: 'finalKnowledge',
  finalHarmony: 'finalHarmony',
  dominantForce: 'dominantForce',
  totalPlayers: 'totalPlayers',
  totalXp: 'totalXp',
  threatsDefeated: 'threatsDefeated',
  eventsCompleted: 'eventsCompleted',
  topPlayerId: 'topPlayerId',
  topFactionId: 'topFactionId',
  topClanId: 'topClanId',
  unlockedFactions: 'unlockedFactions',
  unlockedResources: 'unlockedResources',
  unlockedEnvironments: 'unlockedEnvironments',
  status: 'status'
};

exports.Prisma.LegacyRecordScalarFieldEnum = {
  id: 'id',
  cycleId: 'cycleId',
  userId: 'userId',
  finalLevel: 'finalLevel',
  finalXp: 'finalXp',
  finalGold: 'finalGold',
  finalDiamonds: 'finalDiamonds',
  finalPrestige: 'finalPrestige',
  finalKarma: 'finalKarma',
  xpRank: 'xpRank',
  karmaRank: 'karmaRank',
  prestigeRank: 'prestigeRank',
  achievements: 'achievements',
  titles: 'titles',
  badges: 'badges',
  ascensionChoice: 'ascensionChoice',
  playTime: 'playTime',
  majorEvents: 'majorEvents',
  archivedAt: 'archivedAt'
};

exports.Prisma.UserLegacyBonusScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  bonusType: 'bonusType',
  prestigeCarry: 'prestigeCarry',
  legacyTitle: 'legacyTitle',
  xpBoostPercent: 'xpBoostPercent',
  mutation: 'mutation',
  artifactId: 'artifactId',
  artifactType: 'artifactType',
  earnedInCycle: 'earnedInCycle',
  isActive: 'isActive',
  createdAt: 'createdAt',
  expiresAt: 'expiresAt'
};

exports.Prisma.AbyssProgressScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  currentLayer: 'currentLayer',
  maxLayer: 'maxLayer',
  totalClears: 'totalClears',
  layerMultiplier: 'layerMultiplier',
  abyssTokens: 'abyssTokens',
  abyssArtifacts: 'abyssArtifacts',
  isActive: 'isActive',
  lastClear: 'lastClear'
};

exports.Prisma.WorldThreatScalarFieldEnum = {
  id: 'id',
  threatId: 'threatId',
  name: 'name',
  title: 'title',
  description: 'description',
  loreText: 'loreText',
  avatar: 'avatar',
  type: 'type',
  difficulty: 'difficulty',
  maxHealth: 'maxHealth',
  currentHealth: 'currentHealth',
  defense: 'defense',
  threatLevel: 'threatLevel',
  spawnedBy: 'spawnedBy',
  triggerMetrics: 'triggerMetrics',
  region: 'region',
  controlledBy: 'controlledBy',
  status: 'status',
  totalDamage: 'totalDamage',
  attackCount: 'attackCount',
  participantCount: 'participantCount',
  xpReward: 'xpReward',
  goldReward: 'goldReward',
  specialReward: 'specialReward',
  spawnedAt: 'spawnedAt',
  expiresAt: 'expiresAt',
  defeatedAt: 'defeatedAt',
  isPostedToFeed: 'isPostedToFeed'
};

exports.Prisma.ThreatBattleScalarFieldEnum = {
  id: 'id',
  threatId: 'threatId',
  userId: 'userId',
  factionId: 'factionId',
  attackType: 'attackType',
  damageDealt: 'damageDealt',
  isCritical: 'isCritical',
  attackerLevel: 'attackerLevel',
  attackerPrestige: 'attackerPrestige',
  randomFactor: 'randomFactor',
  xpGained: 'xpGained',
  goldGained: 'goldGained',
  rewardClaimed: 'rewardClaimed',
  attackedAt: 'attackedAt'
};

exports.Prisma.FactionTerritoryScalarFieldEnum = {
  id: 'id',
  territoryId: 'territoryId',
  name: 'name',
  description: 'description',
  region: 'region',
  mapPosition: 'mapPosition',
  controlledBy: 'controlledBy',
  controlStrength: 'controlStrength',
  xpBonus: 'xpBonus',
  goldBonus: 'goldBonus',
  resourceType: 'resourceType',
  isContested: 'isContested',
  contestStarted: 'contestStarted',
  lastCaptured: 'lastCaptured',
  captureCount: 'captureCount'
};

exports.Prisma.TerritoryContestScalarFieldEnum = {
  id: 'id',
  territoryId: 'territoryId',
  attackerFaction: 'attackerFaction',
  defenderFaction: 'defenderFaction',
  attackerScore: 'attackerScore',
  defenderScore: 'defenderScore',
  startTime: 'startTime',
  endTime: 'endTime',
  status: 'status',
  winnerId: 'winnerId',
  completedAt: 'completedAt'
};

exports.Prisma.FactionLegacyScalarFieldEnum = {
  id: 'id',
  factionId: 'factionId',
  name: 'name',
  title: 'title',
  description: 'description',
  color: 'color',
  secondaryColor: 'secondaryColor',
  emblem: 'emblem',
  pattern: 'pattern',
  glowEffect: 'glowEffect',
  moralAxis: 'moralAxis',
  orderAxis: 'orderAxis',
  philosophy: 'philosophy',
  xpBonus: 'xpBonus',
  goldBonus: 'goldBonus',
  karmaMultiplier: 'karmaMultiplier',
  specialAbility: 'specialAbility',
  memberCount: 'memberCount',
  totalXp: 'totalXp',
  avgKarma: 'avgKarma',
  avgPrestige: 'avgPrestige',
  hasCouncil: 'hasCouncil',
  councilSize: 'councilSize',
  votingPower: 'votingPower',
  lore: 'lore',
  motto: 'motto',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.FactionMemberScalarFieldEnum = {
  id: 'id',
  factionId: 'factionId',
  userId: 'userId',
  role: 'role',
  rank: 'rank',
  title: 'title',
  xpContributed: 'xpContributed',
  karmaContributed: 'karmaContributed',
  reputation: 'reputation',
  loyaltyScore: 'loyaltyScore',
  joinedAt: 'joinedAt',
  lastActive: 'lastActive',
  canSwitchAt: 'canSwitchAt',
  switchCount: 'switchCount'
};

exports.Prisma.FactionChangeLogScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  fromFactionId: 'fromFactionId',
  toFactionId: 'toFactionId',
  changeType: 'changeType',
  reason: 'reason',
  penaltyType: 'penaltyType',
  penaltyAmount: 'penaltyAmount',
  questCompleted: 'questCompleted',
  changedAt: 'changedAt'
};

exports.Prisma.FactionVoteScalarFieldEnum = {
  id: 'id',
  factionId: 'factionId',
  userId: 'userId',
  voteType: 'voteType',
  proposalId: 'proposalId',
  vote: 'vote',
  votingPower: 'votingPower',
  comment: 'comment',
  votedAt: 'votedAt'
};

exports.Prisma.FactionProposalScalarFieldEnum = {
  id: 'id',
  proposalId: 'proposalId',
  factionId: 'factionId',
  title: 'title',
  description: 'description',
  proposalType: 'proposalType',
  status: 'status',
  votesFor: 'votesFor',
  votesAgainst: 'votesAgainst',
  votesAbstain: 'votesAbstain',
  startTime: 'startTime',
  endTime: 'endTime',
  result: 'result',
  executedAt: 'executedAt',
  createdBy: 'createdBy',
  createdAt: 'createdAt'
};

exports.Prisma.MentorProfileScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  mentorName: 'mentorName',
  mentorAvatar: 'mentorAvatar',
  mentorTone: 'mentorTone',
  preferredTopics: 'preferredTopics',
  communicationStyle: 'communicationStyle',
  reminderFrequency: 'reminderFrequency',
  lastAnalyzedAt: 'lastAnalyzedAt',
  currentFocus: 'currentFocus',
  growthAreas: 'growthAreas',
  strengths: 'strengths',
  isEnabled: 'isEnabled',
  journalingEnabled: 'journalingEnabled',
  reflectionPrompts: 'reflectionPrompts',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.MentorLogScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  logType: 'logType',
  title: 'title',
  message: 'message',
  category: 'category',
  timeframe: 'timeframe',
  metrics: 'metrics',
  suggestions: 'suggestions',
  flowLinks: 'flowLinks',
  isRead: 'isRead',
  readAt: 'readAt',
  userRating: 'userRating',
  createdAt: 'createdAt'
};

exports.Prisma.InsightPromptScalarFieldEnum = {
  id: 'id',
  promptId: 'promptId',
  category: 'category',
  question: 'question',
  subtext: 'subtext',
  icon: 'icon',
  archetypes: 'archetypes',
  minLevel: 'minLevel',
  karmaRange: 'karmaRange',
  expectedWordCount: 'expectedWordCount',
  tags: 'tags',
  isActive: 'isActive',
  createdAt: 'createdAt'
};

exports.Prisma.ReflectionEntryScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  promptId: 'promptId',
  title: 'title',
  content: 'content',
  mood: 'mood',
  aiInsights: 'aiInsights',
  themes: 'themes',
  sentiment: 'sentiment',
  isPrivate: 'isPrivate',
  createdAt: 'createdAt',
  localeCode: 'localeCode'
};

exports.Prisma.WorldStateScalarFieldEnum = {
  id: 'id',
  timestamp: 'timestamp',
  hope: 'hope',
  chaos: 'chaos',
  creativity: 'creativity',
  knowledge: 'knowledge',
  harmony: 'harmony',
  overallAlignment: 'overallAlignment',
  dominantForce: 'dominantForce',
  totalPlayers: 'totalPlayers',
  activeEvents: 'activeEvents',
  dayNumber: 'dayNumber',
  hopeChange: 'hopeChange',
  chaosChange: 'chaosChange',
  creativityChange: 'creativityChange',
  knowledgeChange: 'knowledgeChange',
  harmonyChange: 'harmonyChange'
};

exports.Prisma.WorldVariableScalarFieldEnum = {
  id: 'id',
  stateId: 'stateId',
  variableName: 'variableName',
  value: 'value',
  category: 'category'
};

exports.Prisma.WorldEventScalarFieldEnum = {
  id: 'id',
  eventId: 'eventId',
  name: 'name',
  description: 'description',
  loreText: 'loreText',
  triggerType: 'triggerType',
  triggerConditions: 'triggerConditions',
  variableImpacts: 'variableImpacts',
  duration: 'duration',
  status: 'status',
  triggeredAt: 'triggeredAt',
  startsAt: 'startsAt',
  endsAt: 'endsAt',
  completedAt: 'completedAt',
  participantCount: 'participantCount',
  requiredActions: 'requiredActions',
  currentProgress: 'currentProgress',
  rewards: 'rewards',
  isPostedToFeed: 'isPostedToFeed'
};

exports.Prisma.WorldContributionScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  date: 'date',
  hopePoints: 'hopePoints',
  chaosPoints: 'chaosPoints',
  creativityPoints: 'creativityPoints',
  knowledgePoints: 'knowledgePoints',
  harmonyPoints: 'harmonyPoints',
  fromAnswers: 'fromAnswers',
  fromChallenges: 'fromChallenges',
  fromFlows: 'fromFlows',
  fromSocialActions: 'fromSocialActions'
};

exports.Prisma.NpcProfileScalarFieldEnum = {
  id: 'id',
  npcId: 'npcId',
  name: 'name',
  title: 'title',
  avatar: 'avatar',
  archetypeAffinity: 'archetypeAffinity',
  tone: 'tone',
  bio: 'bio',
  portraitUrl: 'portraitUrl',
  personality: 'personality',
  alignment: 'alignment',
  karmaAffinity: 'karmaAffinity',
  archetypeMatch: 'archetypeMatch',
  greetings: 'greetings',
  farewells: 'farewells',
  quirks: 'quirks',
  canGiveQuests: 'canGiveQuests',
  canGiveRewards: 'canGiveRewards',
  canGiveAdvice: 'canGiveAdvice',
  isActive: 'isActive',
  appearanceRate: 'appearanceRate',
  minLevel: 'minLevel',
  backstory: 'backstory',
  voice: 'voice',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.NpcInteractionScalarFieldEnum = {
  id: 'id',
  npcId: 'npcId',
  userId: 'userId',
  interactionType: 'interactionType',
  userArchetype: 'userArchetype',
  userKarma: 'userKarma',
  userPrestige: 'userPrestige',
  npcMessage: 'npcMessage',
  userResponse: 'userResponse',
  sentiment: 'sentiment',
  questOffered: 'questOffered',
  rewardGiven: 'rewardGiven',
  adviceGiven: 'adviceGiven',
  duration: 'duration',
  createdAt: 'createdAt'
};

exports.Prisma.NpcMemoryScalarFieldEnum = {
  id: 'id',
  npcId: 'npcId',
  userId: 'userId',
  memoryType: 'memoryType',
  key: 'key',
  value: 'value',
  importance: 'importance',
  lastAccessed: 'lastAccessed',
  accessCount: 'accessCount',
  createdAt: 'createdAt',
  expiresAt: 'expiresAt'
};

exports.Prisma.NpcAffinityScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  npcId: 'npcId',
  lastInteraction: 'lastInteraction',
  affinityScore: 'affinityScore',
  note: 'note',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.NPCDialogueScalarFieldEnum = {
  id: 'id',
  npcId: 'npcId',
  triggerType: 'triggerType',
  text: 'text',
  moodTag: 'moodTag',
  rarity: 'rarity',
  createdAt: 'createdAt'
};

exports.Prisma.NpcDialogueTreeScalarFieldEnum = {
  id: 'id',
  npcId: 'npcId',
  treeId: 'treeId',
  name: 'name',
  description: 'description',
  triggerType: 'triggerType',
  conditions: 'conditions',
  nodes: 'nodes',
  category: 'category',
  priority: 'priority',
  isActive: 'isActive',
  createdAt: 'createdAt'
};

exports.Prisma.RewardOfferScalarFieldEnum = {
  id: 'id',
  offerId: 'offerId',
  name: 'name',
  description: 'description',
  type: 'type',
  partnerId: 'partnerId',
  partnerName: 'partnerName',
  partnerLogo: 'partnerLogo',
  minPrestige: 'minPrestige',
  minLevel: 'minLevel',
  requiredBadges: 'requiredBadges',
  requiredTitles: 'requiredTitles',
  value: 'value',
  rewardCode: 'rewardCode',
  qrCodeUrl: 'qrCodeUrl',
  externalUrl: 'externalUrl',
  totalStock: 'totalStock',
  remainingStock: 'remainingStock',
  maxPerUser: 'maxPerUser',
  isActive: 'isActive',
  startsAt: 'startsAt',
  expiresAt: 'expiresAt',
  category: 'category',
  imageUrl: 'imageUrl',
  termsUrl: 'termsUrl',
  nftEnabled: 'nftEnabled',
  nftContract: 'nftContract',
  nftMetadata: 'nftMetadata',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.RewardRedemptionScalarFieldEnum = {
  id: 'id',
  offerId: 'offerId',
  userId: 'userId',
  redemptionCode: 'redemptionCode',
  qrCode: 'qrCode',
  status: 'status',
  verificationCode: 'verificationCode',
  verifiedAt: 'verifiedAt',
  verifiedBy: 'verifiedBy',
  redeemedAt: 'redeemedAt',
  expiresAt: 'expiresAt',
  nftMinted: 'nftMinted',
  nftTokenId: 'nftTokenId',
  nftTxHash: 'nftTxHash',
  metadata: 'metadata',
  notes: 'notes',
  createdAt: 'createdAt'
};

exports.Prisma.RewardProofScalarFieldEnum = {
  id: 'id',
  redemptionId: 'redemptionId',
  proofType: 'proofType',
  proofData: 'proofData',
  uploadedAt: 'uploadedAt',
  verifiedAt: 'verifiedAt',
  isVerified: 'isVerified'
};

exports.Prisma.PartnerAppScalarFieldEnum = {
  id: 'id',
  name: 'name',
  description: 'description',
  website: 'website',
  contactEmail: 'contactEmail',
  clientId: 'clientId',
  clientSecret: 'clientSecret',
  status: 'status',
  tier: 'tier',
  rateLimit: 'rateLimit',
  dailyLimit: 'dailyLimit',
  webhookUrl: 'webhookUrl',
  webhookSecret: 'webhookSecret',
  webhookEvents: 'webhookEvents',
  canEmbed: 'canEmbed',
  canAccessData: 'canAccessData',
  canCreateContent: 'canCreateContent',
  logoUrl: 'logoUrl',
  industry: 'industry',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  lastUsedAt: 'lastUsedAt'
};

exports.Prisma.PartnerApiKeyScalarFieldEnum = {
  id: 'id',
  partnerId: 'partnerId',
  keyHash: 'keyHash',
  keyPreview: 'keyPreview',
  name: 'name',
  scopes: 'scopes',
  isActive: 'isActive',
  expiresAt: 'expiresAt',
  lastUsedAt: 'lastUsedAt',
  usageCount: 'usageCount',
  createdAt: 'createdAt',
  revokedAt: 'revokedAt'
};

exports.Prisma.PartnerStatsScalarFieldEnum = {
  id: 'id',
  partnerId: 'partnerId',
  date: 'date',
  totalRequests: 'totalRequests',
  successRequests: 'successRequests',
  failedRequests: 'failedRequests',
  rateLimitHits: 'rateLimitHits',
  embedViews: 'embedViews',
  embedClicks: 'embedClicks',
  embedResponses: 'embedResponses',
  questionsServed: 'questionsServed',
  answersReceived: 'answersReceived',
  uniqueUsers: 'uniqueUsers',
  avgResponseTime: 'avgResponseTime',
  errorRate: 'errorRate'
};

exports.Prisma.PartnerWebhookScalarFieldEnum = {
  id: 'id',
  partnerId: 'partnerId',
  eventType: 'eventType',
  payload: 'payload',
  signature: 'signature',
  status: 'status',
  attempts: 'attempts',
  maxAttempts: 'maxAttempts',
  deliveredAt: 'deliveredAt',
  failedAt: 'failedAt',
  error: 'error',
  nextRetryAt: 'nextRetryAt',
  createdAt: 'createdAt'
};

exports.Prisma.PushSubscriptionScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  endpoint: 'endpoint',
  keys: 'keys',
  userAgent: 'userAgent',
  deviceType: 'deviceType',
  isEnabled: 'isEnabled',
  createdAt: 'createdAt',
  lastUsed: 'lastUsed'
};

exports.Prisma.OfflineActionScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  actionType: 'actionType',
  payload: 'payload',
  status: 'status',
  retryCount: 'retryCount',
  createdAt: 'createdAt',
  syncedAt: 'syncedAt',
  error: 'error'
};

exports.Prisma.PWAMetricsScalarFieldEnum = {
  id: 'id',
  date: 'date',
  installCount: 'installCount',
  uninstallCount: 'uninstallCount',
  activeInstalls: 'activeInstalls',
  mobileUsers: 'mobileUsers',
  tabletUsers: 'tabletUsers',
  desktopUsers: 'desktopUsers',
  pushSent: 'pushSent',
  pushDelivered: 'pushDelivered',
  pushClicked: 'pushClicked',
  offlineActions: 'offlineActions',
  syncedActions: 'syncedActions',
  failedActions: 'failedActions',
  avgLoadTime: 'avgLoadTime',
  cacheHitRate: 'cacheHitRate'
};

exports.Prisma.MiniEventScalarFieldEnum = {
  id: 'id',
  eventId: 'eventId',
  name: 'name',
  description: 'description',
  icon: 'icon',
  eventType: 'eventType',
  goalType: 'goalType',
  targetCount: 'targetCount',
  currentProgress: 'currentProgress',
  duration: 'duration',
  startTime: 'startTime',
  endTime: 'endTime',
  rewards: 'rewards',
  status: 'status',
  participantCount: 'participantCount',
  isSuccessful: 'isSuccessful',
  completedAt: 'completedAt',
  createdAt: 'createdAt'
};

exports.Prisma.MiniEventProgressScalarFieldEnum = {
  id: 'id',
  eventId: 'eventId',
  userId: 'userId',
  contribution: 'contribution',
  lastUpdate: 'lastUpdate',
  rewardsClaimed: 'rewardsClaimed',
  claimedAt: 'claimedAt'
};

exports.Prisma.MiniEventRewardScalarFieldEnum = {
  id: 'id',
  eventId: 'eventId',
  userId: 'userId',
  rewardType: 'rewardType',
  rewardId: 'rewardId',
  amount: 'amount',
  description: 'description',
  awardedAt: 'awardedAt'
};

exports.Prisma.CreatorProfileScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  displayName: 'displayName',
  bio: 'bio',
  avatar: 'avatar',
  bannerImage: 'bannerImage',
  isVerified: 'isVerified',
  badge: 'badge',
  tier: 'tier',
  totalFlows: 'totalFlows',
  totalEngagement: 'totalEngagement',
  totalEarnings: 'totalEarnings',
  followerCount: 'followerCount',
  revenueShare: 'revenueShare',
  goldPerPlay: 'goldPerPlay',
  isActive: 'isActive',
  allowComments: 'allowComments',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.CreatorFlowScalarFieldEnum = {
  id: 'id',
  creatorId: 'creatorId',
  title: 'title',
  description: 'description',
  coverImage: 'coverImage',
  difficulty: 'difficulty',
  category: 'category',
  tags: 'tags',
  questions: 'questions',
  questionCount: 'questionCount',
  status: 'status',
  approvedBy: 'approvedBy',
  approvedAt: 'approvedAt',
  publishedAt: 'publishedAt',
  rejectionReason: 'rejectionReason',
  playCount: 'playCount',
  completionCount: 'completionCount',
  avgRating: 'avgRating',
  ratingCount: 'ratingCount',
  xpReward: 'xpReward',
  goldReward: 'goldReward',
  isFeatured: 'isFeatured',
  isPremium: 'isPremium',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.CreatorFollowerScalarFieldEnum = {
  id: 'id',
  creatorId: 'creatorId',
  userId: 'userId',
  followedAt: 'followedAt'
};

exports.Prisma.CreatorRewardScalarFieldEnum = {
  id: 'id',
  creatorId: 'creatorId',
  flowId: 'flowId',
  type: 'type',
  amount: 'amount',
  source: 'source',
  description: 'description',
  earnedAt: 'earnedAt'
};

exports.Prisma.ClanScalarFieldEnum = {
  id: 'id',
  name: 'name',
  tag: 'tag',
  description: 'description',
  emblem: 'emblem',
  color: 'color',
  leaderId: 'leaderId',
  totalXp: 'totalXp',
  weeklyXp: 'weeklyXp',
  clanGold: 'clanGold',
  level: 'level',
  memberCount: 'memberCount',
  maxMembers: 'maxMembers',
  isPublic: 'isPublic',
  requireApproval: 'requireApproval',
  minLevel: 'minLevel',
  lastXpReset: 'lastXpReset',
  totalChestsEarned: 'totalChestsEarned',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ClanMemberScalarFieldEnum = {
  id: 'id',
  clanId: 'clanId',
  userId: 'userId',
  role: 'role',
  xpContributed: 'xpContributed',
  weeklyXpContributed: 'weeklyXpContributed',
  goldContributed: 'goldContributed',
  rank: 'rank',
  title: 'title',
  joinedAt: 'joinedAt',
  lastActive: 'lastActive'
};

exports.Prisma.ClanUpgradeScalarFieldEnum = {
  id: 'id',
  clanId: 'clanId',
  upgradeType: 'upgradeType',
  name: 'name',
  level: 'level',
  maxLevel: 'maxLevel',
  boostAmount: 'boostAmount',
  duration: 'duration',
  purchasedAt: 'purchasedAt',
  expiresAt: 'expiresAt'
};

exports.Prisma.ClanActivityScalarFieldEnum = {
  id: 'id',
  clanId: 'clanId',
  activityType: 'activityType',
  userId: 'userId',
  message: 'message',
  metadata: 'metadata',
  createdAt: 'createdAt'
};

exports.Prisma.SystemMetricScalarFieldEnum = {
  id: 'id',
  metricType: 'metricType',
  name: 'name',
  value: 'value',
  unit: 'unit',
  endpoint: 'endpoint',
  timestamp: 'timestamp'
};

exports.Prisma.HealthLogScalarFieldEnum = {
  id: 'id',
  checkType: 'checkType',
  status: 'status',
  message: 'message',
  responseTime: 'responseTime',
  metadata: 'metadata',
  checkedAt: 'checkedAt'
};

exports.Prisma.AutoHealLogScalarFieldEnum = {
  id: 'id',
  healType: 'healType',
  description: 'description',
  itemsAffected: 'itemsAffected',
  success: 'success',
  error: 'error',
  executedAt: 'executedAt'
};

exports.Prisma.CronJobLogScalarFieldEnum = {
  id: 'id',
  jobKey: 'jobKey',
  status: 'status',
  startedAt: 'startedAt',
  finishedAt: 'finishedAt',
  durationMs: 'durationMs',
  errorMessage: 'errorMessage'
};

exports.Prisma.ErrorAlertScalarFieldEnum = {
  id: 'id',
  severity: 'severity',
  source: 'source',
  message: 'message',
  stackTrace: 'stackTrace',
  metadata: 'metadata',
  notifiedAt: 'notifiedAt',
  resolvedAt: 'resolvedAt',
  isResolved: 'isResolved',
  createdAt: 'createdAt'
};

exports.Prisma.JobQueueScalarFieldEnum = {
  id: 'id',
  queueName: 'queueName',
  displayName: 'displayName',
  description: 'description',
  priority: 'priority',
  concurrency: 'concurrency',
  maxRetries: 'maxRetries',
  backoffStrategy: 'backoffStrategy',
  backoffDelay: 'backoffDelay',
  isEnabled: 'isEnabled',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.JobQueueMetricsScalarFieldEnum = {
  id: 'id',
  queueName: 'queueName',
  date: 'date',
  processed: 'processed',
  completed: 'completed',
  failed: 'failed',
  retried: 'retried',
  stalled: 'stalled',
  avgProcessTime: 'avgProcessTime',
  maxProcessTime: 'maxProcessTime',
  minProcessTime: 'minProcessTime',
  processedPerSec: 'processedPerSec',
  failureRate: 'failureRate'
};

exports.Prisma.JobFailureScalarFieldEnum = {
  id: 'id',
  queueName: 'queueName',
  jobId: 'jobId',
  jobName: 'jobName',
  payload: 'payload',
  error: 'error',
  stackTrace: 'stackTrace',
  attempts: 'attempts',
  maxRetries: 'maxRetries',
  willRetry: 'willRetry',
  nextRetryAt: 'nextRetryAt',
  failedAt: 'failedAt',
  resolvedAt: 'resolvedAt',
  isResolved: 'isResolved'
};

exports.Prisma.CacheConfigScalarFieldEnum = {
  id: 'id',
  key: 'key',
  name: 'name',
  description: 'description',
  ttlSeconds: 'ttlSeconds',
  isEnabled: 'isEnabled',
  strategy: 'strategy',
  invalidateOn: 'invalidateOn',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.CacheMetricsScalarFieldEnum = {
  id: 'id',
  cacheKey: 'cacheKey',
  endpoint: 'endpoint',
  hitCount: 'hitCount',
  missCount: 'missCount',
  avgHitTime: 'avgHitTime',
  avgMissTime: 'avgMissTime',
  lastHitAt: 'lastHitAt',
  lastMissAt: 'lastMissAt',
  date: 'date'
};

exports.Prisma.AchievementCollectionScalarFieldEnum = {
  id: 'id',
  collectionId: 'collectionId',
  name: 'name',
  description: 'description',
  theme: 'theme',
  icon: 'icon',
  rarity: 'rarity',
  titleReward: 'titleReward',
  xpReward: 'xpReward',
  goldReward: 'goldReward',
  diamondReward: 'diamondReward',
  auraUnlock: 'auraUnlock',
  themeUnlock: 'themeUnlock',
  isSeasonal: 'isSeasonal',
  seasonType: 'seasonType',
  isEvent: 'isEvent',
  eventId: 'eventId',
  availableFrom: 'availableFrom',
  availableUntil: 'availableUntil',
  isActive: 'isActive',
  createdAt: 'createdAt'
};

exports.Prisma.AchievementCollectionMemberScalarFieldEnum = {
  id: 'id',
  collectionId: 'collectionId',
  achievementId: 'achievementId',
  sortOrder: 'sortOrder'
};

exports.Prisma.UserAchievementCollectionScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  collectionId: 'collectionId',
  progress: 'progress',
  totalRequired: 'totalRequired',
  isCompleted: 'isCompleted',
  completedAt: 'completedAt',
  rewardClaimed: 'rewardClaimed',
  claimedAt: 'claimedAt'
};

exports.Prisma.ThemePackScalarFieldEnum = {
  id: 'id',
  themeId: 'themeId',
  name: 'name',
  description: 'description',
  type: 'type',
  rarity: 'rarity',
  isSeasonal: 'isSeasonal',
  seasonType: 'seasonType',
  gradientConfig: 'gradientConfig',
  particleConfig: 'particleConfig',
  animationConfig: 'animationConfig',
  unlockLevel: 'unlockLevel',
  unlockCondition: 'unlockCondition',
  goldCost: 'goldCost',
  diamondCost: 'diamondCost',
  vipOnly: 'vipOnly',
  isActive: 'isActive',
  availableFrom: 'availableFrom',
  availableUntil: 'availableUntil',
  createdAt: 'createdAt'
};

exports.Prisma.UserThemeSettingsScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  autoSeasonalTheme: 'autoSeasonalTheme',
  preferredThemeId: 'preferredThemeId',
  lastAutoSwitchAt: 'lastAutoSwitchAt'
};

exports.Prisma.ArchetypeScalarFieldEnum = {
  key: 'key',
  name: 'name',
  description: 'description',
  baseStats: 'baseStats',
  growthRates: 'growthRates',
  emoji: 'emoji',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  fusionWith: 'fusionWith',
  fusionResult: 'fusionResult',
  fusionCost: 'fusionCost',
  fusionVisual: 'fusionVisual'
};

exports.Prisma.UserArchetypeFusionScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  baseA: 'baseA',
  baseB: 'baseB',
  result: 'result',
  createdAt: 'createdAt'
};

exports.Prisma.UserArchetypeHistoryScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  previousType: 'previousType',
  newType: 'newType',
  reason: 'reason',
  statSnapshot: 'statSnapshot',
  xpBonus: 'xpBonus',
  evolvedAt: 'evolvedAt'
};

exports.Prisma.AvatarLayerScalarFieldEnum = {
  id: 'id',
  layerType: 'layerType',
  name: 'name',
  description: 'description',
  rarity: 'rarity',
  unlockLevel: 'unlockLevel',
  unlockCondition: 'unlockCondition',
  goldCost: 'goldCost',
  diamondCost: 'diamondCost',
  imageUrl: 'imageUrl',
  zIndex: 'zIndex',
  createdAt: 'createdAt'
};

exports.Prisma.UserAvatarItemScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  layerId: 'layerId',
  unlockedAt: 'unlockedAt'
};

exports.Prisma.UserAvatarScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  equippedLayers: 'equippedLayers',
  presetName: 'presetName',
  updatedAt: 'updatedAt'
};

exports.Prisma.DuelSpectatorScalarFieldEnum = {
  id: 'id',
  duelId: 'duelId',
  userId: 'userId',
  joinedAt: 'joinedAt',
  reactedAt: 'reactedAt'
};

exports.Prisma.DuelHighlightScalarFieldEnum = {
  id: 'id',
  duelId: 'duelId',
  initiatorName: 'initiatorName',
  receiverName: 'receiverName',
  scoreDiff: 'scoreDiff',
  finalScore: 'finalScore',
  category: 'category',
  isTopOfDay: 'isTopOfDay',
  viewCount: 'viewCount',
  reactionsCount: 'reactionsCount',
  createdAt: 'createdAt'
};

exports.Prisma.CoopMissionScalarFieldEnum = {
  id: 'id',
  type: 'type',
  title: 'title',
  description: 'description',
  questionIds: 'questionIds',
  minMembers: 'minMembers',
  maxMembers: 'maxMembers',
  rewardXp: 'rewardXp',
  rewardGold: 'rewardGold',
  timeLimit: 'timeLimit',
  requiresSync: 'requiresSync',
  status: 'status',
  createdBy: 'createdBy',
  startedAt: 'startedAt',
  completedAt: 'completedAt',
  expiresAt: 'expiresAt',
  createdAt: 'createdAt'
};

exports.Prisma.CoopMemberScalarFieldEnum = {
  id: 'id',
  missionId: 'missionId',
  userId: 'userId',
  role: 'role',
  joinedAt: 'joinedAt',
  isReady: 'isReady'
};

exports.Prisma.CoopProgressScalarFieldEnum = {
  id: 'id',
  missionId: 'missionId',
  questionId: 'questionId',
  userId: 'userId',
  answer: 'answer',
  confirmed: 'confirmed',
  submittedAt: 'submittedAt'
};

exports.Prisma.TotemBattleScalarFieldEnum = {
  id: 'id',
  weekNumber: 'weekNumber',
  year: 'year',
  groupAId: 'groupAId',
  groupBId: 'groupBId',
  phase: 'phase',
  scoreA: 'scoreA',
  scoreB: 'scoreB',
  winnerId: 'winnerId',
  startAt: 'startAt',
  endAt: 'endAt',
  rewardEmblem: 'rewardEmblem',
  rewardXp: 'rewardXp',
  createdAt: 'createdAt'
};

exports.Prisma.TotemBattleResultScalarFieldEnum = {
  id: 'id',
  battleId: 'battleId',
  groupId: 'groupId',
  finalScore: 'finalScore',
  memberCount: 'memberCount',
  avgLevel: 'avgLevel',
  xpGained: 'xpGained',
  challengesCompleted: 'challengesCompleted',
  ranking: 'ranking',
  rewardsJson: 'rewardsJson',
  createdAt: 'createdAt'
};

exports.Prisma.GroupMemberScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  groupId: 'groupId',
  role: 'role',
  joinedAt: 'joinedAt'
};

exports.Prisma.GroupActivityScalarFieldEnum = {
  id: 'id',
  groupId: 'groupId',
  userId: 'userId',
  type: 'type',
  message: 'message',
  metadata: 'metadata',
  createdAt: 'createdAt'
};

exports.Prisma.FlowScalarFieldEnum = {
  id: 'id',
  name: 'name',
  description: 'description',
  createdAt: 'createdAt',
  metadata: 'metadata'
};

exports.Prisma.FlowStepScalarFieldEnum = {
  id: 'id',
  flowId: 'flowId',
  questionVersionId: 'questionVersionId',
  order: 'order',
  section: 'section',
  branchCondition: 'branchCondition',
  randomGroup: 'randomGroup',
  isOptional: 'isOptional',
  metadata: 'metadata'
};

exports.Prisma.FlowStepLinkScalarFieldEnum = {
  id: 'id',
  fromStepId: 'fromStepId',
  toStepId: 'toStepId',
  condition: 'condition'
};

exports.Prisma.FlowProgressScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  flowId: 'flowId',
  currentStepId: 'currentStepId',
  startedAt: 'startedAt',
  updatedAt: 'updatedAt',
  completedAt: 'completedAt'
};

exports.Prisma.AnswerScalarFieldEnum = {
  id: 'id',
  sessionId: 'sessionId',
  stepId: 'stepId',
  questionVersionId: 'questionVersionId',
  value: 'value',
  createdAt: 'createdAt'
};

exports.Prisma.LanguageScalarFieldEnum = {
  id: 'id',
  code: 'code',
  name: 'name'
};

exports.Prisma.VersionScalarFieldEnum = {
  id: 'id',
  name: 'name',
  value: 'value',
  createdAt: 'createdAt'
};

exports.Prisma.CategoryScalarFieldEnum = {
  id: 'id',
  name: 'name'
};

exports.Prisma.SubCategoryScalarFieldEnum = {
  id: 'id',
  name: 'name',
  categoryId: 'categoryId'
};

exports.Prisma.SubSubCategoryScalarFieldEnum = {
  id: 'id',
  name: 'name',
  subCategoryId: 'subCategoryId'
};

exports.Prisma.SssCategoryScalarFieldEnum = {
  id: 'id',
  name: 'name',
  subSubCategoryId: 'subSubCategoryId',
  status: 'status',
  generatedAt: 'generatedAt',
  error: 'error',
  review: 'review',
  finalText: 'finalText',
  responseType: 'responseType',
  outcome: 'outcome',
  multiplication: 'multiplication',
  difficulty: 'difficulty',
  ageCategory: 'ageCategory',
  gender: 'gender',
  author: 'author',
  wildcard: 'wildcard'
};

exports.Prisma.UserQuestionScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  questionId: 'questionId',
  questionTemplateId: 'questionTemplateId',
  status: 'status',
  servedAt: 'servedAt',
  answeredAt: 'answeredAt',
  archetypeContext: 'archetypeContext',
  moodContext: 'moodContext',
  seasonId: 'seasonId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.QuestionTemplateScalarFieldEnum = {
  id: 'id',
  category: 'category',
  archetypeAffinity: 'archetypeAffinity',
  tone: 'tone',
  text: 'text',
  tags: 'tags',
  weight: 'weight',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.BattleAchievementScalarFieldEnum = {
  id: 'id',
  key: 'key',
  title: 'title',
  description: 'description',
  triggerType: 'triggerType',
  thresholdValue: 'thresholdValue',
  rewardXP: 'rewardXP',
  rewardBadgeId: 'rewardBadgeId',
  rarity: 'rarity',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.UserBattleAchievementScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  achievementId: 'achievementId',
  progress: 'progress',
  isUnlocked: 'isUnlocked',
  isClaimed: 'isClaimed',
  unlockedAt: 'unlockedAt',
  claimedAt: 'claimedAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.GroupScalarFieldEnum = {
  id: 'id',
  name: 'name',
  emblem: 'emblem',
  motto: 'motto',
  ownerId: 'ownerId',
  description: 'description',
  visibility: 'visibility',
  transparency: 'transparency',
  maxMembers: 'maxMembers',
  totalXp: 'totalXp',
  avgKarma: 'avgKarma',
  avgPrestige: 'avgPrestige',
  cost: 'cost',
  weeklyBonus: 'weeklyBonus',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.GroupStatScalarFieldEnum = {
  id: 'id',
  groupId: 'groupId',
  totalXP: 'totalXP',
  reflections: 'reflections',
  avgLevel: 'avgLevel',
  updatedAt: 'updatedAt'
};

exports.Prisma.UserGroupScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  groupId: 'groupId'
};

exports.Prisma.PublicPollScalarFieldEnum = {
  id: 'id',
  title: 'title',
  question: 'question',
  options: 'options',
  region: 'region',
  visibility: 'visibility',
  creatorId: 'creatorId',
  allowFreetext: 'allowFreetext',
  premiumCost: 'premiumCost',
  rewardXP: 'rewardXP',
  createdAt: 'createdAt',
  expiresAt: 'expiresAt'
};

exports.Prisma.PollResponseScalarFieldEnum = {
  id: 'id',
  pollId: 'pollId',
  userId: 'userId',
  optionIdx: 'optionIdx',
  freetext: 'freetext',
  region: 'region',
  createdAt: 'createdAt'
};

exports.Prisma.PublicChallengeScalarFieldEnum = {
  id: 'id',
  title: 'title',
  description: 'description',
  region: 'region',
  rewardXP: 'rewardXP',
  rewardItem: 'rewardItem',
  activeFrom: 'activeFrom',
  activeTo: 'activeTo',
  isActive: 'isActive',
  createdAt: 'createdAt'
};

exports.Prisma.ContentPackScalarFieldEnum = {
  id: 'id',
  key: 'key',
  title: 'title',
  description: 'description',
  category: 'category',
  price: 'price',
  premiumOnly: 'premiumOnly',
  isActive: 'isActive',
  themeColor: 'themeColor',
  icon: 'icon',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PackItemScalarFieldEnum = {
  id: 'id',
  packId: 'packId',
  type: 'type',
  refId: 'refId',
  data: 'data',
  createdAt: 'createdAt'
};

exports.Prisma.UserPackScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  packId: 'packId',
  unlockedAt: 'unlockedAt'
};

exports.Prisma.FiresideScalarFieldEnum = {
  id: 'id',
  title: 'title',
  creatorId: 'creatorId',
  participantIds: 'participantIds',
  expiresAt: 'expiresAt',
  isActive: 'isActive',
  createdAt: 'createdAt'
};

exports.Prisma.FiresideReactionScalarFieldEnum = {
  id: 'id',
  firesideId: 'firesideId',
  userId: 'userId',
  emoji: 'emoji',
  createdAt: 'createdAt'
};

exports.Prisma.MemoryJournalScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  title: 'title',
  summary: 'summary',
  content: 'content',
  periodStart: 'periodStart',
  periodEnd: 'periodEnd',
  sourceCount: 'sourceCount',
  createdAt: 'createdAt'
};

exports.Prisma.ComparisonCardScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  statsJson: 'statsJson',
  funText: 'funText',
  imageUrl: 'imageUrl',
  generatedAt: 'generatedAt',
  autoGenerated: 'autoGenerated'
};

exports.Prisma.MicroMissionScalarFieldEnum = {
  id: 'id',
  key: 'key',
  title: 'title',
  description: 'description',
  type: 'type',
  rarity: 'rarity',
  durationSec: 'durationSec',
  rewardXP: 'rewardXP',
  rewardItem: 'rewardItem',
  rewardGold: 'rewardGold',
  skipCostFood: 'skipCostFood',
  skipCostGold: 'skipCostGold',
  skipCostPremium: 'skipCostPremium',
  isActive: 'isActive',
  createdAt: 'createdAt'
};

exports.Prisma.UserMicroMissionScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  missionId: 'missionId',
  status: 'status',
  startedAt: 'startedAt',
  completedAt: 'completedAt'
};

exports.Prisma.AvatarMoodScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  mood: 'mood',
  pose: 'pose',
  emotionScore: 'emotionScore',
  source: 'source',
  updatedAt: 'updatedAt'
};

exports.Prisma.GlobalMoodScalarFieldEnum = {
  id: 'id',
  calmScore: 'calmScore',
  chaosScore: 'chaosScore',
  neutralScore: 'neutralScore',
  updatedAt: 'updatedAt',
  dominantMood: 'dominantMood',
  worldModifier: 'worldModifier'
};

exports.Prisma.UserMoodLogScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  reflectionId: 'reflectionId',
  mood: 'mood',
  loggedAt: 'loggedAt'
};

exports.Prisma.MoodPresetScalarFieldEnum = {
  key: 'key',
  title: 'title',
  description: 'description',
  toneProfile: 'toneProfile',
  createdAt: 'createdAt',
  isActive: 'isActive'
};

exports.Prisma.MentorNPCScalarFieldEnum = {
  id: 'id',
  key: 'key',
  name: 'name',
  archetypeAffinity: 'archetypeAffinity',
  personality: 'personality',
  introText: 'introText',
  tips: 'tips',
  voiceTone: 'voiceTone',
  isActive: 'isActive',
  createdAt: 'createdAt'
};

exports.Prisma.UserMentorScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  mentorId: 'mentorId',
  affinityScore: 'affinityScore',
  lastInteractionAt: 'lastInteractionAt'
};

exports.Prisma.SeasonStorylineScalarFieldEnum = {
  id: 'id',
  key: 'key',
  title: 'title',
  description: 'description',
  startDate: 'startDate',
  endDate: 'endDate',
  isActive: 'isActive',
  xpBonus: 'xpBonus',
  goldBonus: 'goldBonus',
  eventModifier: 'eventModifier',
  npcIds: 'npcIds',
  themeColor: 'themeColor',
  posterUrl: 'posterUrl',
  createdAt: 'createdAt'
};

exports.Prisma.StorylineAchievementScalarFieldEnum = {
  id: 'id',
  seasonId: 'seasonId',
  title: 'title',
  description: 'description',
  rewardItem: 'rewardItem',
  rewardXP: 'rewardXP',
  createdAt: 'createdAt'
};

exports.Prisma.WalletScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  tenantId: 'tenantId',
  funds: 'funds',
  diamonds: 'diamonds',
  badgesClaimedCount: 'badgesClaimedCount'
};

exports.Prisma.LedgerEntryScalarFieldEnum = {
  id: 'id',
  walletId: 'walletId',
  tenantId: 'tenantId',
  kind: 'kind',
  amount: 'amount',
  refType: 'refType',
  refId: 'refId',
  note: 'note',
  createdAt: 'createdAt',
  currencyId: 'currencyId'
};

exports.Prisma.ProductScalarFieldEnum = {
  id: 'id',
  slug: 'slug',
  title: 'title',
  description: 'description',
  kind: 'kind',
  payload: 'payload',
  stackable: 'stackable',
  active: 'active',
  createdAt: 'createdAt'
};

exports.Prisma.PriceScalarFieldEnum = {
  id: 'id',
  productId: 'productId',
  stripePriceId: 'stripePriceId',
  currencyCode: 'currencyCode',
  unitAmount: 'unitAmount',
  active: 'active'
};

exports.Prisma.PurchaseScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  tenantId: 'tenantId',
  productId: 'productId',
  quantity: 'quantity',
  totalMinor: 'totalMinor',
  status: 'status',
  extRef: 'extRef',
  createdAt: 'createdAt'
};

exports.Prisma.EntitlementScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  tenantId: 'tenantId',
  productId: 'productId',
  meta: 'meta',
  createdAt: 'createdAt'
};

exports.Prisma.SubscriptionScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  stripeSubId: 'stripeSubId',
  plan: 'plan',
  status: 'status',
  currentPeriodEnd: 'currentPeriodEnd',
  perks: 'perks',
  createdAt: 'createdAt'
};

exports.Prisma.UserProfileScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  equippedAvatarId: 'equippedAvatarId',
  equippedBackgroundId: 'equippedBackgroundId',
  equippedSkinId: 'equippedSkinId',
  updatedAt: 'updatedAt'
};

exports.Prisma.BadgeScalarFieldEnum = {
  id: 'id',
  key: 'key',
  name: 'name',
  description: 'description',
  icon: 'icon',
  rarity: 'rarity',
  unlockType: 'unlockType',
  requirementValue: 'requirementValue',
  rewardType: 'rewardType',
  rewardValue: 'rewardValue',
  seasonId: 'seasonId',
  isActive: 'isActive',
  createdAt: 'createdAt',
  slug: 'slug',
  title: 'title',
  active: 'active',
  rarityId: 'rarityId'
};

exports.Prisma.UserBadgeScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  badgeId: 'badgeId',
  unlockedAt: 'unlockedAt',
  claimedAt: 'claimedAt',
  isClaimed: 'isClaimed',
  createdAt: 'createdAt'
};

exports.Prisma.FailedLoginAttemptScalarFieldEnum = {
  id: 'id',
  ipAddress: 'ipAddress',
  email: 'email',
  createdAt: 'createdAt'
};

exports.Prisma.PasswordResetScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  token: 'token',
  expiresAt: 'expiresAt',
  createdAt: 'createdAt'
};

exports.Prisma.EmailVerifyScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  token: 'token',
  expiresAt: 'expiresAt',
  createdAt: 'createdAt'
};

exports.Prisma.AuditLogScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  ip: 'ip',
  action: 'action',
  meta: 'meta',
  createdAt: 'createdAt'
};

exports.Prisma.GenerationBatchScalarFieldEnum = {
  id: 'id',
  createdAt: 'createdAt',
  startedAt: 'startedAt',
  finishedAt: 'finishedAt',
  status: 'status',
  language: 'language',
  targetCount: 'targetCount',
  processed: 'processed',
  succeeded: 'succeeded',
  failed: 'failed',
  note: 'note'
};

exports.Prisma.GenerationJobScalarFieldEnum = {
  id: 'id',
  createdAt: 'createdAt',
  startedAt: 'startedAt',
  finishedAt: 'finishedAt',
  status: 'status',
  error: 'error',
  language: 'language',
  sssCategoryId: 'sssCategoryId',
  batchId: 'batchId',
  aiLogId: 'aiLogId',
  moderatorNotes: 'moderatorNotes',
  moderatorScore: 'moderatorScore',
  moderatorStatus: 'moderatorStatus',
  moderatorUserId: 'moderatorUserId',
  qualityScore: 'qualityScore',
  retryCount: 'retryCount',
  weightScore: 'weightScore'
};

exports.Prisma.AIResponseLogScalarFieldEnum = {
  id: 'id',
  createdAt: 'createdAt',
  prompt: 'prompt',
  response: 'response',
  tokensIn: 'tokensIn',
  tokensOut: 'tokensOut',
  model: 'model'
};

exports.Prisma.AccountScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  type: 'type',
  provider: 'provider',
  providerAccountId: 'providerAccountId',
  refresh_token: 'refresh_token',
  access_token: 'access_token',
  expires_at: 'expires_at',
  token_type: 'token_type',
  scope: 'scope',
  id_token: 'id_token',
  session_state: 'session_state'
};

exports.Prisma.SessionScalarFieldEnum = {
  id: 'id',
  sessionToken: 'sessionToken',
  userId: 'userId',
  expires: 'expires'
};

exports.Prisma.VerificationTokenScalarFieldEnum = {
  identifier: 'identifier',
  token: 'token',
  expires: 'expires'
};

exports.Prisma.UserSubmissionScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  type: 'type',
  status: 'status',
  title: 'title',
  content: 'content',
  description: 'description',
  categoryId: 'categoryId',
  languageId: 'languageId',
  tags: 'tags',
  imageUrl: 'imageUrl',
  metadata: 'metadata',
  upvotes: 'upvotes',
  downvotes: 'downvotes',
  score: 'score',
  moderatorId: 'moderatorId',
  moderatorNote: 'moderatorNote',
  reviewedAt: 'reviewedAt',
  approvedAt: 'approvedAt',
  rejectedAt: 'rejectedAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.EventScalarFieldEnum = {
  id: 'id',
  title: 'title',
  description: 'description',
  type: 'type',
  status: 'status',
  startDate: 'startDate',
  endDate: 'endDate',
  rewardXP: 'rewardXP',
  rewardDiamonds: 'rewardDiamonds',
  imageUrl: 'imageUrl',
  metadata: 'metadata',
  participants: 'participants',
  creatorId: 'creatorId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  localeCode: 'localeCode',
  isFlagged: 'isFlagged',
  flagReason: 'flagReason',
  visibility: 'visibility'
};

exports.Prisma.VoteScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  sessionId: 'sessionId',
  submissionId: 'submissionId',
  voteType: 'voteType',
  createdAt: 'createdAt'
};

exports.Prisma.SeasonScalarFieldEnum = {
  id: 'id',
  name: 'name',
  displayName: 'displayName',
  number: 'number',
  startDate: 'startDate',
  endDate: 'endDate',
  status: 'status',
  metadata: 'metadata',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SeasonArchiveScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  seasonId: 'seasonId',
  finalXP: 'finalXP',
  finalCoins: 'finalCoins',
  finalRank: 'finalRank',
  finalKarma: 'finalKarma',
  achievements: 'achievements',
  createdAt: 'createdAt'
};

exports.Prisma.CosmeticItemScalarFieldEnum = {
  id: 'id',
  slug: 'slug',
  name: 'name',
  description: 'description',
  type: 'type',
  rarity: 'rarity',
  price: 'price',
  imageUrl: 'imageUrl',
  metadata: 'metadata',
  active: 'active',
  seasonOnly: 'seasonOnly',
  seasonId: 'seasonId',
  createdAt: 'createdAt',
  rarityId: 'rarityId'
};

exports.Prisma.UserCosmeticScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  cosmeticId: 'cosmeticId',
  equipped: 'equipped',
  purchasedAt: 'purchasedAt'
};

exports.Prisma.SeasonalEventScalarFieldEnum = {
  id: 'id',
  title: 'title',
  description: 'description',
  startDate: 'startDate',
  endDate: 'endDate',
  bonusType: 'bonusType',
  bonusValue: 'bonusValue',
  status: 'status',
  metadata: 'metadata',
  createdAt: 'createdAt'
};

exports.Prisma.MirrorEventScalarFieldEnum = {
  id: 'id',
  key: 'key',
  title: 'title',
  description: 'description',
  theme: 'theme',
  startDate: 'startDate',
  endDate: 'endDate',
  active: 'active',
  questionSet: 'questionSet',
  rewardXP: 'rewardXP',
  rewardBadgeId: 'rewardBadgeId',
  createdAt: 'createdAt'
};

exports.Prisma.WildcardEventScalarFieldEnum = {
  id: 'id',
  title: 'title',
  description: 'description',
  triggerType: 'triggerType',
  rewardXP: 'rewardXP',
  rewardKarma: 'rewardKarma',
  flavorText: 'flavorText',
  createdAt: 'createdAt'
};

exports.Prisma.UserWildcardEventScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  wildcardId: 'wildcardId',
  redeemed: 'redeemed',
  redeemedAt: 'redeemedAt',
  createdAt: 'createdAt'
};

exports.Prisma.ShareCardScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  type: 'type',
  imageUrl: 'imageUrl',
  caption: 'caption',
  createdAt: 'createdAt',
  expiresAt: 'expiresAt'
};

exports.Prisma.PosterCardScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  title: 'title',
  statsJson: 'statsJson',
  imageUrl: 'imageUrl',
  isShared: 'isShared',
  createdAt: 'createdAt'
};

exports.Prisma.DreamEventScalarFieldEnum = {
  id: 'id',
  title: 'title',
  description: 'description',
  triggerType: 'triggerType',
  effect: 'effect',
  flavorTone: 'flavorTone',
  createdAt: 'createdAt',
  isActive: 'isActive'
};

exports.Prisma.UserDreamEventScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  dreamId: 'dreamId',
  resolved: 'resolved',
  resolvedAt: 'resolvedAt',
  createdAt: 'createdAt'
};

exports.Prisma.GenerationRecordScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  generationNumber: 'generationNumber',
  prestigeId: 'prestigeId',
  inheritedPerks: 'inheritedPerks',
  summaryText: 'summaryText',
  createdAt: 'createdAt'
};

exports.Prisma.FeedbackScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  message: 'message',
  screenshotUrl: 'screenshotUrl',
  context: 'context',
  status: 'status',
  createdAt: 'createdAt',
  reviewedAt: 'reviewedAt',
  reviewedBy: 'reviewedBy'
};

exports.Prisma.CreatorPackScalarFieldEnum = {
  id: 'id',
  creatorId: 'creatorId',
  title: 'title',
  description: 'description',
  type: 'type',
  status: 'status',
  metadata: 'metadata',
  createdAt: 'createdAt',
  approvedAt: 'approvedAt',
  approvedBy: 'approvedBy',
  rewardType: 'rewardType',
  rewardValue: 'rewardValue',
  publishedAt: 'publishedAt',
  downloadsCount: 'downloadsCount'
};

exports.Prisma.UserCreatedPackScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  packId: 'packId',
  isPublished: 'isPublished',
  earnedRewards: 'earnedRewards',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ItemRecipeScalarFieldEnum = {
  id: 'id',
  itemId: 'itemId',
  ingredients: 'ingredients',
  craftTime: 'craftTime',
  xpReward: 'xpReward',
  discoveredBy: 'discoveredBy',
  createdAt: 'createdAt'
};

exports.Prisma.ItemDiscoveryScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  itemId: 'itemId',
  discoveredAt: 'discoveredAt'
};

exports.Prisma.UserReflectionScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  date: 'date',
  type: 'type',
  content: 'content',
  summary: 'summary',
  sentiment: 'sentiment',
  stats: 'stats',
  metadata: 'metadata',
  mirrorEventId: 'mirrorEventId',
  createdAt: 'createdAt'
};

exports.Prisma.ReflectionConversationScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  reflectionId: 'reflectionId',
  prompt: 'prompt',
  response: 'response',
  toneLevel: 'toneLevel',
  modelUsed: 'modelUsed',
  createdAt: 'createdAt'
};

exports.Prisma.UserStatsScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  totalXP: 'totalXP',
  totalCoins: 'totalCoins',
  totalKarma: 'totalKarma',
  questionsCount: 'questionsCount',
  streakDays: 'streakDays',
  currentRank: 'currentRank',
  lastWeekXP: 'lastWeekXP',
  lastWeekCoins: 'lastWeekCoins',
  lastWeekKarma: 'lastWeekKarma',
  lastWeekQuestions: 'lastWeekQuestions',
  lastWeekStreak: 'lastWeekStreak',
  rankChange: 'rankChange',
  metadata: 'metadata',
  updatedAt: 'updatedAt',
  createdAt: 'createdAt'
};

exports.Prisma.UserWeeklyStatsScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  weekStart: 'weekStart',
  weekEnd: 'weekEnd',
  xpGain: 'xpGain',
  coinsGain: 'coinsGain',
  karmaGain: 'karmaGain',
  questionsCount: 'questionsCount',
  streakDays: 'streakDays',
  rankChange: 'rankChange',
  metadata: 'metadata',
  createdAt: 'createdAt'
};

exports.Prisma.ChronicleScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  type: 'type',
  summaryText: 'summaryText',
  statsJson: 'statsJson',
  quote: 'quote',
  generatedAt: 'generatedAt',
  seasonId: 'seasonId'
};

exports.Prisma.RegionScalarFieldEnum = {
  id: 'id',
  key: 'key',
  name: 'name',
  description: 'description',
  orderIndex: 'orderIndex',
  buffType: 'buffType',
  buffValue: 'buffValue',
  unlockRequirementType: 'unlockRequirementType',
  unlockRequirementValue: 'unlockRequirementValue',
  isActive: 'isActive',
  createdAt: 'createdAt'
};

exports.Prisma.UserRegionScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  regionId: 'regionId',
  isUnlocked: 'isUnlocked',
  visitedAt: 'visitedAt',
  activeBuff: 'activeBuff',
  lastTravelAt: 'lastTravelAt'
};

exports.Prisma.QuestScalarFieldEnum = {
  id: 'id',
  key: 'key',
  title: 'title',
  description: 'description',
  type: 'type',
  requirementType: 'requirementType',
  requirementValue: 'requirementValue',
  rewardXP: 'rewardXP',
  rewardGold: 'rewardGold',
  rewardItem: 'rewardItem',
  rewardBadge: 'rewardBadge',
  rewardKarma: 'rewardKarma',
  isRepeatable: 'isRepeatable',
  isActive: 'isActive',
  createdAt: 'createdAt'
};

exports.Prisma.UserQuestScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  questId: 'questId',
  progress: 'progress',
  isCompleted: 'isCompleted',
  isClaimed: 'isClaimed',
  startedAt: 'startedAt',
  completedAt: 'completedAt'
};

exports.Prisma.UserLoreEntryScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  sourceType: 'sourceType',
  sourceId: 'sourceId',
  tone: 'tone',
  text: 'text',
  createdAt: 'createdAt'
};

exports.Prisma.FriendshipScalarFieldEnum = {
  id: 'id',
  userA: 'userA',
  userB: 'userB',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SocialDuelScalarFieldEnum = {
  id: 'id',
  challengerId: 'challengerId',
  opponentId: 'opponentId',
  status: 'status',
  challengeType: 'challengeType',
  rewardXP: 'rewardXP',
  winnerId: 'winnerId',
  createdAt: 'createdAt'
};

exports.Prisma.SharedMissionScalarFieldEnum = {
  id: 'id',
  missionKey: 'missionKey',
  participants: 'participants',
  status: 'status',
  rewardXP: 'rewardXP',
  createdAt: 'createdAt',
  completedAt: 'completedAt'
};

exports.Prisma.CurrencyScalarFieldEnum = {
  id: 'id',
  key: 'key',
  name: 'name',
  symbol: 'symbol',
  exchangeRate: 'exchangeRate',
  isPremium: 'isPremium',
  createdAt: 'createdAt'
};

exports.Prisma.UserWalletScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  currencyKey: 'currencyKey',
  balance: 'balance',
  updatedAt: 'updatedAt'
};

exports.Prisma.MarketItemScalarFieldEnum = {
  id: 'id',
  name: 'name',
  description: 'description',
  price: 'price',
  currencyKey: 'currencyKey',
  rarity: 'rarity',
  category: 'category',
  stock: 'stock',
  isEventItem: 'isEventItem',
  createdAt: 'createdAt'
};

exports.Prisma.TransactionScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  itemId: 'itemId',
  type: 'type',
  amount: 'amount',
  currencyKey: 'currencyKey',
  note: 'note',
  createdAt: 'createdAt'
};

exports.Prisma.BalanceSettingScalarFieldEnum = {
  id: 'id',
  key: 'key',
  value: 'value',
  updatedAt: 'updatedAt'
};

exports.Prisma.EconomyPresetScalarFieldEnum = {
  id: 'id',
  name: 'name',
  description: 'description',
  modifiers: 'modifiers',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SystemAlertScalarFieldEnum = {
  id: 'id',
  type: 'type',
  level: 'level',
  message: 'message',
  metadata: 'metadata',
  createdAt: 'createdAt',
  resolvedAt: 'resolvedAt',
  autoResolved: 'autoResolved'
};

exports.Prisma.AlertWebhookScalarFieldEnum = {
  id: 'id',
  name: 'name',
  url: 'url',
  isActive: 'isActive',
  type: 'type',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.MetaSeasonScalarFieldEnum = {
  id: 'id',
  key: 'key',
  title: 'title',
  description: 'description',
  startDate: 'startDate',
  endDate: 'endDate',
  isActive: 'isActive',
  createdAt: 'createdAt'
};

exports.Prisma.PrestigeRecordScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  seasonId: 'seasonId',
  oldLevel: 'oldLevel',
  legacyXP: 'legacyXP',
  prestigeCount: 'prestigeCount',
  rewardBadgeId: 'rewardBadgeId',
  prestigeTitle: 'prestigeTitle',
  prestigeBadgeId: 'prestigeBadgeId',
  prestigeColorTheme: 'prestigeColorTheme',
  createdAt: 'createdAt'
};

exports.Prisma.TrendingQuestionScalarFieldEnum = {
  id: 'id',
  questionId: 'questionId',
  region: 'region',
  windowStart: 'windowStart',
  windowEnd: 'windowEnd',
  reactions24h: 'reactions24h',
  score: 'score',
  updatedAt: 'updatedAt'
};

exports.Prisma.CombatSessionScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  heroHp: 'heroHp',
  heroMaxHp: 'heroMaxHp',
  enemyHp: 'enemyHp',
  enemyMaxHp: 'enemyMaxHp',
  enemyName: 'enemyName',
  enemyType: 'enemyType',
  xpGained: 'xpGained',
  goldGained: 'goldGained',
  kills: 'kills',
  currentStreak: 'currentStreak',
  isActive: 'isActive',
  lastActionAt: 'lastActionAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PublicComparisonScalarFieldEnum = {
  id: 'id',
  question: 'question',
  answers: 'answers',
  isPublic: 'isPublic',
  reactionsLike: 'reactionsLike',
  reactionsLaugh: 'reactionsLaugh',
  reactionsThink: 'reactionsThink',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.NullableJsonNullValueInput = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull
};

exports.Prisma.JsonNullValueInput = {
  JsonNull: Prisma.JsonNull
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.JsonNullValueFilter = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
  AnyNull: Prisma.AnyNull
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};
exports.UserVisibility = exports.$Enums.UserVisibility = {
  PUBLIC: 'PUBLIC',
  FRIENDS: 'FRIENDS',
  PRIVATE: 'PRIVATE'
};

exports.UserRole = exports.$Enums.UserRole = {
  USER: 'USER',
  ADMIN: 'ADMIN',
  MOD: 'MOD',
  DEVOPS: 'DEVOPS'
};

exports.Lang = exports.$Enums.Lang = {
  en: 'en',
  cs: 'cs'
};

exports.TaskStatus = exports.$Enums.TaskStatus = {
  NEW: 'NEW',
  ROUTED: 'ROUTED',
  IN_PROGRESS: 'IN_PROGRESS',
  DONE: 'DONE',
  BLOCKED: 'BLOCKED'
};

exports.TaskSource = exports.$Enums.TaskSource = {
  WEB: 'WEB',
  EMAIL: 'EMAIL',
  API: 'API'
};

exports.AssigneeType = exports.$Enums.AssigneeType = {
  AUTO: 'AUTO',
  VA: 'VA'
};

exports.AuthorType = exports.$Enums.AuthorType = {
  USER: 'USER',
  VA: 'VA',
  SYSTEM: 'SYSTEM'
};

exports.WorkflowTrigger = exports.$Enums.WorkflowTrigger = {
  KEYWORD: 'KEYWORD',
  FORM: 'FORM',
  API: 'API'
};

exports.WorkflowAction = exports.$Enums.WorkflowAction = {
  GOOGLE_SEARCH: 'GOOGLE_SEARCH',
  WEB_SCRAPE: 'WEB_SCRAPE',
  DOC_SUMMARY: 'DOC_SUMMARY',
  CUSTOM: 'CUSTOM'
};

exports.RunStatus = exports.$Enums.RunStatus = {
  QUEUED: 'QUEUED',
  RUNNING: 'RUNNING',
  SUCCEEDED: 'SUCCEEDED',
  FAILED: 'FAILED'
};

exports.IntegrationType = exports.$Enums.IntegrationType = {
  GMAIL: 'GMAIL',
  SLACK: 'SLACK',
  WEBHOOK: 'WEBHOOK'
};

exports.QuestionSource = exports.$Enums.QuestionSource = {
  ai: 'ai',
  user: 'user',
  import: 'import'
};

exports.ContentVisibility = exports.$Enums.ContentVisibility = {
  PUBLIC: 'PUBLIC',
  HIDDEN: 'HIDDEN'
};

exports.TagType = exports.$Enums.TagType = {
  tone: 'tone',
  content: 'content'
};

exports.QuestionType = exports.$Enums.QuestionType = {
  SINGLE_CHOICE: 'SINGLE_CHOICE',
  MULTI_CHOICE: 'MULTI_CHOICE',
  RANGE: 'RANGE',
  NUMBER: 'NUMBER',
  TEXT: 'TEXT'
};

exports.UserSynchTestStatus = exports.$Enums.UserSynchTestStatus = {
  pending: 'pending',
  completed: 'completed',
  expired: 'expired'
};

exports.FactionBuffType = exports.$Enums.FactionBuffType = {
  xp: 'xp',
  gold: 'gold',
  luck: 'luck',
  karma: 'karma',
  custom: 'custom'
};

exports.RegionScope = exports.$Enums.RegionScope = {
  global: 'global',
  regional: 'regional'
};

exports.CreationType = exports.$Enums.CreationType = {
  question: 'question',
  mission: 'mission',
  item: 'item',
  other: 'other'
};

exports.CreationStatus = exports.$Enums.CreationStatus = {
  pending: 'pending',
  approved: 'approved',
  rejected: 'rejected'
};

exports.PostcardStatus = exports.$Enums.PostcardStatus = {
  pending: 'pending',
  delivered: 'delivered',
  read: 'read',
  deleted: 'deleted'
};

exports.ForkRarity = exports.$Enums.ForkRarity = {
  common: 'common',
  rare: 'rare',
  special: 'special'
};

exports.ForkChoice = exports.$Enums.ForkChoice = {
  A: 'A',
  B: 'B'
};

exports.DuetRunType = exports.$Enums.DuetRunType = {
  reflect: 'reflect',
  collect: 'collect',
  challenge: 'challenge'
};

exports.DuetRunStatus = exports.$Enums.DuetRunStatus = {
  pending: 'pending',
  active: 'active',
  completed: 'completed',
  expired: 'expired'
};

exports.RitualTimeOfDay = exports.$Enums.RitualTimeOfDay = {
  morning: 'morning',
  evening: 'evening',
  any: 'any'
};

exports.MicroClanBuffType = exports.$Enums.MicroClanBuffType = {
  xp: 'xp',
  gold: 'gold',
  karma: 'karma',
  compare: 'compare',
  reflect: 'reflect'
};

exports.LootTrigger = exports.$Enums.LootTrigger = {
  reflection: 'reflection',
  mission: 'mission',
  comparison: 'comparison',
  levelup: 'levelup',
  random: 'random'
};

exports.LootRewardType = exports.$Enums.LootRewardType = {
  xp: 'xp',
  gold: 'gold',
  item: 'item',
  cosmetic: 'cosmetic',
  emote: 'emote'
};

exports.LootRarity = exports.$Enums.LootRarity = {
  common: 'common',
  rare: 'rare',
  epic: 'epic',
  legendary: 'legendary'
};

exports.CulturalFilterSeverity = exports.$Enums.CulturalFilterSeverity = {
  info: 'info',
  warn: 'warn',
  block: 'block'
};

exports.ModerationContentType = exports.$Enums.ModerationContentType = {
  QUESTION: 'QUESTION',
  EVENT: 'EVENT',
  COMMENT: 'COMMENT'
};

exports.ActivityType = exports.$Enums.ActivityType = {
  reflection: 'reflection',
  question: 'question',
  quest: 'quest',
  badge: 'badge',
  achievement: 'achievement',
  social: 'social',
  system: 'system',
  other: 'other'
};

exports.NotificationType = exports.$Enums.NotificationType = {
  REFLECTION: 'REFLECTION',
  LIKE: 'LIKE',
  COMMENT: 'COMMENT',
  SYSTEM: 'SYSTEM'
};

exports.ArchetypeAffinity = exports.$Enums.ArchetypeAffinity = {
  thinker: 'thinker',
  trickster: 'trickster',
  guardian: 'guardian',
  wanderer: 'wanderer',
  chaos: 'chaos'
};

exports.NPCTone = exports.$Enums.NPCTone = {
  serious: 'serious',
  sarcastic: 'sarcastic',
  poetic: 'poetic',
  neutral: 'neutral'
};

exports.DialogueTriggerType = exports.$Enums.DialogueTriggerType = {
  greeting: 'greeting',
  quest: 'quest',
  reflection: 'reflection',
  event: 'event',
  random: 'random'
};

exports.DialogueRarity = exports.$Enums.DialogueRarity = {
  common: 'common',
  rare: 'rare',
  epic: 'epic'
};

exports.CronJobStatus = exports.$Enums.CronJobStatus = {
  success: 'success',
  error: 'error'
};

exports.QuestionTemplateCategory = exports.$Enums.QuestionTemplateCategory = {
  daily: 'daily',
  weekly: 'weekly',
  archetype: 'archetype',
  event: 'event',
  wildcard: 'wildcard'
};

exports.QuestionTone = exports.$Enums.QuestionTone = {
  serious: 'serious',
  poetic: 'poetic',
  chaotic: 'chaotic',
  funny: 'funny'
};

exports.BattleAchievementTriggerType = exports.$Enums.BattleAchievementTriggerType = {
  duelWin: 'duelWin',
  duelLose: 'duelLose',
  missionComplete: 'missionComplete',
  event: 'event'
};

exports.BattleAchievementRarity = exports.$Enums.BattleAchievementRarity = {
  common: 'common',
  rare: 'rare',
  epic: 'epic',
  legendary: 'legendary'
};

exports.GlobalMoodType = exports.$Enums.GlobalMoodType = {
  calm: 'calm',
  chaos: 'chaos',
  neutral: 'neutral'
};

exports.LedgerKind = exports.$Enums.LedgerKind = {
  CREDIT: 'CREDIT',
  DEBIT: 'DEBIT'
};

exports.ProductKind = exports.$Enums.ProductKind = {
  CURRENCY_PACK: 'CURRENCY_PACK',
  COSMETIC: 'COSMETIC'
};

exports.PurchaseStatus = exports.$Enums.PurchaseStatus = {
  PENDING: 'PENDING',
  SUCCEEDED: 'SUCCEEDED',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED'
};

exports.BadgeRarity = exports.$Enums.BadgeRarity = {
  common: 'common',
  rare: 'rare',
  epic: 'epic',
  legendary: 'legendary',
  mythic: 'mythic',
  eternal: 'eternal'
};

exports.BadgeUnlockType = exports.$Enums.BadgeUnlockType = {
  level: 'level',
  event: 'event',
  season: 'season',
  special: 'special'
};

exports.BadgeRewardType = exports.$Enums.BadgeRewardType = {
  currency: 'currency',
  item: 'item',
  title: 'title'
};

exports.BatchStatus = exports.$Enums.BatchStatus = {
  PENDING: 'PENDING',
  RUNNING: 'RUNNING',
  DONE: 'DONE',
  FAILED: 'FAILED',
  PAUSED: 'PAUSED'
};

exports.JobStatus = exports.$Enums.JobStatus = {
  PENDING: 'PENDING',
  RUNNING: 'RUNNING',
  DONE: 'DONE',
  FAILED: 'FAILED'
};

exports.SubmissionType = exports.$Enums.SubmissionType = {
  QUESTION: 'QUESTION',
  PACK: 'PACK',
  EVENT: 'EVENT'
};

exports.SubmissionStatus = exports.$Enums.SubmissionStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  FLAGGED: 'FLAGGED'
};

exports.EventType = exports.$Enums.EventType = {
  CHALLENGE: 'CHALLENGE',
  THEMED_WEEK: 'THEMED_WEEK',
  SPOTLIGHT: 'SPOTLIGHT',
  COMMUNITY: 'COMMUNITY'
};

exports.EventStatus = exports.$Enums.EventStatus = {
  DRAFT: 'DRAFT',
  ACTIVE: 'ACTIVE',
  UPCOMING: 'UPCOMING',
  ENDED: 'ENDED',
  CANCELLED: 'CANCELLED'
};

exports.VoteType = exports.$Enums.VoteType = {
  UPVOTE: 'UPVOTE',
  DOWNVOTE: 'DOWNVOTE'
};

exports.SeasonStatus = exports.$Enums.SeasonStatus = {
  UPCOMING: 'UPCOMING',
  ACTIVE: 'ACTIVE',
  ENDED: 'ENDED',
  ARCHIVED: 'ARCHIVED'
};

exports.CosmeticType = exports.$Enums.CosmeticType = {
  ICON: 'ICON',
  TITLE: 'TITLE',
  BACKGROUND: 'BACKGROUND',
  BADGE: 'BADGE',
  FRAME: 'FRAME'
};

exports.CosmeticRarity = exports.$Enums.CosmeticRarity = {
  COMMON: 'COMMON',
  UNCOMMON: 'UNCOMMON',
  RARE: 'RARE',
  EPIC: 'EPIC',
  LEGENDARY: 'LEGENDARY'
};

exports.SeasonalEventStatus = exports.$Enums.SeasonalEventStatus = {
  INACTIVE: 'INACTIVE',
  ACTIVE: 'ACTIVE',
  ENDED: 'ENDED'
};

exports.FeedbackStatus = exports.$Enums.FeedbackStatus = {
  NEW: 'NEW',
  REVIEWED: 'REVIEWED',
  RESOLVED: 'RESOLVED'
};

exports.CreatorPackType = exports.$Enums.CreatorPackType = {
  POLL: 'POLL',
  REFLECTION: 'REFLECTION',
  MISSION: 'MISSION'
};

exports.CreatorPackStatus = exports.$Enums.CreatorPackStatus = {
  DRAFT: 'DRAFT',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED'
};

exports.CreatorRewardType = exports.$Enums.CreatorRewardType = {
  xp: 'xp',
  gold: 'gold',
  diamonds: 'diamonds',
  badge: 'badge'
};

exports.ReflectionType = exports.$Enums.ReflectionType = {
  DAILY: 'DAILY',
  WEEKLY: 'WEEKLY',
  MONTHLY: 'MONTHLY',
  MILESTONE: 'MILESTONE'
};

exports.ChronicleType = exports.$Enums.ChronicleType = {
  weekly: 'weekly',
  seasonal: 'seasonal'
};

exports.RegionBuffType = exports.$Enums.RegionBuffType = {
  xp: 'xp',
  gold: 'gold',
  mood: 'mood',
  reflection: 'reflection'
};

exports.UnlockRequirementType = exports.$Enums.UnlockRequirementType = {
  level: 'level',
  task: 'task',
  gold: 'gold',
  achievement: 'achievement'
};

exports.QuestType = exports.$Enums.QuestType = {
  daily: 'daily',
  weekly: 'weekly',
  story: 'story',
  side: 'side'
};

exports.QuestRequirementType = exports.$Enums.QuestRequirementType = {
  xp: 'xp',
  reflections: 'reflections',
  gold: 'gold',
  missions: 'missions',
  custom: 'custom'
};

exports.LoreSourceType = exports.$Enums.LoreSourceType = {
  reflection: 'reflection',
  quest: 'quest',
  item: 'item',
  event: 'event',
  system: 'system'
};

exports.LoreTone = exports.$Enums.LoreTone = {
  serious: 'serious',
  comedic: 'comedic',
  poetic: 'poetic'
};

exports.FriendshipStatus = exports.$Enums.FriendshipStatus = {
  pending: 'pending',
  accepted: 'accepted',
  blocked: 'blocked'
};

exports.DuelStatus = exports.$Enums.DuelStatus = {
  pending: 'pending',
  active: 'active',
  completed: 'completed',
  expired: 'expired'
};

exports.ChallengeType = exports.$Enums.ChallengeType = {
  xp: 'xp',
  reflection: 'reflection',
  random: 'random',
  poll: 'poll'
};

exports.SharedMissionStatus = exports.$Enums.SharedMissionStatus = {
  active: 'active',
  completed: 'completed',
  expired: 'expired'
};

exports.ItemCategory = exports.$Enums.ItemCategory = {
  item: 'item',
  cosmetic: 'cosmetic',
  booster: 'booster'
};

exports.TransactionType = exports.$Enums.TransactionType = {
  purchase: 'purchase',
  reward: 'reward',
  gift: 'gift',
  refund: 'refund'
};

exports.SystemAlertType = exports.$Enums.SystemAlertType = {
  cron: 'cron',
  api: 'api',
  db: 'db',
  cache: 'cache',
  memory: 'memory',
  cpu: 'cpu'
};

exports.SystemAlertLevel = exports.$Enums.SystemAlertLevel = {
  info: 'info',
  warn: 'warn',
  error: 'error',
  critical: 'critical'
};

exports.WebhookType = exports.$Enums.WebhookType = {
  discord: 'discord',
  slack: 'slack',
  generic: 'generic'
};

exports.Prisma.ModelName = {
  User: 'User',
  Affinity: 'Affinity',
  Org: 'Org',
  Membership: 'Membership',
  Task: 'Task',
  Attachment: 'Attachment',
  TaskMessage: 'TaskMessage',
  Workflow: 'Workflow',
  Run: 'Run',
  Integration: 'Integration',
  Question: 'Question',
  QuestionVersion: 'QuestionVersion',
  QuestionTag: 'QuestionTag',
  QuestionVersionTag: 'QuestionVersionTag',
  QuestionGeneration: 'QuestionGeneration',
  FlowQuestion: 'FlowQuestion',
  FlowQuestionOption: 'FlowQuestionOption',
  UserResponse: 'UserResponse',
  SynchTest: 'SynchTest',
  UserSynchTest: 'UserSynchTest',
  Faction: 'Faction',
  FactionInfluence: 'FactionInfluence',
  UserFaction: 'UserFaction',
  CommunityCreation: 'CommunityCreation',
  CommunityCreationLike: 'CommunityCreationLike',
  Postcard: 'Postcard',
  RarityTier: 'RarityTier',
  DailyFork: 'DailyFork',
  UserDailyFork: 'UserDailyFork',
  DuetRun: 'DuetRun',
  UserDuetRun: 'UserDuetRun',
  Ritual: 'Ritual',
  UserRitual: 'UserRitual',
  MicroClan: 'MicroClan',
  MicroClanStats: 'MicroClanStats',
  LootMoment: 'LootMoment',
  UserLootMoment: 'UserLootMoment',
  Message: 'Message',
  Comment: 'Comment',
  ActionLog: 'ActionLog',
  ModerationLog: 'ModerationLog',
  CulturalFilter: 'CulturalFilter',
  ModerationReport: 'ModerationReport',
  AIRegionalContext: 'AIRegionalContext',
  Reflection: 'Reflection',
  Achievement: 'Achievement',
  UserAchievement: 'UserAchievement',
  EventLog: 'EventLog',
  Waitlist: 'Waitlist',
  MarketingCampaign: 'MarketingCampaign',
  Activity: 'Activity',
  Notification: 'Notification',
  Presence: 'Presence',
  Item: 'Item',
  InventoryItem: 'InventoryItem',
  ItemEffect: 'ItemEffect',
  Friend: 'Friend',
  Reaction: 'Reaction',
  Duel: 'Duel',
  Challenge: 'Challenge',
  GlobalEvent: 'GlobalEvent',
  WeeklyChallenge: 'WeeklyChallenge',
  WeeklyChallengeParticipation: 'WeeklyChallengeParticipation',
  UserInsight: 'UserInsight',
  DailyQuest: 'DailyQuest',
  QuestCompletion: 'QuestCompletion',
  MarketListing: 'MarketListing',
  GlobalPool: 'GlobalPool',
  CraftingRecipe: 'CraftingRecipe',
  CraftingLog: 'CraftingLog',
  DailyQuiz: 'DailyQuiz',
  DailyQuizCompletion: 'DailyQuizCompletion',
  UserEnergy: 'UserEnergy',
  GlobalFeedItem: 'GlobalFeedItem',
  ProfileTheme: 'ProfileTheme',
  WorldChronicle: 'WorldChronicle',
  SeasonSummary: 'SeasonSummary',
  PlayerQuote: 'PlayerQuote',
  NarrativeQuest: 'NarrativeQuest',
  NarrativeChoice: 'NarrativeChoice',
  NarrativeOutcome: 'NarrativeOutcome',
  LoreEra: 'LoreEra',
  LoreEntry: 'LoreEntry',
  LoreTag: 'LoreTag',
  UserTimeZone: 'UserTimeZone',
  RegionSchedule: 'RegionSchedule',
  RegionalEvent: 'RegionalEvent',
  RegionConfig: 'RegionConfig',
  CulturalItem: 'CulturalItem',
  LanguagePreference: 'LanguagePreference',
  TranslationKey: 'TranslationKey',
  EconomyStat: 'EconomyStat',
  Treasury: 'Treasury',
  DynamicPrice: 'DynamicPrice',
  TaxTransaction: 'TaxTransaction',
  CreatorWallet: 'CreatorWallet',
  CreatorTransaction: 'CreatorTransaction',
  PayoutPool: 'PayoutPool',
  EngagementMetric: 'EngagementMetric',
  SubscriptionPlan: 'SubscriptionPlan',
  UserSubscription: 'UserSubscription',
  PaymentLog: 'PaymentLog',
  Report: 'Report',
  ReputationScore: 'ReputationScore',
  ModerationAction: 'ModerationAction',
  BlockedUser: 'BlockedUser',
  ContentReview: 'ContentReview',
  UserStreak: 'UserStreak',
  RewardCalendar: 'RewardCalendar',
  ReturnBonus: 'ReturnBonus',
  FeedbackMood: 'FeedbackMood',
  DailySummary: 'DailySummary',
  BetaInvite: 'BetaInvite',
  Referral: 'Referral',
  BetaUser: 'BetaUser',
  TelemetryEvent: 'TelemetryEvent',
  TelemetryAggregate: 'TelemetryAggregate',
  UserPreferences: 'UserPreferences',
  SoundAsset: 'SoundAsset',
  OnboardingProgress: 'OnboardingProgress',
  FeedbackSubmission: 'FeedbackSubmission',
  ErrorLog: 'ErrorLog',
  TooltipDefinition: 'TooltipDefinition',
  WorldCycle: 'WorldCycle',
  LegacyRecord: 'LegacyRecord',
  UserLegacyBonus: 'UserLegacyBonus',
  AbyssProgress: 'AbyssProgress',
  WorldThreat: 'WorldThreat',
  ThreatBattle: 'ThreatBattle',
  FactionTerritory: 'FactionTerritory',
  TerritoryContest: 'TerritoryContest',
  FactionLegacy: 'FactionLegacy',
  FactionMember: 'FactionMember',
  FactionChangeLog: 'FactionChangeLog',
  FactionVote: 'FactionVote',
  FactionProposal: 'FactionProposal',
  MentorProfile: 'MentorProfile',
  MentorLog: 'MentorLog',
  InsightPrompt: 'InsightPrompt',
  ReflectionEntry: 'ReflectionEntry',
  WorldState: 'WorldState',
  WorldVariable: 'WorldVariable',
  WorldEvent: 'WorldEvent',
  WorldContribution: 'WorldContribution',
  NpcProfile: 'NpcProfile',
  NpcInteraction: 'NpcInteraction',
  NpcMemory: 'NpcMemory',
  NpcAffinity: 'NpcAffinity',
  NPCDialogue: 'NPCDialogue',
  NpcDialogueTree: 'NpcDialogueTree',
  RewardOffer: 'RewardOffer',
  RewardRedemption: 'RewardRedemption',
  RewardProof: 'RewardProof',
  PartnerApp: 'PartnerApp',
  PartnerApiKey: 'PartnerApiKey',
  PartnerStats: 'PartnerStats',
  PartnerWebhook: 'PartnerWebhook',
  PushSubscription: 'PushSubscription',
  OfflineAction: 'OfflineAction',
  PWAMetrics: 'PWAMetrics',
  MiniEvent: 'MiniEvent',
  MiniEventProgress: 'MiniEventProgress',
  MiniEventReward: 'MiniEventReward',
  CreatorProfile: 'CreatorProfile',
  CreatorFlow: 'CreatorFlow',
  CreatorFollower: 'CreatorFollower',
  CreatorReward: 'CreatorReward',
  Clan: 'Clan',
  ClanMember: 'ClanMember',
  ClanUpgrade: 'ClanUpgrade',
  ClanActivity: 'ClanActivity',
  SystemMetric: 'SystemMetric',
  HealthLog: 'HealthLog',
  AutoHealLog: 'AutoHealLog',
  CronJobLog: 'CronJobLog',
  ErrorAlert: 'ErrorAlert',
  JobQueue: 'JobQueue',
  JobQueueMetrics: 'JobQueueMetrics',
  JobFailure: 'JobFailure',
  CacheConfig: 'CacheConfig',
  CacheMetrics: 'CacheMetrics',
  AchievementCollection: 'AchievementCollection',
  AchievementCollectionMember: 'AchievementCollectionMember',
  UserAchievementCollection: 'UserAchievementCollection',
  ThemePack: 'ThemePack',
  UserThemeSettings: 'UserThemeSettings',
  Archetype: 'Archetype',
  UserArchetypeFusion: 'UserArchetypeFusion',
  UserArchetypeHistory: 'UserArchetypeHistory',
  AvatarLayer: 'AvatarLayer',
  UserAvatarItem: 'UserAvatarItem',
  UserAvatar: 'UserAvatar',
  DuelSpectator: 'DuelSpectator',
  DuelHighlight: 'DuelHighlight',
  CoopMission: 'CoopMission',
  CoopMember: 'CoopMember',
  CoopProgress: 'CoopProgress',
  TotemBattle: 'TotemBattle',
  TotemBattleResult: 'TotemBattleResult',
  GroupMember: 'GroupMember',
  GroupActivity: 'GroupActivity',
  Flow: 'Flow',
  FlowStep: 'FlowStep',
  FlowStepLink: 'FlowStepLink',
  FlowProgress: 'FlowProgress',
  Answer: 'Answer',
  Language: 'Language',
  Version: 'Version',
  Category: 'Category',
  SubCategory: 'SubCategory',
  SubSubCategory: 'SubSubCategory',
  SssCategory: 'SssCategory',
  UserQuestion: 'UserQuestion',
  QuestionTemplate: 'QuestionTemplate',
  BattleAchievement: 'BattleAchievement',
  UserBattleAchievement: 'UserBattleAchievement',
  Group: 'Group',
  GroupStat: 'GroupStat',
  UserGroup: 'UserGroup',
  PublicPoll: 'PublicPoll',
  PollResponse: 'PollResponse',
  PublicChallenge: 'PublicChallenge',
  ContentPack: 'ContentPack',
  PackItem: 'PackItem',
  UserPack: 'UserPack',
  Fireside: 'Fireside',
  FiresideReaction: 'FiresideReaction',
  MemoryJournal: 'MemoryJournal',
  ComparisonCard: 'ComparisonCard',
  MicroMission: 'MicroMission',
  UserMicroMission: 'UserMicroMission',
  AvatarMood: 'AvatarMood',
  GlobalMood: 'GlobalMood',
  UserMoodLog: 'UserMoodLog',
  MoodPreset: 'MoodPreset',
  MentorNPC: 'MentorNPC',
  UserMentor: 'UserMentor',
  SeasonStoryline: 'SeasonStoryline',
  StorylineAchievement: 'StorylineAchievement',
  Wallet: 'Wallet',
  LedgerEntry: 'LedgerEntry',
  Product: 'Product',
  Price: 'Price',
  Purchase: 'Purchase',
  Entitlement: 'Entitlement',
  Subscription: 'Subscription',
  UserProfile: 'UserProfile',
  Badge: 'Badge',
  UserBadge: 'UserBadge',
  FailedLoginAttempt: 'FailedLoginAttempt',
  PasswordReset: 'PasswordReset',
  EmailVerify: 'EmailVerify',
  AuditLog: 'AuditLog',
  GenerationBatch: 'GenerationBatch',
  GenerationJob: 'GenerationJob',
  AIResponseLog: 'AIResponseLog',
  Account: 'Account',
  Session: 'Session',
  VerificationToken: 'VerificationToken',
  UserSubmission: 'UserSubmission',
  Event: 'Event',
  Vote: 'Vote',
  Season: 'Season',
  SeasonArchive: 'SeasonArchive',
  CosmeticItem: 'CosmeticItem',
  UserCosmetic: 'UserCosmetic',
  SeasonalEvent: 'SeasonalEvent',
  MirrorEvent: 'MirrorEvent',
  WildcardEvent: 'WildcardEvent',
  UserWildcardEvent: 'UserWildcardEvent',
  ShareCard: 'ShareCard',
  PosterCard: 'PosterCard',
  DreamEvent: 'DreamEvent',
  UserDreamEvent: 'UserDreamEvent',
  GenerationRecord: 'GenerationRecord',
  Feedback: 'Feedback',
  CreatorPack: 'CreatorPack',
  UserCreatedPack: 'UserCreatedPack',
  ItemRecipe: 'ItemRecipe',
  ItemDiscovery: 'ItemDiscovery',
  UserReflection: 'UserReflection',
  ReflectionConversation: 'ReflectionConversation',
  UserStats: 'UserStats',
  UserWeeklyStats: 'UserWeeklyStats',
  Chronicle: 'Chronicle',
  Region: 'Region',
  UserRegion: 'UserRegion',
  Quest: 'Quest',
  UserQuest: 'UserQuest',
  UserLoreEntry: 'UserLoreEntry',
  Friendship: 'Friendship',
  SocialDuel: 'SocialDuel',
  SharedMission: 'SharedMission',
  Currency: 'Currency',
  UserWallet: 'UserWallet',
  MarketItem: 'MarketItem',
  Transaction: 'Transaction',
  BalanceSetting: 'BalanceSetting',
  EconomyPreset: 'EconomyPreset',
  SystemAlert: 'SystemAlert',
  AlertWebhook: 'AlertWebhook',
  MetaSeason: 'MetaSeason',
  PrestigeRecord: 'PrestigeRecord',
  TrendingQuestion: 'TrendingQuestion',
  CombatSession: 'CombatSession',
  PublicComparison: 'PublicComparison'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
