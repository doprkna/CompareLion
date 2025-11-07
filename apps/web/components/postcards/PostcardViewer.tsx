"use client";

interface PostcardViewerProps {
  postcard: {
    id: string;
    message: string;
    status: string;
    deliveryAt: string;
    createdAt: string;
    sender?: {
      id: string;
      username?: string;
      name?: string;
      avatarUrl?: string;
    };
    receiver?: {
      id: string;
      username?: string;
      name?: string;
      avatarUrl?: string;
    };
  };
  type: 'inbox' | 'sent';
  onClose: () => void;
  onRead?: (postcardId: string) => void;
  reading?: boolean;
}

export function PostcardViewer({
  postcard,
  type,
  onClose,
  onRead,
  reading,
}: PostcardViewerProps) {
  const isUnread = type === 'inbox' && postcard.status === 'delivered';
  const otherUser = type === 'inbox' ? postcard.sender : postcard.receiver;
  const userName = otherUser?.username || otherUser?.name || 'Unknown';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">Postcard</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ×
          </button>
        </div>

        <div className="mb-4 p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded border-2 border-yellow-300">
          <div className="text-center mb-4">
            <span className="text-4xl">✉️</span>
          </div>

          <div className="text-sm text-gray-600 mb-2">
            {type === 'inbox' ? `From: ${userName}` : `To: ${userName}`}
          </div>

          <div className="text-sm text-gray-500 mb-4">
            {new Date(postcard.createdAt).toLocaleString()}
          </div>

          <div className="p-3 bg-white rounded border text-gray-800 whitespace-pre-wrap">
            {postcard.message}
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
          <div>
            Status: <span className="font-semibold">{postcard.status}</span>
          </div>
          {postcard.status === 'pending' && (
            <div>
              Delivery: {new Date(postcard.deliveryAt).toLocaleString()}
            </div>
          )}
        </div>

        {isUnread && onRead && (
          <button
            onClick={() => onRead(postcard.id)}
            disabled={reading}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {reading ? 'Marking...' : 'Mark as Read'}
          </button>
        )}

        <button
          onClick={onClose}
          className="w-full mt-2 px-4 py-2 border rounded hover:bg-gray-50"
        >
          Close
        </button>
      </div>
    </div>
  );
}

