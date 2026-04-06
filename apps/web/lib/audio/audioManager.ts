/**
 * Audio manager - client-only, native HTMLAudioElement
 * SFX: new Audio per play; Music: single instance, loop
 */
import { SOUND_REGISTRY } from './audioRegistry';
import { loadAudioSettings, saveAudioSettings, type AudioSettings } from './audioSettings';

let unlocked = false;
let musicEl: HTMLAudioElement | null = null;
let currentMusicKey: string | null = null;
let settings: AudioSettings = {
  masterMuted: false,
  musicEnabled: false,
  sfxEnabled: true,
  musicVolume: 0.6,
  sfxVolume: 0.6,
  selectedMusicKey: 'music.therapy.lofi',
};

export const audioManager = {
  init(): void {
    if (typeof window === 'undefined') return;
    settings = loadAudioSettings();
  },

  userGestureUnlock(): void {
    unlocked = true;
  },

  playSfx(key: string): void {
    if (typeof window === 'undefined') return;
    const url = SOUND_REGISTRY.sfx[key];
    if (!url || settings.masterMuted || !settings.sfxEnabled) return;
    const a = new Audio(url);
    a.volume = settings.sfxVolume;
    a.play().catch(() => {});
  },

  playMusic(key: string, opts?: { loop?: boolean }): void {
    if (typeof window === 'undefined') return;
    const url = SOUND_REGISTRY.music[key];
    if (!url || settings.masterMuted || !settings.musicEnabled || !unlocked) return;
    if (!musicEl) {
      musicEl = new Audio();
      musicEl.preload = 'auto';
    }
    if (currentMusicKey !== key) {
      musicEl.src = url;
      musicEl.loop = opts?.loop ?? true;
      musicEl.volume = settings.musicVolume;
      currentMusicKey = key;
    }
    musicEl.play().catch(() => {});
  },

  stopMusic(): void {
    if (musicEl) {
      musicEl.pause();
      musicEl.currentTime = 0;
      currentMusicKey = null;
    }
  },

  setSettings(partial: Partial<AudioSettings>): void {
    settings = { ...settings, ...partial };
    saveAudioSettings(settings);
    if (musicEl) musicEl.volume = settings.musicVolume;
  },

  getSettings(): AudioSettings {
    return { ...settings };
  },

  isUnlocked(): boolean {
    return unlocked;
  },
};

export function playUiClick(): void {
  audioManager.playSfx('ui.click');
}
