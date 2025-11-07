const EMOJIS = ['🔥','😂','❤️','🧠','😎','💭'];

export function FiresideEmojiPanel({ onReact, disabled }: { onReact: (e: string) => void; disabled?: boolean }) {
  return (
    <div className="flex gap-2 flex-wrap">
      {EMOJIS.map((e) => (
        <button key={e} className="px-3 py-1 border rounded text-xl" disabled={disabled} onClick={() => onReact(e)}>{e}</button>
      ))}
    </div>
  );
}


