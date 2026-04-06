import { requireAdmin } from '@/lib/authGuard';
import AdminReportsClient from './AdminReportsClient';

export default async function AdminReportsPage() {
  await requireAdmin();
  return <AdminReportsClient />;
}
