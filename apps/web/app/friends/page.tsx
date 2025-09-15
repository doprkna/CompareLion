import React from 'react';

export default function FriendsPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded shadow">
        <h1 className="text-2xl font-bold mb-4">Friends / Group</h1>
        <p className="text-gray-600 mb-6">This is a placeholder for the friends/group page.</p>
        <div className="space-y-4">
          <div className="border rounded p-4">
            <h2 className="font-semibold mb-2">Create Q</h2>
            <p className="text-sm text-gray-500">[TODO: Create Q section]</p>
          </div>
          <div className="border rounded p-4">
            <h2 className="font-semibold mb-2">Review Q</h2>
            <p className="text-sm text-gray-500">[TODO: Review Q section]</p>
          </div>
          <div className="border rounded p-4">
            <h2 className="font-semibold mb-2">Invite Friend</h2>
            <p className="text-sm text-gray-500">[TODO: Invite friend action]</p>
          </div>
        </div>
      </div>
    </div>
  );
}
