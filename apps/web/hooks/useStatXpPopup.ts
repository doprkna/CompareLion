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

import { useXp } from "@/components/XpProvider";

export type StatType = 'sleep' | 'health' | 'social' | 'knowledge' | 'creativity';

const statIcons: Record<StatType, string> = {
  sleep: '💤',
  health: '💪',
  social: '💬',
  knowledge: '📘',
  creativity: '🎨',
};

const statColors: Record<StatType, string> = {
  sleep: '#3b82f6',      // Blue
  health: '#ef4444',     // Red
  social: '#10b981',     // Green
  knowledge: '#a855f7',  // Purple
  creativity: '#eab308', // Yellow
};

export function useStatXpPopup() {
  const { triggerXp } = useXp();

  const triggerStatXp = (stat: StatType, amount: number) => {
    // For now, just trigger the regular XP popup
    // In future, we can extend XpPopup to support stat-specific colors
    triggerXp(amount, 'xp');
    
    // TODO: Extend XP system to support stat-specific animations
    console.log(`[StatXP] +${amount} ${stat} (${statIcons[stat]})`);
  };

  return { triggerStatXp };
}

/**
 * Trigger multiple stat XP gains at once
 */
export function useMultiStatXp() {
  const { triggerStatXp } = useStatXpPopup();

  const triggerMultiple = (gains: Partial<Record<StatType, number>>) => {
    Object.entries(gains).forEach(([stat, amount], index) => {
      if (amount && amount > 0) {
        setTimeout(() => {
          triggerStatXp(stat as StatType, amount);
        }, index * 300); // Stagger animations
      }
    });
  };

  return { triggerMultiple };
}










