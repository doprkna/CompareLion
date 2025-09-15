import { NextResponse } from 'next/server';
import { prisma } from '@parel/db/src/client';

// Get a single question with all versions and tags
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const question = await prisma.question.findUnique({
    where: { id },
    include: {
      versions: {
        include: {
          tags: { include: { tag: true } },
        },
        orderBy: { version: 'asc' },
      },
      currentVersion: true,
    },
  });
  if (!question) return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
  return NextResponse.json({ success: true, question });
}

// Add a new version to a question
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const body = await request.json();
  const { text, displayText, type, options, metadata, tags = [] } = body;

  // Get current max version
  const lastVersion = await prisma.questionVersion.findFirst({
    where: { questionId: id },
    orderBy: { version: 'desc' },
  });
  const newVersionNumber = lastVersion ? lastVersion.version + 1 : 1;

  // Create new version and update currentVersionId
  const result = await prisma.$transaction(async (tx) => {
    const version = await tx.questionVersion.create({
      data: {
        questionId: id,
        text,
        displayText,
        type,
        options,
        metadata,
        version: newVersionNumber,
      },
    });
    await tx.question.update({
      where: { id },
      data: { currentVersionId: version.id },
    });
    // Handle tags
    for (const tagName of tags) {
      const tag = await tx.questionTag.upsert({
        where: { name: tagName },
        update: {},
        create: { name: tagName },
      });
      await tx.questionVersionTag.create({
        data: {
          questionVersionId: version.id,
          tagId: tag.id,
        },
      });
    }
    return { version };
  });

  return NextResponse.json({ success: true, ...result });
}

// Soft delete a question (add deletedAt if not present)
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  // Add deletedAt field if not present
  await prisma.question.update({
    where: { id },
    data: { metadata: { deletedAt: new Date().toISOString() } },
  });
  return NextResponse.json({ success: true });
}
