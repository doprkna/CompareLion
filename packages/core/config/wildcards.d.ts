export type WildcardEvent = {
    title: string;
    reward: string;
    tags?: string[];
};
export type WildcardConfig = Record<string, Record<string, WildcardEvent>>;
export declare const WILDCARDS: WildcardConfig;
