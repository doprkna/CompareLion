/**
 * Item Effects Definitions
 * v0.26.8 - Passive Item Effects Activation
 */
export const ITEM_EFFECTS = {
    'crit-boost': { trigger: 'onAttack', type: 'buff', prop: 'critChance', value: 0.05 },
    'gold-bonus': { trigger: 'onKill', type: 'passive', prop: 'goldMult', value: 1.1 },
    'xp-bonus': { trigger: 'onKill', type: 'passive', prop: 'xpMult', value: 1.05 },
    'heal-on-crit': { trigger: 'onCrit', type: 'heal', prop: 'heroHp', value: 5 },
    'regen': { trigger: 'onRest', type: 'heal', prop: 'heroHp', value: 10 },
    'damage-boost': { trigger: 'onAttack', type: 'buff', prop: 'damageMult', value: 1.15 },
};
