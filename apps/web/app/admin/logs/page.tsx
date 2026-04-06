import { requireAdmin } from '@/lib/authGuard';
import { AdminWipPage } from '../_components/AdminWipPage';

export default async function AdminLogsPage() {
  await requireAdmin();
  return <AdminWipPage title="System Logs" />;
}
