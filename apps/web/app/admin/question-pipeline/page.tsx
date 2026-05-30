import dynamic from 'next/dynamic';
import Link from 'next/link';
import { QuestionPipelineFoundationPanel } from '@/components/admin/QuestionPipelineFoundationPanel';
import { AdminNeedsAttentionPanel } from '@/components/admin/AdminAttention';

const AdminQuestionPipelineClient = dynamic(
  () =>
    import('./AdminQuestionPipelineClient').then((m) => m.AdminQuestionPipelineClient),
  {
    ssr: false,
    loading: () => <p className="text-subtle text-sm">Loading run history…</p>,
  }
);

export default function AdminQuestionPipelinePage() {
  return (
    <div className="min-h-screen bg-bg p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-text">Question Pipeline</h1>
          <p className="text-subtle mt-1">
            Foundation status, known limits, and operational run history for the Question SoT
            pipeline.
          </p>
        </div>

        <AdminNeedsAttentionPanel />

        <QuestionPipelineFoundationPanel showNavLinks={false} />

        <section className="space-y-3">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <h2 className="text-lg font-semibold text-text">Latest pipeline runs</h2>
            <Link href="/admin/question-reports" className="text-sm text-accent hover:underline">
              Question reports →
            </Link>
          </div>
          <AdminQuestionPipelineClient />
        </section>

        <p className="text-xs text-subtle">
          <Link href="/admin" className="text-accent hover:underline">
            ← Admin dashboard
          </Link>
        </p>
      </div>
    </div>
  );
}
