/**
 * Reward Economy Configuration
 * Centralized reward values and multipliers for XP, gold, and bonuses
 * v0.26.1 - Reward Economy & Scaling Pass
 *
 * All reward calculations pull from here.
 * Edit this file to tune the entire economy.
 */
export declare const RewardConfig: {
    readonly base: {
        readonly xp: 10;
        readonly gold: 2;
    };
    readonly kill: {
        readonly xp: 50;
        readonly gold: 10;
    };
    readonly boss: {
        readonly xp: 200;
        readonly gold: 60;
    };
    readonly reflection: {
        readonly xp: 25;
        readonly gold: 5;
    };
    readonly quiz: {
        readonly xp: 20;
        readonly gold: 5;
    };
    readonly achievement: {
        readonly xp: 100;
        readonly gold: 0;
    };
    readonly streakMultiplier: {
        readonly perKill: 0.05;
        readonly max: 2;
    };
    readonly difficultyMultiplier: {
        readonly easy: 0.8;
        readonly normal: 1;
        readonly hard: 1.2;
        readonly boss: 2.5;
    };
    readonly powerScaling: {
        readonly base: 1;
        readonly perPower: 0.01;
        readonly cap: 1.5;
    };
    readonly caps: {
        readonly maxXp: 1000000;
        readonly maxGold: 100000;
    };
    readonly drops: {
        readonly rare: 0.05;
        readonly epic: 0.02;
        readonly legendary: 0.005;
        readonly alpha: 0.001;
    };
};
export type DifficultyLevel = keyof typeof RewardConfig.difficultyMultiplier;
