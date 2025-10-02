import 'server-only';
import { prisma } from '@parel/db/src/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';

export async function getUserProgressStats(categoryId: string) {
  // Ensure user is authenticated
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }
  const userId = session.user.id;
  
  const answered = await prisma.userQuestion.count({
    where: { userId, question: { sssc: { subSubCategory: { subCategory: { categoryId } } } , status: 'answered' } }
  });
  const skipped = await prisma.userQuestion.count({
    where: { userId, question: { sssc: { subSubCategory: { subCategory: { categoryId } } } , status: 'skipped' } }
  });
  const total = answered + skipped;
  
  return { answered, skipped, total };
}
