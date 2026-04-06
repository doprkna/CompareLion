import { requireAdmin } from '@/lib/authGuard';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { AdminNewsEditor } from '../AdminNewsEditor';

export default async function AdminNewsEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const post = await prisma.newsPost.findUnique({ where: { id } });
  if (!post) notFound();
  return <AdminNewsEditor post={post} />;
}
