/**
 * GET /api/news/[id] - Single post detail by id or slug, records NewsSeen when auth
 *
 * Param interpretation (deterministic):
 * - Matches CUID (^c[a-z0-9]{24}$) or UUID-v4 → treat as id
 * - Else → treat as slug
 * Override: ?by=slug or ?by=id to force interpretation (avoids future heuristic drift).
 */
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { successResponse, notFoundError } from '@/lib/api-handler';

const CUID_REGEX = /^c[a-z0-9]{24}$/;
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function treatAsId(param: string, byOverride?: string | null): boolean {
  if (byOverride === 'id') return true;
  if (byOverride === 'slug') return false;
  return CUID_REGEX.test(param) || UUID_REGEX.test(param);
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: idOrSlug } = await params;
  const byOverride = req.nextUrl.searchParams.get('by');
  const session = await getServerSession(authOptions);
  const userId = session?.user?.email
    ? (await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true } }))?.id
    : null;

  const where = treatAsId(idOrSlug, byOverride)
    ? { id: idOrSlug }
    : { slug: idOrSlug };

  let post = await prisma.newsPost.findFirst({
    where: {
      ...where,
      OR: [
        { status: 'PUBLISHED' },
        { status: 'SCHEDULED', scheduledAt: { lte: new Date() } },
      ],
    },
    select: {
      status: true,
      scheduledAt: true,
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      content: true,
      coverImageUrl: true,
      media: true,
      category: true,
      publishedAt: true,
      _count: { select: { reactions: true } },
    },
  });

  if (!post) return notFoundError();

  if (post.status === 'SCHEDULED' && post.scheduledAt && post.scheduledAt <= new Date()) {
    await prisma.newsPost.update({
      where: { id: post.id },
      data: { status: 'PUBLISHED', publishedAt: new Date() },
    });
  }

  let liked = false;
  let seen = false;
  if (userId) {
    const [likeRow, seenRow] = await Promise.all([
      prisma.newsReaction.findUnique({
        where: { userId_postId_type: { userId, postId: post.id, type: 'LIKE' } },
      }),
      prisma.newsSeen.findUnique({
        where: { userId_postId: { userId, postId: post.id } },
      }),
    ]);
    liked = !!likeRow;
    seen = !!seenRow;

    if (!seenRow) {
      await prisma.newsSeen.upsert({
        where: { userId_postId: { userId, postId: post.id } },
        create: { userId, postId: post.id },
        update: {},
      });
      await prisma.user.update({
        where: { id: userId },
        data: { lastNewsSeenAt: new Date() },
      });
    }
  }

  const { _count, status: _s, scheduledAt: _sc, ...rest } = post;
  return successResponse({
    post: { ...rest, likeCount: _count.reactions },
    viewer: { liked, seen },
  });
}
