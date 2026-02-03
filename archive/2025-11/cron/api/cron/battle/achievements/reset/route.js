/**
 * Battle Achievements Reset Cron (v0.29.25)
 *
 * POST /api/cron/battle/achievements/reset
 * Optional seasonal reset if enabled
 */
import { safeAsync, unauthorizedError, successResponse } from '@/lib/api-handler';
import { prisma } from '@/lib/db';
export const POST = safeAsync(async (req) => {
    const token = req.headers.get('x-cron-token');
    if (process.env.CRON_TOKEN && token !== process.env.CRON_TOKEN) {
        return unauthorizedError('Invalid token');
    }
    // Only reset progress, not unlocks (keeps historical data)
    // In future: can add seasonal reset flag to achievements
    const reset = await prisma.userBattleAchievement.updateMany({
        where: {
            isUnlocked: false, // Only reset progress for locked achievements
        },
        data: {
            progress: 0,
        },
    });
    return successResponse({
        success: true,
        reset: reset.count,
        message: `Reset progress for ${reset.count} locked achievements`,
    });
});
