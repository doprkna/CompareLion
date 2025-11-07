"use client";
import { useState } from 'react';

interface PostcardSendModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (receiverId: string, message: string) => Promise<void>;
  receiverId?: string;
  receiverName?: string;
  loading?: boolean;
}

export function PostcardSendModal({
  isOpen,
  onClose,
  onSend,
  receiverId,
  receiverName,
  loading,
}: PostcardSendModalProps) {
  const [message, setMessage] = useState('');
  const [targetReceiverId, setTargetReceiverId] = useState(receiverId || '');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!targetReceiverId.trim()) {
      setError('Please enter a receiver ID');
      return;
    }

    if (message.trim().length < 1 || message.trim().length > 300) {
      setError('Message must be 1-300 characters');
      return;
    }

    try {
      await onSend(targetReceiverId.trim(), message.trim());
      setMessage('');
      setTargetReceiverId(receiverId || '');
      onClose();
    } catch (e: any) {
      setError(e?.message || 'Failed to send postcard');
    }
  };

  // Estimate delivery time (1-3 hours)
  const estimatedDelivery = new Date(Date.now() + (Math.random() * 2 + 1) * 60 * 60 * 1000);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-xl font-bold mb-4">Send Postcard</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Receiver ID *</label>
            <input
              type="text"
              value={targetReceiverId}
              onChange={(e) => setTargetReceiverId(e.target.value)}
              placeholder="Enter user ID or username"
              className="w-full p-2 border rounded"
              required
              disabled={loading || !!receiverId}
            />
            {receiverName && (
              <div className="text-xs text-gray-500 mt-1">To: {receiverName}</div>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Message *</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your postcard message..."
              className="w-full p-2 border rounded h-32"
              required
              maxLength={300}
              disabled={loading}
            />
            <div className="text-xs text-gray-500 mt-1">{message.length}/300</div>
          </div>

          {error && (
            <div className="mb-4 p-2 bg-red-100 text-red-700 text-sm rounded">{error}</div>
          )}

          <div className="mb-4 p-3 bg-blue-50 rounded text-sm text-gray-700">
            <div className="flex items-center gap-2 mb-1">
              <span>📮</span>
              <span className="font-semibold">Estimated Delivery:</span>
            </div>
            <div className="text-xs text-gray-600">
              ~1-3 hours ({estimatedDelivery.toLocaleTimeString()})
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Postcards travel the world, so delivery may take some time!
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border rounded hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              disabled={loading || !message.trim() || !targetReceiverId.trim()}
            >
              {loading ? 'Sending...' : 'Send Postcard'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

