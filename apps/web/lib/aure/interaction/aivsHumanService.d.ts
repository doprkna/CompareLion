/**
 * AURE Interaction Engine - AI vs Human Service
 * Compares AI picks vs human votes
 * v0.39.2 - AURE Interaction Engine
 */
export interface AiHumanBattle {
    id: string;
    leftRequestId: string;
    rightRequestId: string;
    aiWinner: 'left' | 'right';
    humanVotesA: number;
    humanVotesB: number;
    createdAt: Date;
}
export interface BattleOutcome {
    battle: AiHumanBattle;
    userAgreement: 'match' | 'mismatch' | 'not_voted';
    aiChoice: 'left' | 'right';
    humanChoice: 'left' | 'right' | null;
}
/**
 * Create AI vs Human battle
 * AI picks winner, humans vote
 */
export declare function createAiHumanBattle(leftRequestId: string, rightRequestId: string): Promise<AiHumanBattle>;
/**
 * Vote on AI vs Human battle
 */
export declare function voteOnAiHumanBattle(userId: string, battleId: string, choice: 'left' | 'right'): Promise<{
    success: boolean;
    outcome: BattleOutcome;
}>;
/**
 * Get battle outcome for user
 */
export declare function getBattleOutcome(userId: string, battleId: string): Promise<BattleOutcome | null>;
