/**
 * GET /api/news - List published news posts
 * Query: category?, cursor?, limit?
 */
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { successResponse } from '@/lib/api-handler';

type NewsCategory = 'FEATURE' | 'UPDATE' | 'NEWS' | 'PROMO' | 'ALERT';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const category = searchParams.get('category') as NewsCategory | null;
  const cursor = searchParams.get('cursor');
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '20', 10) || 20, 50);

  await prisma.newsPost.updateMany({
    where: { status: 'SCHEDULED', scheduledAt: { lte: new Date() } },
    data: { status: 'PUBLISHED', publishedAt: new Date() },
  });

  const where: Record<string, unknown> = {
    OR: [
      { status: 'PUBLISHED' },
      { status: 'SCHEDULED', scheduledAt: { lte: new Date() } },
    ],
  };
  if (category && ['FEATURE', 'UPDATE', 'NEWS', 'PROMO', 'ALERT'].includes(category)) {
    where.category = category;
  }

  const posts = await prisma.newsPost.findMany({
    where,
    orderBy: [{ publishedAt: 'desc' }],
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      category: true,
      publishedAt: true,
      coverImageUrl: true,
      _count: { select: { reactions: true } },
    },
  });

  const hasMore = posts.length > limit;
  const items = (hasMore ? posts.slice(0, limit) : posts).map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    category: p.category,
    publishedAt: p.publishedAt,
    coverImageUrl: p.coverImageUrl,
    likeCount: p._count.reactions,
  }));

  const nextCursor = hasMore ? items[items.length - 1]?.id : null;
  return successResponse({ items, nextCursor });
}
