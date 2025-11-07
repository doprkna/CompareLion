"use client";

interface CommunityCardProps {
  creation: {
    id: string;
    title: string;
    type: string;
    content: any;
    likes: number;
    likesCount?: number;
    rewardXP?: number;
    rewardKarma?: number;
    createdAt: string;
    user: {
      id: string;
      username?: string;
      name?: string;
      avatarUrl?: string;
    };
    status?: string;
  };
  onLike?: (creationId: string) => void;
  liked?: boolean;
  liking?: boolean;
}

export function CommunityCard({ creation, onLike, liked, liking }: CommunityCardProps) {
  const contentStr = typeof creation.content === 'string' 
    ? creation.content 
    : JSON.stringify(creation.content, null, 2);

  const statusColor = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
  }[creation.status || 'approved'] || 'bg-gray-100 text-gray-800';

  return (
    <div className="rounded border p-4 mb-4">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-semibold">{creation.title}</h3>
            {creation.status && (
              <span className={`px-2 py-1 text-xs rounded ${statusColor}`}>
                {creation.status}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <span className="text-xs bg-gray-100 px-2 py-1 rounded">{creation.type}</span>
            <span>by {creation.user.username || creation.user.name || 'Unknown'}</span>
            <span>•</span>
            <span>{new Date(creation.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      <div className="mb-3 text-sm text-gray-700 whitespace-pre-wrap break-words">
        {contentStr.substring(0, 200)}
        {contentStr.length > 200 && '...'}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm">
          <button
            onClick={() => onLike?.(creation.id)}
            disabled={liking || liked}
            className={`flex items-center gap-1 px-3 py-1 rounded transition ${
              liked
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            } disabled:opacity-50`}
          >
            <span>👍</span>
            <span>{creation.likesCount || creation.likes}</span>
          </button>
          {(creation.rewardXP || creation.rewardKarma) && (
            <div className="text-xs text-gray-600">
              {creation.rewardXP && <span>+{creation.rewardXP} XP</span>}
              {creation.rewardXP && creation.rewardKarma && <span> • </span>}
              {creation.rewardKarma && <span>+{creation.rewardKarma} Karma</span>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

