import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { UserProfileCard } from '@/components/dashboard/UserProfileCard';

interface ProfilePageProps {
  params: {
    username: string;
  };
}

export default async function PublicProfilePage({ params }: ProfilePageProps) {
  const { username } = params;

  // Find user by username
  const user = await prisma.user.findUnique({
    where: { username },
    select: { id: true },
  });

  if (!user) {
    redirect('/404');
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-muted-foreground">@{username}</p>
      </div>

      <div className="flex justify-center">
        <UserProfileCard userId={user.id} />
      </div>
    </div>
  );
}

export async function generateMetadata({ params }: ProfilePageProps) {
  const { username } = params;
  
  return {
    title: `@${username} - PareL Profile`,
    description: `View ${username}'s profile on PareL`,
  };
}

