"use client";

interface PostcardCardProps {
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
  onOpen?: (postcard: any) => void;
  onRead?: (postcardId: string) => void;
  reading?: boolean;
}

export function PostcardCard({ postcard, type, onOpen, onRead, reading }: PostcardCardProps) {
  const isUnread = type === 'inbox' && postcard.status === 'delivered';
  const isPending = postcard.status === 'pending';
  const deliveryTime = new Date(postcard.deliveryAt);
  const now = new Date();
  const isDelivered = deliveryTime <= now && !isPending;

  const getStatusText = () => {
    if (isPending) return 'On the way...';
    if (isUnread) return 'Delivered';
    if (postcard.status === 'read') return 'Read';
    return postcard.status;
  };

  const getStatusColor = () => {
    if (isPending) return 'text-yellow-600';
    if (isUnread) return 'text-green-600';
    if (postcard.status === 'read') return 'text-blue-600';
    return 'text-gray-600';
  };

  const otherUser = type === 'inbox' ? postcard.sender : postcard.receiver;
  const userName = otherUser?.username || otherUser?.name || 'Unknown';

  return (
    <div
      className={`rounded border p-4 mb-3 cursor-pointer hover:shadow-md transition ${
        isUnread ? 'border-blue-500 bg-blue-50' : 'bg-white'
      }`}
      onClick={() => onOpen?.(postcard)}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">✉️</span>
          <div>
            <div className="font-semibold">
              {type === 'inbox' ? `From: ${userName}` : `To: ${userName}`}
            </div>
            <div className={`text-xs ${getStatusColor()}`}>{getStatusText()}</div>
          </div>
        </div>
        {isUnread && onRead && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRead(postcard.id);
            }}
            disabled={reading}
            className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            Mark Read
          </button>
        )}
      </div>

      <div className="text-sm text-gray-700 mb-2 line-clamp-2">
        {postcard.message}
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>{new Date(postcard.createdAt).toLocaleDateString()}</span>
        {isPending && (
          <span className="text-yellow-600">
            ETA: {deliveryTime.toLocaleTimeString()}
          </span>
        )}
      </div>
    </div>
  );
}

