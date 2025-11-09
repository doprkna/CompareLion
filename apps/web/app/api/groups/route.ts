import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, validationError, notFoundError } from '@/lib/api-handler';
import { z } from 'zod';

const LEVEL_REQUIREMENT = 5; // MVP threshold for creating a group

const CreateGroupSchema = z.object({
  name: z.string().min(3).max(64),
  description: z.string().max(400).optional(),
  visibility: z.enum(['private', 'public']).default('private'),
  transparency: z.enum(['summary', 'full', 'hidden']).default('summary'),
});

export const GET = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return unauthorizedError('Unauthorized');

  const user = await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true } });
  if (!user) return unauthorizedError('Unauthorized');

  const memberships = await prisma.groupMember.findMany({
    where: { userId: user.id },
    select: { groupId: true, role: true, group: true },
  });

  const groups = (memberships || []).map((m) => ({ // sanity-fix
    id: m.group.id,
    name: m.group.name,
    description: (m.group as any).description ?? null,
    visibility: (m.group as any).visibility,
    transparency: (m.group as any).transparency,
    role: m.role,
    createdAt: (m.group as any).createdAt,
  }));

  return NextResponse.json({ success: true, groups });
});

export const POST = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return unauthorizedError('Unauthorized');

  const body = await req.json().catch(() => ({}));
  const parsed = CreateGroupSchema.safeParse(body);
  if (!parsed.success) {
    return validationError(parsed.error.issues[0]?.message || 'Invalid group payload');
  }

  const creator = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!creator) return unauthorizedError('Unauthorized');

  if (creator.level < LEVEL_REQUIREMENT) {
    return validationError(`Level ${LEVEL_REQUIREMENT}+ required to create a group`);
  }

  const cost = 100; // align with schema default
  if (creator.diamonds < cost) {
    return validationError('Insufficient diamonds to create a group');
  }

  // Create group and membership in a transaction; deduct diamonds
  const group = await prisma.$transaction(async (tx) => {
    const g = await tx.group.create({
      data: {
        name: parsed.data.name,
        description: parsed.data.description,
        visibility: parsed.data.visibility,
        transparency: parsed.data.transparency,
        ownerId: creator.id,
        cost,
      },
    });

    await tx.user.update({ where: { id: creator.id }, data: { diamonds: { decrement: cost } } });
    await tx.groupMember.create({ data: { groupId: g.id, userId: creator.id, role: 'admin' } });
    return g;
  });

  return NextResponse.json({ success: true, group: { id: group.id, name: group.name } }, { status: 201 });
});













