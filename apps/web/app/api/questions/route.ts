import { NextResponse } from 'next/server';
import { prisma } from '@parel/db/src/client';
import { getUserFromRequest } from '../_utils';

// Create a new question with its first version
export async function POST(request: Request) {
  const user = getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }
  const body = await request.json();
  const {
    text,
    displayText,
    type,
    options,
    metadata,
    tags = [],
    categoryId,
    subCategoryId,
    subSubCategoryId,
    relatedToId,
  } = body;

  // Create question and first version in a transaction
  const result = await prisma.$transaction(async (tx) => {
    const question = await tx.question.create({
      data: {
        categoryId,
        subCategoryId,
        subSubCategoryId,
        relatedToId,
      },
    });
    const version = await tx.questionVersion.create({
      data: {
        questionId: question.id,
        text,
        displayText,
        type,
        options,
        metadata,
        version: 1,
      },
    });
    // Set currentVersionId
    await tx.question.update({
      where: { id: question.id },
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
    return { question, version };
  });

  return NextResponse.json({ success: true, ...result });
}

// List all questions (latest version only)
export async function GET(request: Request) {
  const user = getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }
  const questions = await prisma.question.findMany({
    include: {
      currentVersion: {
        include: {
          tags: { include: { tag: true } },
        },
      },
    },
  });
  return NextResponse.json({ success: true, questions });
}
