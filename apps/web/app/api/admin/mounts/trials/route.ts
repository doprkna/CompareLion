/**
 * Admin Mount Trials CRUD API
 * v0.34.4 - Create, read, update, delete mount trials
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import {
  safeAsync,
  authError,
  validationError,
  notFoundError,
  successResponse,
} from '@/lib/api-handler';
import { MountTrial } from '@/lib/mounts/types';

/**
 * GET /api/admin/mounts/trials
 * Returns all mount trials (admin view)
 */
export const GET = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return authError('Unauthorized');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true },
  });

  if (!user || (user.role !== 'ADMIN' && user.role !== 'DEVOPS')) {
    return authError('Admin access required');
  }

  const trials = await prisma.$queryRaw<any[]>`
    SELECT * FROM mount_trials ORDER BY "createdAt" DESC
  `;

  return successResponse({
    trials: trials.map((t) => ({
      ...t,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
      expiresAt: t.expiresAt ? t.expiresAt.toISOString() : null,
    })),
    count: trials.length,
  });
});

/**
 * POST /api/admin/mounts/trials
 * Create a new mount trial
 */
export const POST = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return authError('Unauthorized');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true },
  });

  if (!user || (user.role !== 'ADMIN' && user.role !== 'DEVOPS')) {
    return authError('Admin access required');
  }

  const body = await req.json();
  const { mountId, name, description, rewardType, rewardValue, maxAttempts, expiresAt } = body;

  if (!mountId || !name || !description || !rewardType) {
    return validationError('Missing required fields', [
      { message: 'Provide mountId, name, description, rewardType' },
    ]);
  }

  const validRewardTypes = ['badge', 'speed', 'karma', 'xp', 'gold'];
  if (!validRewardTypes.includes(rewardType)) {
    return validationError('Invalid rewardType', [
      { message: `rewardType must be one of: ${validRewardTypes.join(', ')}` },
    ]);
  }

  const id = `trial_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const now = new Date();

  await prisma.$executeRaw`
    INSERT INTO mount_trials (id, "mountId", name, description, "rewardType", "rewardValue", "maxAttempts", "expiresAt", "isActive", "createdAt", "updatedAt")
    VALUES (
      ${id},
      ${mountId},
      ${name},
      ${description},
      ${rewardType},
      ${rewardValue || 0},
      ${maxAttempts || null},
      ${expiresAt ? new Date(expiresAt) : null},
      TRUE,
      ${now},
      ${now}
    )
  `;

  const created = await prisma.$queryRaw<any[]>`
    SELECT * FROM mount_trials WHERE id = ${id} LIMIT 1
  `;

  return successResponse({
    trial: {
      ...created[0],
      createdAt: created[0].createdAt.toISOString(),
      updatedAt: created[0].updatedAt.toISOString(),
      expiresAt: created[0].expiresAt ? created[0].expiresAt.toISOString() : null,
    },
  }, 'Trial created successfully');
});

/**
 * PATCH /api/admin/mounts/trials
 * Update a mount trial
 */
export const PATCH = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return authError('Unauthorized');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true },
  });

  if (!user || (user.role !== 'ADMIN' && user.role !== 'DEVOPS')) {
    return authError('Admin access required');
  }

  const body = await req.json();
  const { trialId, name, description, rewardType, rewardValue, maxAttempts, expiresAt, isActive } = body;

  if (!trialId) {
    return validationError('Missing trialId');
  }

  const now = new Date();

  // Build update query dynamically
  const updates: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (name !== undefined) {
    updates.push(`name = $${paramIndex++}`);
    values.push(name);
  }
  if (description !== undefined) {
    updates.push(`description = $${paramIndex++}`);
    values.push(description);
  }
  if (rewardType !== undefined) {
    updates.push(`"rewardType" = $${paramIndex++}`);
    values.push(rewardType);
  }
  if (rewardValue !== undefined) {
    updates.push(`"rewardValue" = $${paramIndex++}`);
    values.push(rewardValue);
  }
  if (maxAttempts !== undefined) {
    updates.push(`"maxAttempts" = $${paramIndex++}`);
    values.push(maxAttempts);
  }
  if (expiresAt !== undefined) {
    updates.push(`"expiresAt" = $${paramIndex++}`);
    values.push(expiresAt ? new Date(expiresAt) : null);
  }
  if (isActive !== undefined) {
    updates.push(`"isActive" = $${paramIndex++}`);
    values.push(isActive);
  }

  updates.push(`"updatedAt" = $${paramIndex++}`);
  values.push(now);

  if (updates.length === 1) {
    return validationError('No fields to update');
  }

  await prisma.$executeRawUnsafe(
    `UPDATE mount_trials SET ${updates.join(', ')} WHERE id = $${paramIndex}`,
    ...values,
    trialId
  );

  const updated = await prisma.$queryRaw<any[]>`
    SELECT * FROM mount_trials WHERE id = ${trialId} LIMIT 1
  `;

  if (!updated || updated.length === 0) {
    return notFoundError('Trial not found');
  }

  return successResponse({
    trial: {
      ...updated[0],
      createdAt: updated[0].createdAt.toISOString(),
      updatedAt: updated[0].updatedAt.toISOString(),
      expiresAt: updated[0].expiresAt ? updated[0].expiresAt.toISOString() : null,
    },
  }, 'Trial updated successfully');
});

/**
 * DELETE /api/admin/mounts/trials
 * Delete a mount trial
 */
export const DELETE = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return authError('Unauthorized');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true },
  });

  if (!user || (user.role !== 'ADMIN' && user.role !== 'DEVOPS')) {
    return authError('Admin access required');
  }

  const { searchParams } = new URL(req.url);
  const trialId = searchParams.get('trialId');

  if (!trialId) {
    return validationError('Missing trialId');
  }

  await prisma.$executeRaw`
    DELETE FROM mount_trials WHERE id = ${trialId}
  `;

  return successResponse(null, 'Trial deleted successfully');
});
