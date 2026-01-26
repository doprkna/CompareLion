/**
 * Archetype Configuration
 * Defines character classes with base stats, growth rates, and bonuses
 * v0.26.6 - Archetypes & Leveling
 */
export const ARCHETYPES = {
    warrior: {
        key: 'warrior',
        name: 'Warrior',
        description: 'Physical focus with strong base HP and combat prowess. Excel in direct combat.',
        emoji: '🗡️',
        baseStats: {
            str: 12,
            int: 6,
            cha: 5,
            luck: 4,
        },
        growthRates: {
            str: 2.5,
            int: 0.5,
            cha: 0.5,
            luck: 0.5,
        },
        bonuses: {
            combat: {
                damageMult: 1.15, // 15% more damage
                hpMult: 1.25, // 25% more HP
            },
        },
    },
    thinker: {
        key: 'thinker',
        name: 'Thinker',
        description: 'Bonus XP and reflection rewards. Mental growth is your focus.',
        emoji: '🧠',
        baseStats: {
            str: 6,
            int: 12,
            cha: 6,
            luck: 5,
        },
        growthRates: {
            str: 0.5,
            int: 2.5,
            cha: 1.0,
            luck: 0.5,
        },
        bonuses: {
            xp: {
                reflectionBonus: 0.25, // 25% bonus XP from reflections
                generalBonus: 0.10, // 10% general XP bonus
            },
        },
    },
    trickster: {
        key: 'trickster',
        name: 'Trickster',
        description: 'Higher crit chance but lower HP. Risky, high-reward playstyle.',
        emoji: '🎭',
        baseStats: {
            str: 8,
            int: 7,
            cha: 8,
            luck: 10,
        },
        growthRates: {
            str: 1.5,
            int: 1.0,
            cha: 1.5,
            luck: 2.0,
        },
        bonuses: {
            combat: {
                critChance: 0.10, // +10% crit chance
                hpMult: 0.85, // 15% less HP
                damageMult: 1.05, // Slight damage bonus
            },
        },
    },
    charmer: {
        key: 'charmer',
        name: 'Charmer',
        description: 'Social bonuses and shop discounts. Build connections and save gold.',
        emoji: '💬',
        baseStats: {
            str: 5,
            int: 7,
            cha: 12,
            luck: 6,
        },
        growthRates: {
            str: 0.5,
            int: 1.0,
            cha: 2.5,
            luck: 1.0,
        },
        bonuses: {
            social: {
                shopDiscount: 0.15, // 15% shop discount
                socialBonus: 0.20, // 20% social interaction bonuses
            },
            passive: {
                goldBonus: 0.10, // 10% more gold
            },
        },
    },
    sage: {
        key: 'sage',
        name: 'Sage',
        description: 'Balanced stats with passive regen bonuses. Steady, reliable growth.',
        emoji: '🧘',
        baseStats: {
            str: 8,
            int: 9,
            cha: 7,
            luck: 6,
        },
        growthRates: {
            str: 1.5,
            int: 1.5,
            cha: 1.0,
            luck: 1.0,
        },
        bonuses: {
            passive: {
                regen: 2, // 2 HP regen per turn
            },
            xp: {
                generalBonus: 0.05, // 5% general XP bonus
            },
        },
    },
};
/**
 * Get archetype definition by key
 */
export function getArchetype(key) {
    return ARCHETYPES[key] || null;
}
/**
 * Calculate stats for a given level based on archetype
 */
export function calculateStatsForLevel(archetype, level) {
    const stats = { ...archetype.baseStats };
    // Apply growth rates per level (level 1 is base, so multiply by level - 1)
    const levelsAboveBase = level - 1;
    stats.str = Math.floor(archetype.baseStats.str + archetype.growthRates.str * levelsAboveBase);
    stats.int = Math.floor(archetype.baseStats.int + archetype.growthRates.int * levelsAboveBase);
    stats.cha = Math.floor(archetype.baseStats.cha + archetype.growthRates.cha * levelsAboveBase);
    stats.luck = Math.floor(archetype.baseStats.luck + archetype.growthRates.luck * levelsAboveBase);
    // Ensure no negative stats
    stats.str = Math.max(0, stats.str);
    stats.int = Math.max(0, stats.int);
    stats.cha = Math.max(0, stats.cha);
    stats.luck = Math.max(0, stats.luck);
    return stats;
}
