import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError } from '@/lib/api-handler';

const HOURS_BACK = 12;

// Simple sentiment analysis placeholder
function analyzeSentiment(text: string): { joy: number; sad: number; anger: number; calm: number } {
  const lower = text.toLowerCase();
  const joyWords = ['happy', 'joy', 'excited', 'great', 'amazing', 'wonderful', 'love', '😊', '😄', '🎉'];
  const sadWords = ['sad', 'depressed', 'lonely', 'tired', 'upset', '😢', '😞', '💔'];
  const angerWords = ['angry', 'frustrated', 'annoyed', 'mad', 'hate', '😠', '😡', '💢'];
  const calmWords = ['calm', 'peaceful', 'relaxed', 'serene', 'quiet', '😌', '🧘', '🌿'];

  let joy = 0, sad = 0, anger = 0, calm = 0;

  joyWords.forEach((word) => {
    if (lower.includes(word)) joy += 1;
  });
  sadWords.forEach((word) => {
    if (lower.includes(word)) sad += 1;
  });
  angerWords.forEach((word) => {
    if (lower.includes(word)) anger += 1;
  });
  calmWords.forEach((word) => {
    if (lower.includes(word)) calm += 1;
  });

  // Normalize
  const total = joy + sad + anger + calm || 1;
  return {
    joy: joy / total,
    sad: sad / total,
    anger: anger / total,
    calm: calm / total,
  };
}

export const POST = safeAsync(async (req: NextRequest) => {
  const token = req.headers.get('x-cron-token');
  if (process.env.CRON_TOKEN && token !== process.env.CRON_TOKEN) {
    return unauthorizedError('Invalid token');
  }

  const now = new Date();
  const since = new Date(now.getTime() - HOURS_BACK * 60 * 60 * 1000);

  // Get all reflections from last 12 hours
  const reflections = await prisma.reflection.findMany({
    where: {
      createdAt: { gte: since },
    },
    select: {
      text: true,
    },
  });

  // Aggregate sentiment scores
  let totalJoy = 0;
  let totalSad = 0;
  let totalAnger = 0;
  let totalCalm = 0;
  let count = 0;

  reflections.forEach((reflection) => {
    const sentiment = analyzeSentiment(reflection.text);
    totalJoy += sentiment.joy;
    totalSad += sentiment.sad;
    totalAnger += sentiment.anger;
    totalCalm += sentiment.calm;
    count++;
  });

  // Calculate averages
  const avgJoy = count > 0 ? totalJoy / count : 0;
  const avgSad = count > 0 ? totalSad / count : 0;
  const avgAnger = count > 0 ? totalAnger / count : 0;
  const avgCalm = count > 0 ? totalCalm / count : 0;

  // Apply weights: joy: +1, sad: -1, anger: -0.8, calm: +0.5
  const weightedJoy = avgJoy * 1.0;
  const weightedSad = avgSad * -1.0;
  const weightedAnger = avgAnger * -0.8;
  const weightedCalm = avgCalm * 0.5;

  // Calculate variance for chaos (high variance = chaos)
  const scores = [avgJoy, avgSad, avgAnger, avgCalm];
  const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
  const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
  const chaosScore = variance;

  // Determine dominant emotion
  let dominantEmotion: 'calm' | 'joy' | 'sad' | 'anger' | 'chaos' | 'hope' = 'calm';
  let maxScore = weightedCalm;

  if (weightedJoy > maxScore) {
    maxScore = weightedJoy;
    dominantEmotion = 'joy';
  }
  if (Math.abs(weightedSad) > Math.abs(maxScore) && weightedSad < 0) {
    maxScore = weightedSad;
    dominantEmotion = 'sad';
  }
  if (Math.abs(weightedAnger) > Math.abs(maxScore) && weightedAnger < 0) {
    maxScore = weightedAnger;
    dominantEmotion = 'anger';
  }
  if (chaosScore > 0.5 && chaosScore > Math.abs(maxScore)) {
    dominantEmotion = 'chaos';
  }
  // Hope is average of joy and calm
  const hopeScore = (weightedJoy + weightedCalm) / 2;
  if (hopeScore > maxScore && hopeScore > 0.3) {
    dominantEmotion = 'hope';
  }

  // Create or update global mood snapshot
  const globalMood = await prisma.globalMood.create({
    data: {
      dominantEmotion,
      scoreJoy: avgJoy,
      scoreSad: avgSad,
      scoreAnger: avgAnger,
      scoreCalm: avgCalm,
      updatedAt: now,
    },
  });

  return NextResponse.json({
    success: true,
    mood: {
      dominantEmotion,
      scores: {
        joy: avgJoy,
        sad: avgSad,
        anger: avgAnger,
        calm: avgCalm,
      },
      reflectionsAnalyzed: count,
    },
  });
});

