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

export const AUDIO_TAGS: AudioTag[] = [
  {
    id: 'cozy',
    label: 'Cozy Ambience',
    emoji: '✨',
    fileUrl: '/audio/cozy.mp3',
    description: 'Warm, cozy atmosphere',
  },
  {
    id: 'chaos',
    label: 'CHAOS MODE',
    emoji: '💥',
    fileUrl: '/audio/chaos.mp3',
    description: 'High energy chaos',
  },
  {
    id: 'chill',
    label: 'Night Vibe',
    emoji: '🌙',
    fileUrl: '/audio/chill.mp3',
    description: 'Relaxed night vibes',
  },
  {
    id: 'retro',
    label: 'Retro 8-bit',
    emoji: '🎮',
    fileUrl: '/audio/retro.mp3',
    description: 'Nostalgic 8-bit sounds',
  },
  {
    id: 'meme',
    label: 'Meme Sound',
    emoji: '💀',
    fileUrl: '/audio/meme.mp3',
    description: 'Classic meme audio',
  },
  {
    id: 'sparkle',
    label: 'Sparkle Chime',
    emoji: '✨',
    fileUrl: '/audio/sparkle.mp3',
    description: 'Magical sparkle sound',
  },
];

export function getAudioTagById(id: string): AudioTag | null {
  return AUDIO_TAGS.find((tag) => tag.id === id) || null;
}

export function getAllAudioTags(): AudioTag[] {
  return AUDIO_TAGS;
}

