/**
 * Item Effects Definitions
 * v0.26.8 - Passive Item Effects Activation
 */
export type ItemEffectTrigger = 'onAttack' | 'onKill' | 'onCrit' | 'onRest' | 'onStart';
export interface ItemEffectDef {
    trigger: ItemEffectTrigger;
    type: 'buff' | 'passive' | 'heal';
    prop: string;
    value: number;
}
export declare const ITEM_EFFECTS: Record<string, ItemEffectDef>;
