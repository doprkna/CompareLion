import dynamic from 'next/dynamic';

const AdminQuestionReportsClient = dynamic(
  () =>
    import('./AdminQuestionReportsClient').then((m) => m.AdminQuestionReportsClient),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-bg p-6 flex items-center justify-center">
        <p className="text-subtle">Loading…</p>
      </div>
    ),
  }
);

export default function AdminQuestionReportsPage() {
  return (
    <div className="min-h-screen bg-bg p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-text">FlowQuestion reports</h1>
          <p className="text-subtle mt-1">Minimal review queue for user-submitted question reports</p>
        </div>
        <AdminQuestionReportsClient />
      </div>
    </div>
  );
}
