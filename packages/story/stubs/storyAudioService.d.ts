/** @parel/story stub - build resolution only */
export type AudioType = 'none' | 'ambience' | 'tag' | 'voice';
export interface AudioData {
  audioType: AudioType;
  audioTagId?: string | null;
  audioUrl?: string | null;
}
export declare function attachAudioToStory(
  userId: string,
  storyId: string,
  audioData: AudioData
): Promise<{ id: string; audioType: string | null; audioTagId: string | null; audioUrl: string | null }>;
export declare function clearStoryAudio(userId: string, storyId: string): Promise<void>;
