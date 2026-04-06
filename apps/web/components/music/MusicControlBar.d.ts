interface MusicControlBarProps {
    currentTrack?: any;
    isPlaying?: boolean;
    volume?: number;
    onPlay?: () => void;
    onPause?: () => void;
    onStop?: () => void;
    onVolumeChange?: (volume: number) => void;
    className?: string;
}
export declare function MusicControlBar({ currentTrack: externalTrack, isPlaying: externalPlaying, volume: externalVolume, onPlay, onPause, onStop, onVolumeChange, className, }: MusicControlBarProps): import("react").JSX.Element;
export {};
