"use client";
import { useState } from 'react';
import { usePostcards, useSendPostcard, useReadPostcard } from '@parel/core/hooks/usePostcards';
import { PostcardList } from '@/components/postcards/PostcardList';
import { PostcardSendModal } from '@/components/postcards/PostcardSendModal';
import { PostcardViewer } from '@/components/postcards/PostcardViewer';

export default function PostcardsPage() {
  const [activeTab, setActiveTab] = useState<'inbox' | 'sent'>('inbox');
  const [sendModalOpen, setSendModalOpen] = useState(false);
  const [viewerPostcard, setViewerPostcard] = useState<any | null>(null);
  const { postcards, loading, error, reload } = usePostcards(activeTab);
  const { send, loading: sending, error: sendError } = useSendPostcard();
  const { read, loading: reading } = useReadPostcard();

  const handleSend = async (receiverId: string, message: string) => {
    try {
      await send(receiverId, message);
      reload();
      if (sendError) {
        alert(sendError);
      }
    } catch (e: any) {
      alert(e?.message || 'Failed to send postcard');
    }
  };

  const handleRead = async (postcardId: string) => {
    try {
      await read(postcardId);
      reload();
    } catch (e) {
      console.error('Failed to mark as read', e);
    }
  };

  const handleOpenPostcard = (postcard: any) => {
    setViewerPostcard(postcard);
  };

  return (
    <div className="max-w-3xl mx-auto p-4 flex flex-col gap-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Postcards</h2>
        <button
          onClick={() => setSendModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Send Postcard
        </button>
      </div>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab('inbox')}
          className={`px-4 py-2 rounded ${
            activeTab === 'inbox'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Inbox
        </button>
        <button
          onClick={() => setActiveTab('sent')}
          className={`px-4 py-2 rounded ${
            activeTab === 'sent'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Sent
        </button>
      </div>

      {error && <div className="text-red-600 text-sm">{error}</div>}

      <PostcardList
        postcards={postcards}
        type={activeTab}
        loading={loading}
        onOpen={handleOpenPostcard}
        onRead={activeTab === 'inbox' ? handleRead : undefined}
        reading={reading}
      />

      <PostcardSendModal
        isOpen={sendModalOpen}
        onClose={() => setSendModalOpen(false)}
        onSend={handleSend}
        loading={sending}
      />

      {viewerPostcard && (
        <PostcardViewer
          postcard={viewerPostcard}
          type={activeTab}
          onClose={() => setViewerPostcard(null)}
          onRead={activeTab === 'inbox' && viewerPostcard.status === 'delivered' ? handleRead : undefined}
          reading={reading}
        />
      )}
    </div>
  );
}

