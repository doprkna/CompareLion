import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { 
  calculateCombatKillReward,
  calculateReflectionReward,
  calculateQuizReward,
  getBaseReward,
  calculateReward,
} from '@/lib/services/rewardService';
import { RewardConfig, DifficultyLevel } from '@parel/core/config/rewardConfig';
import { safeAsync, unauthorizedError, successResponse, validationError, parseBody } from '@/lib/api-handler';

/**
 * POST /api/rewards/preview
 * Preview reward calculation for balancing/testing
 * Body: { type: 'kill'|'boss'|'reflection'|'quiz', streak?: number, power?: number, difficulty?: string }
 */
export const POST = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return unauthorizedError('Authentication required');
  }

  const body = await parseBody<{
    type: 'kill' | 'boss' | 'reflection' | 'quiz' | 'achievement';
    streak?: number;
    power?: number;
    difficulty?: DifficultyLevel;
    baseXp?: number;
    baseGold?: number;
  }>(req);

  if (!body.type) {
    return validationError('Missing required field: type');
  }

  let result;

  switch (body.type) {
    case 'kill':
      result = calculateCombatKillReward(
        body.streak || 0,
        body.power || 0,
        false
      );
      break;
    case 'boss':
      result = calculateCombatKillReward(
        body.streak || 0,
        body.power || 0,
        true
      );
      break;
    case 'reflection':
      result = calculateReflectionReward();
      break;
    case 'quiz':
      result = calculateQuizReward(body.difficulty || 'normal');
      break;
    case 'achievement':
      if (body.baseXp === undefined || body.baseGold === undefined) {
        return validationError('baseXp and baseGold required for achievement type');
      }
      result = calculateReward(body.baseXp, body.baseGold, {
        applyStreakMultiplier: false,
        applyPowerScaling: false,
        difficulty: 'normal',
      });
      break;
    default:
      return validationError(`Invalid type: ${body.type}`);
  }

  return successResponse({
    type: body.type,
    input: {
      streak: body.streak || 0,
      power: body.power || 0,
      difficulty: body.difficulty || 'normal',
    },
    result: {
      xp: result.xp,
      gold: result.gold,
      multiplier: result.multiplier,
      breakdown: result.breakdown,
    },
    config: {
      baseRewards: getBaseReward(body.type === 'boss' ? 'boss' : body.type),
      streakMultiplier: RewardConfig.streakMultiplier,
      difficultyMultiplier: RewardConfig.difficultyMultiplier,
      powerScaling: RewardConfig.powerScaling,
    },
  });
});

