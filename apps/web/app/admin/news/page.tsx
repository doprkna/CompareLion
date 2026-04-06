import { requireAdmin } from '@/lib/authGuard';
import { AdminNewsList } from './AdminNewsList';

export default async function AdminNewsPage() {
  await requireAdmin();
  return <AdminNewsList />;
}
