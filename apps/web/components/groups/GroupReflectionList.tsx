type Reflection = {
  id?: string;
  userId?: string;
  content?: string | null;
  summary?: string | null;
  sentiment?: string | null;
  createdAt?: string;
  user?: { id: string; name: string | null; username: string | null };
};

interface Props {
  data: Reflection[] | { count: number } | null;
}

export function GroupReflectionList({ data }: Props) {
  if (!data) return null;
  if (!Array.isArray(data)) {
    return (
      <div className="text-sm text-gray-600">Total shared reflections: <span className="font-medium">{data.count}</span></div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {data.map((r) => (
        <div key={r.id} className="rounded border p-3">
          <div className="text-xs text-gray-500 mb-1">
            {r.user?.username || r.user?.name || 'Anonymous'} • {new Date(r.createdAt || '').toLocaleString()}
          </div>
          {r.summary ? <div className="text-sm font-medium mb-1">{r.summary}</div> : null}
          {r.content ? <div className="text-sm whitespace-pre-wrap">{r.content}</div> : null}
        </div>
      ))}
    </div>
  );
}


