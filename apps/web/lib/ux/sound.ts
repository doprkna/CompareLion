/**
 * Sound Utilities
 * v0.34.5 - Lightweight sound feedback system
 */

export type SoundEvent = 'xp_gain' | 'mission_complete' | 'error' | 'level_up' | 'click' | 'success';

export interface SoundConfig {
  event: SoundEvent;
  file: string;
  volume: number;
}

/**
 * Sound event configurations
 */
export const SOUNDS: Record<SoundEvent, SoundConfig> = {
  xp_gain: {
    event: 'xp_gain',
    file: '/sfx/xp_gain.mp3',
    volume: 0.3,
  },
  mission_complete: {
    event: 'mission_complete',
    file: '/sfx/mission_complete.mp3',
    volume: 0.4,
  },
  error: {
    event: 'error',
    file: '/sfx/error.mp3',
    volume: 0.2,
  },
  level_up: {
    event: 'level_up',
    file: '/sfx/level_up.mp3',
    volume: 0.5,
  },
  click: {
    event: 'click',
    file: '/sfx/click.mp3',
    volume: 0.1,
  },
  success: {
    event: 'success',
    file: '/sfx/success.mp3',
    volume: 0.3,
  },
};

/**
 * LocalStorage key for sound preference
 */
export const SOUND_STORAGE_KEY = 'soundEnabled';

/**
 * Get sound preference from localStorage
 */
export function getSoundEnabled(): boolean {
  if (typeof window === 'undefined') {
    return false; // Default: muted
  }

  try {
    const stored = localStorage.getItem(SOUND_STORAGE_KEY);
    return stored === 'true';
  } catch (err) {
    console.error('Failed to read sound preference from localStorage:', err);
    return false;
  }
}

/**
 * Store sound preference in localStorage
 */
export function setSoundEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(SOUND_STORAGE_KEY, enabled.toString());
  } catch (err) {
    console.error('Failed to store sound preference in localStorage:', err);
  }
}

/**
 * Audio manager class (singleton)
 */
class AudioManager {
  private audioCache: Map<SoundEvent, HTMLAudioElement> = new Map();
  private enabled: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.enabled = getSoundEnabled();
      this.preloadSounds();
    }
  }

  /**
   * Preload all sound files
   */
  private preloadSounds(): void {
    Object.values(SOUNDS).forEach((config) => {
      try {
        const audio = new Audio(config.file);
        audio.volume = config.volume;
        audio.preload = 'auto';
        this.audioCache.set(config.event, audio);
      } catch (err) {
        console.warn(`Failed to preload sound: ${config.event}`, err);
      }
    });
  }

  /**
   * Play a sound event
   */
  play(event: SoundEvent): void {
    if (!this.enabled) {
      return;
    }

    try {
      const audio = this.audioCache.get(event);
      if (audio) {
        // Clone the audio to allow overlapping plays
        const clone = audio.cloneNode() as HTMLAudioElement;
        clone.volume = SOUNDS[event].volume;
        clone.play().catch((err) => {
          console.warn(`Failed to play sound: ${event}`, err);
        });
      }
    } catch (err) {
      console.warn(`Error playing sound: ${event}`, err);
    }
  }

  /**
   * Enable/disable all sounds
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    setSoundEnabled(enabled);
  }

  /**
   * Get current enabled status
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Set volume for a specific sound
   */
  setVolume(event: SoundEvent, volume: number): void {
    const audio = this.audioCache.get(event);
    if (audio) {
      audio.volume = Math.max(0, Math.min(1, volume));
    }
  }
}

/**
 * Global audio manager instance
 */
export const audioManager = typeof window !== 'undefined' ? new AudioManager() : null;

/**
 * Helper function to play a sound
 */
export function playSound(event: SoundEvent): void {
  audioManager?.play(event);
}





