import { requireAdmin } from '@/lib/authGuard';
import { AdminWipPage } from '../_components/AdminWipPage';

export default async function AdminMetricsPage() {
  await requireAdmin();
  return <AdminWipPage title="Growth Metrics" />;
}
