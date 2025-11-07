export function FusionPreviewCard({ base, option, onFuse }: { base?: string; option: any; onFuse: (a: string, b: string) => void }) {
  if (!option) return null;
  return (
    <div className="rounded border p-3 flex items-center justify-between">
      <div className="text-sm">
        <div className="font-medium">{option.name} {option.emoji}</div>
        <div className="text-xs text-gray-500">Cost: {option.fusionCost}</div>
        {option.fusionResult ? <div className="text-xs">→ Result: {option.fusionResult}</div> : null}
      </div>
      <button className="px-3 py-1 border rounded" onClick={() => base && onFuse(base, option.key)}>Fuse Now</button>
    </div>
  );
}


