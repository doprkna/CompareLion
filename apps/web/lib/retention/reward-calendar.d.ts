/**
 * Reward Calendar System (v0.11.9)
 *
 * PLACEHOLDER: Daily and monthly reward calendars.
 */
/**
 * 7-Day Reward Calendar
 */
export declare const SEVEN_DAY_REWARDS: readonly [{
    readonly day: 1;
    readonly type: "xp";
    readonly amount: 25;
}, {
    readonly day: 2;
    readonly type: "gold";
    readonly amount: 50;
}, {
    readonly day: 3;
    readonly type: "xp";
    readonly amount: 50;
}, {
    readonly day: 4;
    readonly type: "diamond";
    readonly amount: 1;
}, {
    readonly day: 5;
    readonly type: "xp";
    readonly amount: 75;
}, {
    readonly day: 6;
    readonly type: "gold";
    readonly amount: 100;
}, {
    readonly day: 7;
    readonly type: "diamond";
    readonly amount: 2;
}];
/**
 * 30-Day Reward Calendar
 */
export declare const THIRTY_DAY_REWARDS: readonly [{
    readonly day: 1;
    readonly type: "xp";
    readonly amount: 25;
}, {
    readonly day: 3;
    readonly type: "gold";
    readonly amount: 50;
}, {
    readonly day: 5;
    readonly type: "xp";
    readonly amount: 50;
}, {
    readonly day: 7;
    readonly type: "diamond";
    readonly amount: 1;
}, {
    readonly day: 10;
    readonly type: "xp";
    readonly amount: 100;
}, {
    readonly day: 14;
    readonly type: "diamond";
    readonly amount: 2;
}, {
    readonly day: 21;
    readonly type: "xp";
    readonly amount: 150;
}, {
    readonly day: 28;
    readonly type: "gold";
    readonly amount: 200;
}, {
    readonly day: 30;
    readonly type: "diamond";
    readonly amount: 5;
}];
/**
 * Initialize reward calendar for user
 */
export declare function initializeRewardCalendar(_userId: string, _calendarType: "7day" | "30day"): Promise<null>;
/**
 * Claim reward for current day
 */
export declare function claimDailyReward(_userId: string, _calendarType: string, _day: number): Promise<null>;
/**
 * Get user's calendar progress
 */
export declare function getCalendarProgress(_userId: string, _calendarType: string): Promise<null>;
