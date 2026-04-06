/**
 * FightResultView Component
 * Displays fight results with round-by-round log
 * v0.36.5 - Combat core + fight UI
 */
export interface Round {
    roundIndex: number;
    heroHp: number;
    enemyHp: number;
    heroDamage: number;
    enemyDamage: number;
    heroCrit: boolean;
    enemyCrit: boolean;
    heroMiss: boolean;
    enemyMiss: boolean;
}
export interface FightResult {
    rounds: Round[];
    result: "WIN" | "LOSE" | "DRAW";
    rewards?: {
        xp?: number;
        gold?: number;
        itemId?: string;
        item?: {
            id: string;
            name: string;
            rarity: string;
        } | null;
    };
}
interface FightResultViewProps {
    fight: FightResult;
    onFightAgain?: () => void;
    onBack?: () => void;
}
export declare function FightResultView({ fight, onFightAgain, onBack }: FightResultViewProps): import("react").JSX.Element;
export {};
