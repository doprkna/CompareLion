/**
 * Ambient Environment Configuration
 * Defines visual themes, particles, and audio loops for each game mode
 * v0.26.14 - Dynamic Environment & Ambient System
 */
export const AMBIENT_SCENES = {
    combat: {
        gradient: ['#2a0e36', '#4b164c', '#8a244e'],
        sfx: 'combat_loop.mp3',
        particles: 'embers',
    },
    rest: {
        gradient: ['#3b2a1a', '#5a3b22', '#9a6630'],
        sfx: 'campfire_loop.mp3',
        particles: 'sparks',
    },
    shop: {
        gradient: ['#1e2b3a', '#2b3e54', '#3c567a'],
        sfx: 'shop_loop.mp3',
        particles: 'coins',
    },
    profile: {
        gradient: ['#1f1f2e', '#2f2f46', '#444466'],
        sfx: null,
        particles: 'glow',
    },
};
/**
 * Get ambient scene config by mode
 */
export function getAmbientScene(mode) {
    return AMBIENT_SCENES[mode] || AMBIENT_SCENES.profile;
}
