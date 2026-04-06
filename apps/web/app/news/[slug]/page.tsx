import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { NewsContentBlocks } from '@/components/news/NewsContentBlocks';
import { NewsPostActions } from './NewsPostActions';

export default async function NewsPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await getServerSession(authOptions);
  const userId = session?.user?.email
    ? (await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true } }))?.id
    : null;

  const post = await prisma.newsPost.findFirst({
    where: {
      slug,
      OR: [
        { status: 'PUBLISHED' },
        { status: 'SCHEDULED', scheduledAt: { lte: new Date() } },
      ],
    },
  });

  if (!post) notFound();

  let liked = false;
  let likeCount = 0;
  if (userId) {
    const [likeRow, count] = await Promise.all([
      prisma.newsReaction.findUnique({
        where: { userId_postId_type: { userId, postId: post.id, type: 'LIKE' } },
      }),
      prisma.newsReaction.count({ where: { postId: post.id, type: 'LIKE' } }),
    ]);
    liked = !!likeRow;
    likeCount = count;

    await prisma.newsSeen.upsert({
      where: { userId_postId: { userId, postId: post.id } },
      create: { userId, postId: post.id },
      update: {},
    });
    await prisma.user.update({
      where: { id: userId },
      data: { lastNewsSeenAt: new Date() },
    });
  } else {
    likeCount = await prisma.newsReaction.count({ where: { postId: post.id, type: 'LIKE' } });
  }

  const content = Array.isArray(post.content) ? post.content : [];
  const blocks = content as Parameters<typeof NewsContentBlocks>[0]['blocks'];

  return (
    <div className="min-h-screen bg-bg">
      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <Link href="/news" className="text-sm text-accent hover:underline mb-6 inline-block">
          ← Back to News
        </Link>
        <header className="mb-6">
          <span className="text-xs font-medium text-accent uppercase">{post.category}</span>
          {post.publishedAt && (
            <time className="text-sm text-subtle block" dateTime={post.publishedAt.toISOString()}>
              {new Date(post.publishedAt).toLocaleDateString()}
            </time>
          )}
          <h1 className="text-3xl font-bold text-text mt-2">{post.title}</h1>
          {post.excerpt && <p className="text-lg text-subtle mt-2">{post.excerpt}</p>}
        </header>
        {post.coverImageUrl && (
          <div className="relative aspect-video w-full rounded-lg overflow-hidden mb-8">
            <Image
              src={post.coverImageUrl}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 720px"
              priority
              unoptimized
            />
          </div>
        )}
        <div className="prose prose-invert max-w-none">
          <NewsContentBlocks blocks={blocks} />
        </div>
        <NewsPostActions postId={post.id} slug={slug} initialLiked={liked} initialLikeCount={likeCount} />
      </article>
    </div>
  );
}
