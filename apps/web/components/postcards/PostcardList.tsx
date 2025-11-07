"use client";
import { PostcardCard } from './PostcardCard';

interface PostcardListProps {
  postcards: any[];
  type: 'inbox' | 'sent';
  loading?: boolean;
  onOpen: (postcard: any) => void;
  onRead?: (postcardId: string) => void;
  reading?: boolean;
}

export function PostcardList({
  postcards,
  type,
  loading,
  onOpen,
  onRead,
  reading,
}: PostcardListProps) {
  if (loading) {
    return <div className="text-center py-8 text-gray-500">Loading postcards...</div>;
  }

  if (postcards.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <span className="text-4xl block mb-2">✉️</span>
        <div>No {type === 'inbox' ? 'received' : 'sent'} postcards yet.</div>
        {type === 'inbox' && (
          <div className="text-sm mt-2">Waiting for postcards from friends...</div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {postcards.map((postcard) => (
        <PostcardCard
          key={postcard.id}
          postcard={postcard}
          type={type}
          onOpen={onOpen}
          onRead={onRead}
          reading={reading}
        />
      ))}
    </div>
  );
}

