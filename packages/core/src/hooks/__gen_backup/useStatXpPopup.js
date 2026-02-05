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
'use client';
import { useXp } from "./XpProvider"; // sanity-fix
import { logger } from '../utils/debug'; // sanity-fix: replaced @parel/core self-import with relative import
const statIcons = {
    sleep: '💤',
    health: '💪',
    social: '💬',
    knowledge: '📘',
    creativity: '🎨',
};
const statColors = {
    sleep: '#3b82f6', // Blue
    health: '#ef4444', // Red
    social: '#10b981', // Green
    knowledge: '#a855f7', // Purple
    creativity: '#eab308', // Yellow
};
export function useStatXpPopup() {
    const { triggerXp } = useXp();
    const triggerStatXp = (stat, amount) => {
        // For now, just trigger the regular XP popup
        // In future, we can extend XpPopup to support stat-specific colors
        triggerXp(amount, 'xp');
        // TODO-NONBLOCK: Extend XP system to support stat-specific animations
        logger.debug('[StatXP] Stat gain triggered', { amount, stat, icon: statIcons[stat] });
    };
    return { triggerStatXp };
}
/**
 * Trigger multiple stat XP gains at once
 */
export function useMultiStatXp() {
    const { triggerStatXp } = useStatXpPopup();
    const triggerMultiple = (gains) => {
        if (!gains || typeof gains !== 'object')
            return; // sanity-fix
        Object.entries(gains).forEach(([stat, amount], index) => {
            if (amount && amount > 0) {
                setTimeout(() => {
                    triggerStatXp(stat, amount);
                }, index * 300); // Stagger animations
            }
        });
    };
    return { triggerMultiple };
}
