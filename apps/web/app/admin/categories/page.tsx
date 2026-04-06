import { requireAdmin } from '@/lib/authGuard';
import { AdminWipPage } from '../_components/AdminWipPage';

export default async function AdminCategoriesPage() {
  await requireAdmin();
  return <AdminWipPage title="Category Health" />;
}
