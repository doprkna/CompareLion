'use client';

/**
 * Moderation Actions
 * v0.20.1 - Action buttons for moderating content
 */

import { Button } from '@/components/ui/button';
import { showToast } from '@/lib/toast';

interface ModerationActionsProps {
  targetType: string;
  targetId: string;
  authorId: string;
  onActionComplete: () => void;
}

export function ModerationActions({ 
  targetType, 
  targetId, 
  authorId,
  onActionComplete 
}: ModerationActionsProps) {
  const handleMarkReviewed = async () => {
    if (!confirm('Mark this content as reviewed?')) return;

    try {
      const response = await fetch('/api/moderation/review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetType,
          targetId,
          reason: 'Reviewed by moderator',
        }),
      });

      if (response.ok) {
        showToast('Content marked as reviewed ✅', 'success');
        onActionComplete();
      } else {
        showToast('Failed to mark as reviewed', 'error');
      }
    } catch (err) {
      console.error('Error marking as reviewed:', err);
      showToast('Error marking as reviewed', 'error');
    }
  };

  const handleDelete = async () => {
    const reason = prompt('Enter deletion reason:');
    if (!reason) return;

    if (!confirm('Are you sure you want to delete this content?')) return;

    try {
      const response = await fetch('/api/moderation/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetType,
          targetId,
          reason,
        }),
      });

      if (response.ok) {
        showToast('Content deleted ❌', 'success');
        onActionComplete();
      } else {
        showToast('Failed to delete content', 'error');
      }
    } catch (err) {
      console.error('Error deleting content:', err);
      showToast('Error deleting content', 'error');
    }
  };

  const handleBanUser = async () => {
    const reason = prompt('Enter ban reason:');
    if (!reason) return;

    if (!confirm('Are you sure you want to ban this user?')) return;

    try {
      const response = await fetch('/api/moderation/ban', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: authorId,
          reason,
        }),
      });

      if (response.ok) {
        showToast('User banned 🚫', 'success');
        onActionComplete();
      } else {
        const data = await response.json();
        showToast(data.error || 'Failed to ban user', 'error');
      }
    } catch (err) {
      console.error('Error banning user:', err);
      showToast('Error banning user', 'error');
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        onClick={handleMarkReviewed}
        size="sm"
        variant="outline"
        className="bg-yellow-50 hover:bg-yellow-100 dark:bg-yellow-950 dark:hover:bg-yellow-900"
      >
        Mark Reviewed
      </Button>
      <Button
        onClick={handleDelete}
        size="sm"
        variant="destructive"
      >
        Delete
      </Button>
      <Button
        onClick={handleBanUser}
        size="sm"
        variant="outline"
        className="bg-gray-50 hover:bg-gray-100 dark:bg-gray-950 dark:hover:bg-gray-900"
      >
        Ban User
      </Button>
    </div>
  );
}

