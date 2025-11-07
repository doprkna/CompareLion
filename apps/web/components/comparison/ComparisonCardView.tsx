export function ComparisonCardView({ card }: { card: any }) {
  if (!card) return null;
  return (
    <div className="rounded border p-4 flex flex-col gap-2">
      <div className="text-sm text-gray-500">{new Date(card.generatedAt || card.createdAt).toLocaleString()}</div>
      <div className="text-sm">{card.funText}</div>
      <img src={card.imageUrl} alt="comparison card" className="w-full max-w-2xl border rounded" />
    </div>
  );
}


