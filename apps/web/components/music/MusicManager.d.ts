import { MusicTheme } from '@/lib/music/musicThemes';
interface MusicManagerProps {
    enabled?: boolean;
    regionKey?: string;
    archetypeKey?: string;
    onTrackChange?: (theme: MusicTheme | null) => void;
}
/**
 * MusicManager Component
 * v0.29.18 - Interactive Music Layer
 * Global music manager controlling playback via AudioContext
 */
export declare function MusicManager({ enabled, regionKey, archetypeKey, onTrackChange, }: MusicManagerProps): import("react").JSX.Element | null;
export {};
