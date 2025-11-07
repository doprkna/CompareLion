export function MemoryEntryCard({ entry }: { entry: any }) {
  if (!entry) return null;
  const range = `${new Date(entry.periodStart).toLocaleDateString()} – ${new Date(entry.periodEnd).toLocaleDateString()}`;
  return (
    <div className="rounded border p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold">{entry.title}</h3>
        <span className="text-xs text-gray-500">{range}</span>
      </div>
      {entry.summary ? <div className="text-sm text-gray-600 mb-2">{entry.summary}</div> : null}
      <pre className="text-sm whitespace-pre-wrap">{entry.content}</pre>
    </div>
  );
}


