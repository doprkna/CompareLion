import { requireAdmin } from '@/lib/authGuard';
import { AdminQuestionsClient } from './AdminQuestionsClient';

export default async function AdminQuestionsPage() {
  await requireAdmin();
  return <AdminQuestionsClient />;
}
