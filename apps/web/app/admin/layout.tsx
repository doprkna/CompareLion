import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { redirect } from 'next/navigation';
import { SidebarNav } from '@/components/admin/sidebar-nav';
import { AdminHeader } from '@/components/admin/admin-header';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    redirect('/login');
  }

  const userRole = (session.user as any)?.role;
  
  if (!['ADMIN', 'MODERATOR'].includes(userRole)) {
    redirect('/');
  }

  return (
    <div className="flex min-h-screen bg-bg">
      <SidebarNav userRole={userRole} />
      <div className="flex-1 flex flex-col">
        <AdminHeader user={session.user} />
        <main className="flex-1 p-6 bg-bg">
          {children}
        </main>
      </div>
    </div>
  );
}

























