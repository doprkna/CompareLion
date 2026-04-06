/**
 * Music Player Context
 * v0.22.7 - Centralized audio state management
 *
 * Single source of truth for audio player:
 * - Queue management (tracks, current index)
 * - Playback state (playing/paused)
 * - Volume & mute controls
 * - Shuffle & loop modes
 * - localStorage persistence
 */
import React from "react";
import { type Track } from "@/lib/audio/tracks";
type Mode = {
    shuffle: boolean;
    loop: boolean;
};
type MusicPlayerState = {
    tracks: Track[];
    currentIndex: number;
    isPlaying: boolean;
    muted: boolean;
    volume: number;
    mode: Mode;
    play: () => void;
    pause: () => void;
    toggle: () => void;
    next: () => void;
    prev: () => void;
    setVolume: (v: number) => void;
    setMuted: (m: boolean) => void;
    toggleMute: () => void;
    setShuffle: (s: boolean) => void;
    setLoop: (l: boolean) => void;
    setTracks: (t: Track[], startIndex?: number) => void;
};
export declare const MusicPlayerProvider: React.FC<React.PropsWithChildren>;
export declare const useMusicPlayer: () => MusicPlayerState;
export {};
