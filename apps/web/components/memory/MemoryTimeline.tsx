export function MemoryTimeline({ entries }: { entries: any[] }) {
  if (!entries?.length) return null;
  return (
    <div className="flex flex-col gap-3">
      {entries.map((e) => (
        <div key={e.id} className="rounded border p-3">
          <div className="text-sm font-medium">{e.title}</div>
          <div className="text-xs text-gray-500">{new Date(e.createdAt).toLocaleString()}</div>
        </div>
      ))}
    </div>
  );
}


