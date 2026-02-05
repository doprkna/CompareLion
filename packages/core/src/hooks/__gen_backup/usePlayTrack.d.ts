import { MusicTheme } from '../config/musicThemes';
export declare function usePlayTrack(): {
    currentTrack: import("../config/musicThemes").MusicThemeConfig | null;
    isPlaying: boolean;
    volume: number;
    play: (theme: MusicTheme) => Promise<void>;
    stop: () => void;
    pause: () => void;
    resume: () => Promise<void>;
    setVolume: (newVolume: number) => void;
};
