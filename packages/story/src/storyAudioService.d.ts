/**
 * Story Audio Service
 * Handle story audio attachments
 * v0.40.15 - Story Audio 1.0 (Sound Tags + Voice Lines)
 */
export type AudioType = 'none' | 'ambience' | 'tag' | 'voice';
export interface AudioData {
    audioType: AudioType;
    audioTagId?: string | null;
    audioUrl?: string | null;
}
/**
 * Attach audio to story
 */
export declare function attachAudioToStory(userId: string, storyId: string, audioData: AudioData): Promise<{
    id: string;
    audioType: string | null;
    audioTagId: string | null;
    audioUrl: string | null;
}>;
/**
 * Clear audio from story
 */
export declare function clearStoryAudio(userId: string, storyId: string): Promise<void>;
/**
 * Get story audio info
 */
export declare function getStoryAudio(storyId: string): Promise<AudioData | null>;
