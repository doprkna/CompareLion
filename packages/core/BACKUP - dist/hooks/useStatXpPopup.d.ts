/**
 * useStatXpPopup Hook
 *
 * Triggers XP popup animations for specific stat gains.
 * Reuses the existing XP popup system with stat-specific styling.
 *
 * Usage:
 * ```tsx
 * const { triggerStatXp } = useStatXpPopup();
 *
 * // On answer question
 * triggerStatXp('sleep', 2);    // +2 Sleep XP
 * triggerStatXp('health', 1);   // +1 Health XP
 * ```
 */
export type StatType = 'sleep' | 'health' | 'social' | 'knowledge' | 'creativity';
export declare function useStatXpPopup(): {
    triggerStatXp: (stat: StatType, amount: number) => void;
};
/**
 * Trigger multiple stat XP gains at once
 */
export declare function useMultiStatXp(): {
    triggerMultiple: (gains: Partial<Record<StatType, number>>) => void;
};
