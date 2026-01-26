/**
 * Quest DTOs
 * Data transfer objects for quests
 * v0.41.10 - C3 Step 11: DTO Consolidation Batch #3
 */

/**
 * Quest lore DTO
 * Lore snippet associated with a quest
 */
export interface QuestLoreDTO {
  /** Lore text */
  text: string;
  /** Lore tone */
  tone: 'serious' | 'comedic' | 'poetic';
}

/**
 * Quest DTO
 * Quest shape with progress and status
 */
export interface QuestDTO {
  /** Quest ID */
  id: string;
  /** Quest ID (duplicate for compatibility) */
  questId: string;
  /** User quest ID (if user has progress) */
  userQuestId?: string | null;
  /** Quest key/identifier */
  key: string;
  /** Quest title */
  title: string;
  /** Quest description */
  description: string;
  /** Quest type */
  type: 'daily' | 'weekly' | 'story' | 'side';
  /** Requirement type */
  requirementType: 'xp' | 'reflections' | 'gold' | 'missions' | 'custom';
  /** Requirement value */
  requirementValue: number;
  /** XP reward */
  rewardXP: number;
  /** Gold reward */
  rewardGold: number;
  /** Item reward (optional) */
  rewardItem?: string | null;
  /** Badge reward (optional) */
  rewardBadge?: string | null;
  /** Karma reward */
  rewardKarma: number;
  /** Whether quest is repeatable */
  isRepeatable: boolean;
  /** User progress */
  progress: number;
  /** Progress percentage */
  progressPercent: number;
  /** Whether quest is completed */
  isCompleted: boolean;
  /** Whether reward is claimed */
  isClaimed: boolean;
  /** Whether reward can be claimed */
  canClaim: boolean;
  /** Associated lore (optional, if includeLore=true) */
  lore?: QuestLoreDTO | null;
}

/**
 * Quests response DTO
 * Quests endpoint response
 */
export interface QuestsResponseDTO {
  /** Quests list */
  quests: QuestDTO[];
  /** Total count */
  total: number;
}

