"use client";
import { ComparisonCardView } from '@/components/comparison/ComparisonCardView';
import { useLatestCard, useGenerateCard } from '@parel/core/hooks/useComparisonCards';

export default function ComparisonCardsPage() {
  const { card, loading, error, reload } = useLatestCard();
  const { generate, loading: generating, error: genError } = useGenerateCard();
  const onGen = async () => { const ok = await generate(); if (ok) reload(); };

  return (
    <div className="max-w-3xl mx-auto p-4 flex flex-col gap-4">
      <h2 className="text-2xl font-bold">Comparison Cards</h2>
      {error && <div className="text-red-600 text-sm">{error}</div>}
      {genError && <div className="text-red-600 text-sm">{genError}</div>}
      <div className="flex gap-2">
        <button className="px-3 py-1 border rounded" onClick={onGen} disabled={generating}>{generating ? 'Generating…' : 'Generate New Card'}</button>
      </div>
      {loading ? <div>Loading…</div> : <ComparisonCardView card={card} />}
    </div>
  );
}


