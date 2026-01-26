"use client";
import { useRouter } from 'next/navigation';
import { useSubmitCreation } from '@parel/core';
import { CommunitySubmitForm } from '@/components/community/CommunitySubmitForm';

export default function CommunitySubmitPage() {
  const router = useRouter();
  const { submit, loading, error } = useSubmitCreation();

  const handleSubmit = async (data: {
    title: string;
    type: 'question' | 'mission' | 'item' | 'other';
    content: string;
    rewardXP?: number;
    rewardKarma?: number;
  }) => {
    try {
      await submit({
        ...data,
        content: data.content, // Keep as string for now
      });
      alert('Creation submitted! It will appear after admin approval.');
      router.push('/community');
    } catch (e) {
      // Error handled in form
      throw e;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Submit Community Creation</h2>
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      <CommunitySubmitForm onSubmit={handleSubmit} loading={loading} />
    </div>
  );
}

