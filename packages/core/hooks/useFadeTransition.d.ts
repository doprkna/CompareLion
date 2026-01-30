import { MusicTheme } from '../config/musicThemes';
export declare function useFadeTransition(): {
    fadeOut: (audio: HTMLAudioElement, duration: number, onComplete: () => void) => void;
    fadeIn: (audio: HTMLAudioElement, duration: number, targetVolume: number) => void;
    transition: (currentAudio: HTMLAudioElement | null, nextTheme: MusicTheme, nextAudio: HTMLAudioElement, onComplete: () => void) => void;
};
