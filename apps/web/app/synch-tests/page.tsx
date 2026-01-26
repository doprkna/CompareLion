"use client";
import Link from 'next/link';
import { useSynchTests, useStartSynchTest } from '@parel/core/hooks/useSynchTests';
import { SynchInviteModal } from '@/components/synch-tests/SynchInviteModal';
import { useState } from 'react';

export default function SynchTestsPage() {
  const { tests, loading, error } = useSynchTests();
  const { start, loading: starting } = useStartSynchTest();
  const [inviteModal, setInviteModal] = useState<{ open: boolean; testId: string | null }>({ open: false, testId: null });

  const handleStartRandom = async (testId: string) => {
    try {
      const test = await start(testId);
      if (test?.id) {
        window.location.href = `/synch-tests/${test.id}`;
      }
    } catch (e) {
      console.error('Failed to start test', e);
    }
  };

  const handleInvite = async (userId: string) => {
    if (!inviteModal.testId) return;
    try {
      const test = await start(inviteModal.testId, userId);
      if (test?.id) {
        window.location.href = `/synch-tests/${test.id}`;
      }
      setInviteModal({ open: false, testId: null });
    } catch (e) {
      console.error('Failed to invite', e);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 flex flex-col gap-4">
      <h2 className="text-2xl font-bold">Compatibility Tests</h2>
      {loading && <div>Loading…</div>}
      {error && <div className="text-red-600 text-sm">{error}</div>}
      <div className="grid gap-4">
        {tests.map((test) => (
          <div key={test.id} className="rounded border p-4">
            <h3 className="text-lg font-semibold mb-2">{test.title}</h3>
            {test.description && <p className="text-sm text-gray-700 mb-3">{test.description}</p>}
            <div className="flex gap-2">
              <button
                onClick={() => handleStartRandom(test.id)}
                disabled={starting}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                Start Random Match
              </button>
              <button
                onClick={() => setInviteModal({ open: true, testId: test.id })}
                className="px-4 py-2 border rounded hover:bg-gray-50"
              >
                Invite Friend
              </button>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              Rewards: {test.rewardXP} XP • {test.rewardKarma} Karma
            </div>
          </div>
        ))}
      </div>
      <SynchInviteModal
        isOpen={inviteModal.open}
        onClose={() => setInviteModal({ open: false, testId: null })}
        onInvite={handleInvite}
        loading={starting}
      />
    </div>
  );
}

