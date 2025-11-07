export function AffinityCard({ item, meId }: { item: any; meId?: string }) {
  const isMine = meId && item.sourceId === meId;
  const otherId = isMine ? item.targetId : item.sourceId;
  const mutual = !!item.mutual;
  return (
    <div className={`rounded border p-3 ${mutual ? 'border-green-500' : 'border-gray-300 opacity-80'}`}>
      <div className="text-sm flex items-center justify-between">
        <div>
          <span className="font-medium capitalize">{item.type}</span>
          <span className="ml-2 text-xs text-gray-500">{mutual ? 'mutual' : 'pending'}</span>
        </div>
        <div className="text-xs text-gray-500">with: {otherId?.slice(0,6)}…</div>
      </div>
    </div>
  );
}


