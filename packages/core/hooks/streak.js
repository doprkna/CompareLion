export function getStreakData() {
    if (typeof window === 'undefined')
        return null;
    try {
        const stored = localStorage.getItem('streak-storage');
        if (stored) {
            const parsed = JSON.parse(stored);
            return parsed.state?.streak || null;
        }
    }
    catch {
        // Ignore errors
    }
    return null;
}
export function updateStreak() {
    const current = getStreakData();
    const today = new Date().toISOString().split('T')[0];
    if (!current || current.lastActivityDate !== today) {
        const newStreak = {
            currentStreak: current ? current.currentStreak + 1 : 1,
            lastActivityDate: today,
            longestStreak: current ? Math.max(current.longestStreak || 0, current.currentStreak + 1) : 1,
        };
        return { streak: newStreak, isNewStreak: true, wasBroken: false };
    }
    return { streak: current, isNewStreak: false, wasBroken: false };
}
export function getStreakMessage(currentStreak, isNewStreak, wasBroken) {
    if (wasBroken) {
        return 'Streak broken! Start a new one tomorrow.';
    }
    if (isNewStreak) {
        return `🔥 ${currentStreak} day streak!`;
    }
    return `Current streak: ${currentStreak} days`;
}
