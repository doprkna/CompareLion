import { requireAdmin } from '@/lib/authGuard';
import { AdminNewsEditor } from '../AdminNewsEditor';

export default async function AdminNewsNewPage() {
  await requireAdmin();
  return <AdminNewsEditor />;
}
