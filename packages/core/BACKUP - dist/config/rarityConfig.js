/**
 * Rarity Configuration
 * Defines rarity tiers, power ranges, and visual properties
 * v0.26.5 - Items 2.0: Rarity, Power & Effects
 */
export const RARITIES = {
    common: {
        color: '#bdbdbd',
        powerRange: [1, 3],
        dropRate: 0.5,
        rarityMultiplier: 1.0,
    },
    rare: {
        color: '#3b82f6',
        powerRange: [4, 7],
        dropRate: 0.3,
        rarityMultiplier: 1.2,
    },
    epic: {
        color: '#a855f7',
        powerRange: [8, 12],
        dropRate: 0.15,
        rarityMultiplier: 1.5,
    },
    legendary: {
        color: '#f59e0b',
        powerRange: [13, 20],
        dropRate: 0.05,
        rarityMultiplier: 2.0,
    },
    alpha: {
        color: '#e11d48',
        powerRange: [20, 30],
        dropRate: 0.01,
        rarityMultiplier: 2.5,
    },
};
/**
 * Get rarity definition by key
 */
export function getRarity(key) {
    return RARITIES[key] || RARITIES.common;
}
/**
 * Generate random rarity based on drop rates
 */
export function rollRarity() {
    const rand = Math.random();
    let cumulative = 0;
    for (const [key, rarity] of Object.entries(RARITIES)) {
        cumulative += rarity.dropRate;
        if (rand <= cumulative) {
            return key;
        }
    }
    return 'common'; // Fallback
}
/**
 * Generate random power within rarity range
 */
export function generatePowerForRarity(rarity) {
    const def = RARITIES[rarity];
    const [min, max] = def.powerRange;
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
