import { requireAdmin } from '@/lib/authGuard';

export default async function ReportsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();
  return <>{children}</>;
}
