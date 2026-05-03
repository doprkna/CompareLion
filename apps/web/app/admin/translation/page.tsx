import dynamic from 'next/dynamic';

const AdminTranslationClient = dynamic(
  () => import('./AdminTranslationClient').then((m) => m.AdminTranslationClient),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-bg p-6 flex items-center justify-center">
        <p className="text-subtle">Loading…</p>
      </div>
    ),
  }
);

export default function AdminTranslationPage() {
  return (
    <div className="min-h-screen bg-bg p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-text">Translation suggestions</h1>
          <p className="text-subtle mt-1">Community-submitted translations (MVP)</p>
        </div>
        <AdminTranslationClient />
      </div>
    </div>
  );
}
