/**
 * GET /api/admin/news - List all posts (admin). POST - Create draft (admin)
 */
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import {
  successResponse,
  errorResponse,
  parseBody,
} from '@/lib/api-handler';
import { requireAdminApi } from '@/lib/adminApiAuth';

export async function GET(req: NextRequest) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.error;

  const { searchParams } = req.nextUrl;
  const status = searchParams.get('status');

  const where: Record<string, unknown> = {};
  if (status && ['DRAFT', 'SCHEDULED', 'PUBLISHED', 'ARCHIVED'].includes(status)) {
    where.status = status;
  }

  const posts = await prisma.newsPost.findMany({
    where,
    orderBy: [{ updatedAt: 'desc' }],
    select: {
      id: true,
      slug: true,
      title: true,
      category: true,
      status: true,
      publishedAt: true,
      scheduledAt: true,
      createdAt: true,
    },
  });

  return successResponse({ items: posts });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.error;

  const body = await parseBody<{
    title: string;
    slug: string;
    category: string;
    excerpt?: string;
    content?: unknown;
    media?: unknown;
    coverImageUrl?: string;
  }>(req);

  const { title, slug, category, excerpt, content, media, coverImageUrl } = body;
  if (!title || !slug || !category) {
    return errorResponse('Missing title, slug, or category', 400);
  }
  if (!['FEATURE', 'UPDATE', 'NEWS', 'PROMO', 'ALERT'].includes(category)) {
    return errorResponse('Invalid category', 400);
  }

  const post = await prisma.newsPost.create({
    data: {
      title,
      slug: slug.toLowerCase().replace(/\s+/g, '-'),
      category,
      excerpt: excerpt ?? null,
      content: Array.isArray(content) ? content : [],
      media: media ?? null,
      coverImageUrl: coverImageUrl ?? null,
      status: 'DRAFT',
      authorId: auth.userId,
    },
  });

  return successResponse({ post });
}
