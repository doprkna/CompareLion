import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { getUserActivityBuckets } from '@/lib/sigil/getUserActivityBuckets';

/** GET /api/user/activity-buckets - Returns activity buckets for current user */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;
  if (!userId) {
    return NextResponse.json({ error: 'User id missing' }, { status: 400 });
  }

  const result = await getUserActivityBuckets(userId);
  return NextResponse.json(result);
}
