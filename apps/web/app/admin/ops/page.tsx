import dynamic from 'next/dynamic';

const AdminOpsClient = dynamic(() => import('./AdminOpsClient'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-bg p-6 flex items-center justify-center">
      <div className="animate-pulse text-subtle">Loading ops…</div>
    </div>
  ),
});

export default function AdminOpsPage() {
  return <AdminOpsClient />;
}
