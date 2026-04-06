import { requireAdmin } from '@/lib/authGuard';
import { AdminWipPage } from '../_components/AdminWipPage';

export default async function AdminUsersPage() {
  await requireAdmin();
  return <AdminWipPage title="User Management" />;
}
