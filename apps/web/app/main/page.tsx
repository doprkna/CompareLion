import React from 'react';

export default function MainPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded shadow">
        <h1 className="text-2xl font-bold mb-4">Main</h1>
        <p className="text-gray-600 mb-6">This is a placeholder for the main dashboard/home page after login.</p>
        <div className="border rounded p-4">
          <h2 className="font-semibold mb-2">News</h2>
          <p className="text-sm text-gray-500">[TODO: News modal/section]</p>
        </div>
      </div>
    </div>
  );
}
