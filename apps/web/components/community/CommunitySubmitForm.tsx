"use client";
import { useState } from 'react';

interface SubmitFormProps {
  onSubmit: (data: {
    title: string;
    type: 'question' | 'mission' | 'item' | 'other';
    content: string;
    rewardXP?: number;
    rewardKarma?: number;
  }) => Promise<void>;
  loading?: boolean;
}

export function CommunitySubmitForm({ onSubmit, loading }: SubmitFormProps) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'question' | 'mission' | 'item' | 'other'>('other');
  const [content, setContent] = useState('');
  const [rewardXP, setRewardXP] = useState<number | undefined>();
  const [rewardKarma, setRewardKarma] = useState<number | undefined>();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (title.length < 3 || title.length > 200) {
      setError('Title must be 3-200 characters');
      return;
    }

    if (content.length < 10 || content.length > 5000) {
      setError('Content must be 10-5000 characters');
      return;
    }

    try {
      await onSubmit({
        title: title.trim(),
        type,
        content: content.trim(),
        rewardXP: rewardXP && rewardXP > 0 ? rewardXP : undefined,
        rewardKarma: rewardKarma && rewardKarma > 0 ? rewardKarma : undefined,
      });
      // Reset form
      setTitle('');
      setContent('');
      setRewardXP(undefined);
      setRewardKarma(undefined);
    } catch (e: any) {
      setError(e?.message || 'Failed to submit creation');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-4 space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Title *</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter creation title..."
          className="w-full p-2 border rounded"
          required
          maxLength={200}
          disabled={loading}
        />
        <div className="text-xs text-gray-500 mt-1">{title.length}/200</div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Type *</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as any)}
          className="w-full p-2 border rounded"
          required
          disabled={loading}
        >
          <option value="question">Question</option>
          <option value="mission">Mission</option>
          <option value="item">Item</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Content *</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Enter creation content..."
          className="w-full p-2 border rounded h-32"
          required
          maxLength={5000}
          disabled={loading}
        />
        <div className="text-xs text-gray-500 mt-1">{content.length}/5000</div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Reward XP (optional)</label>
          <input
            type="number"
            value={rewardXP || ''}
            onChange={(e) => setRewardXP(e.target.value ? parseInt(e.target.value) : undefined)}
            placeholder="0-1000"
            className="w-full p-2 border rounded"
            min={0}
            max={1000}
            disabled={loading}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Reward Karma (optional)</label>
          <input
            type="number"
            value={rewardKarma || ''}
            onChange={(e) => setRewardKarma(e.target.value ? parseInt(e.target.value) : undefined)}
            placeholder="0-500"
            className="w-full p-2 border rounded"
            min={0}
            max={500}
            disabled={loading}
          />
        </div>
      </div>

      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}

      <button
        type="submit"
        disabled={loading || !title.trim() || !content.trim()}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Submitting...' : 'Submit Creation'}
      </button>

      <div className="text-xs text-gray-500 text-center">
        Submissions require admin approval before appearing publicly.
      </div>
    </form>
  );
}

