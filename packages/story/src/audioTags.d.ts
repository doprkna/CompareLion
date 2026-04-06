/**
 * Story Audio Tags Catalog
 * Preset audio tags for stories
 * v0.40.15 - Story Audio 1.0 (Sound Tags + Voice Lines)
 */
export interface AudioTag {
    id: string;
    label: string;
    emoji: string;
    fileUrl: string;
    description?: string;
}
export declare const AUDIO_TAGS: AudioTag[];
export declare function getAudioTagById(id: string): AudioTag | null;
export declare function getAllAudioTags(): AudioTag[];
