/**
 * GET/PATCH /api/admin/news/[id] - Get or update post (admin)
 */
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { successResponse, notFoundError, parseBody } from '@/lib/api-handler';

import { requireAdminApi } from '@/lib/adminApiAuth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.error;

  const { id } = await params;
  const post = await prisma.newsPost.findUnique({ where: { id } });
  if (!post) return notFoundError();
  return successResponse({ post });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.error;

  const { id } = await params;
  const post = await prisma.newsPost.findUnique({ where: { id } });
  if (!post) return notFoundError();

  const body = await parseBody<{
    title?: string;
    slug?: string;
    category?: string;
    excerpt?: string;
    content?: unknown;
    media?: unknown;
    coverImageUrl?: string;
    status?: string;
  }>(req);

  const data: Record<string, unknown> = {};
  if (body.title != null) data.title = body.title;
  if (body.slug != null) data.slug = body.slug.toLowerCase().replace(/\s+/g, '-');
  if (body.category != null && ['FEATURE', 'UPDATE', 'NEWS', 'PROMO', 'ALERT'].includes(body.category))
    data.category = body.category;
  if (body.excerpt != null) data.excerpt = body.excerpt;
  if (body.content != null) data.content = Array.isArray(body.content) ? body.content : post.content;
  if (body.media != null) data.media = body.media;
  if (body.coverImageUrl != null) data.coverImageUrl = body.coverImageUrl;

  const updated = await prisma.newsPost.update({
    where: { id },
    data,
  });
  return successResponse({ post: updated });
}
