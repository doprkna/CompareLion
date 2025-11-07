"use client";
import { useParams } from 'next/navigation';
import { useFiresideReactions } from '@/hooks/useFiresides';
import { FiresideEmojiPanel } from '@/components/firesides/FiresideEmojiPanel';

export default function FiresideDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id as string;
  const { fireside, reactions, post, posting, reload } = useFiresideReactions(id);

  return (
    <div className="max-w-3xl mx-auto p-4 flex flex-col gap-4">
      {fireside && (
        <div className="rounded border p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">{fireside.title || 'Fireside'}</h2>
            <span className="text-xs text-gray-500">Active: {fireside.isActive ? 'Yes' : 'No'}</span>
          </div>
          <div className="text-xs text-gray-500">Participants: {fireside.participantIds?.length || 0}</div>
        </div>
      )}

      <FiresideEmojiPanel onReact={(e) => post(e)} disabled={posting || !(fireside?.isActive)} />

      <div className="rounded border p-4">
        <h4 className="font-semibold mb-2">Recent Reactions</h4>
        <div className="flex gap-2 flex-wrap text-2xl">
          {reactions?.map((r) => (<span key={r.id}>{r.emoji}</span>))}
        </div>
      </div>
    </div>
  );
}


