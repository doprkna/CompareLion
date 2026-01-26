/**
 * Ambient Environment Configuration
 * Defines visual themes, particles, and audio loops for each game mode
 * v0.26.14 - Dynamic Environment & Ambient System
 */
export type AmbientMode = 'combat' | 'rest' | 'shop' | 'profile';
export interface AmbientScene {
    gradient: [string, string, string];
    sfx: string | null;
    particles: 'embers' | 'sparks' | 'coins' | 'glow' | 'none';
    transitionDuration?: number;
}
export declare const AMBIENT_SCENES: Record<AmbientMode, AmbientScene>;
/**
 * Get ambient scene config by mode
 */
export declare function getAmbientScene(mode: AmbientMode): AmbientScene;
