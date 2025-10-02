import { getUserProgressStats } from '@/lib/server/flowService';
export const dynamic = 'force-dynamic';

type PageProps = { params: { categoryId: string } };

export default async function ResultPage({ params }: PageProps) {
  const stats = await getUserProgressStats(params.categoryId);
  return (
    <div className="p-6 space-y-2">
      <h1 className="text-xl font-semibold">Result</h1>
      <p>Answered: {stats.answered}</p>
      <p>Skipped: {stats.skipped}</p>
      <p>Total: {stats.total}</p>
    </div>
  );
}
