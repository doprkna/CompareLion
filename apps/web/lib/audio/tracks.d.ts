/**
 * Audio Track List
 * v0.22.7 - Central track configuration
 */
export type Track = {
    id: string;
    title: string;
    artist?: string;
    src: string;
    loop?: boolean;
};
export declare const DEFAULT_TRACKS: Track[];
