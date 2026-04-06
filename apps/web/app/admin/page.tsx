import { requireAdmin } from '@/lib/authGuard';
import dynamic from 'next/dynamic';

const AdminDashboard = dynamic(
  () => import('@/components/admin/AdminDashboard'),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-bg p-6 flex items-center justify-center">
        <div className="animate-pulse text-subtle">Loading admin…</div>
      </div>
    ),
  }
);

export default async function AdminPage() {
  await requireAdmin();
  return <AdminDashboard />;
}
