export function FusionHistoryList({ items }: { items: any[] }) {
  if (!items?.length) return null;
  return (
    <div className="flex flex-col gap-2">
      {items.map((it) => (
        <div key={it.id} className="rounded border p-2 text-sm">
          {it.baseA} + {it.baseB} → {it.result}
          <span className="ml-2 text-xs text-gray-500">{new Date(it.createdAt).toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}


