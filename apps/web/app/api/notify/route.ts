/**
 * Notification API
 * Handles notification scheduling and configuration
 * v0.13.2m - Retention Features
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { safeAsync, successResponse, validationError } from '@/lib/api-handler';
import { z } from 'zod';

const NotificationRequestSchema = z.object({
  action: z.enum(['schedule', 'cancel', 'test']),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(), // HH:MM format
  type: z.enum(['daily', 'streak']).optional(),
});

/**
 * POST /api/notify
 * Schedule or manage notifications
 */
export const POST = safeAsync(async (req: NextRequest) => {
  // Check authentication (optional - notifications work without login)
  const _session = await getServerSession(authOptions);

  // Parse and validate request
  const body = await req.json();
  const validation = NotificationRequestSchema.safeParse(body);

  if (!validation.success) {
    return validationError(validation.error.issues[0]?.message || 'Invalid notification request');
  }

  const { action, time, type } = validation.data;

  // Handle different actions
  switch (action) {
    case 'schedule':
      if (!time) {
        return validationError('Time is required for scheduling');
      }
      
      // In a real implementation, this would schedule a job
      // For now, we return success and let client handle it
      return successResponse({
        message: 'Notification scheduled',
        scheduled: true,
        time,
        type: type || 'daily',
      });

    case 'cancel':
      return successResponse({
        message: 'Notification cancelled',
        scheduled: false,
      });

    case 'test':
      // Test notification - just return success
      // Actual notification is shown client-side
      return successResponse({
        message: 'Test notification sent',
        sent: true,
      });

    default:
      return validationError('Invalid action');
  }
});

/**
 * GET /api/notify
 * Get notification configuration
 */
export const GET = safeAsync(async (_req: NextRequest) => {
  // For now, return basic info about notification support
  // In production, this could return user's notification preferences from DB
  
  return successResponse({
    supported: true,
    types: ['daily', 'streak'],
    defaultTime: '09:00',
  });
});

