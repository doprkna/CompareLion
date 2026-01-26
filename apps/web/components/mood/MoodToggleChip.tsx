import { useMoodFeed } from '@parel/core/hooks/useMoodFeed';

export function MoodToggleChip() {
  const { mood, setMood } = useMoodFeed();
  return (
    <div className="flex items-center gap-2 text-xs">
      <button className={`px-2 py-1 border rounded ${mood==='chill'?'bg-blue-900/30':''}`} onClick={() => setMood('chill')}>Chill</button>
      <button className={`px-2 py-1 border rounded ${mood==='deep'?'bg-gray-800/30':''}`} onClick={() => setMood('deep')}>Deep</button>
      <button className={`px-2 py-1 border rounded ${mood==='roast'?'bg-amber-900/30':''}`} onClick={() => setMood('roast')}>Roast</button>
    </div>
  );
}


