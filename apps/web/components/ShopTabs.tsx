"use client";
import { useSearchParams, useRouter } from 'next/navigation';
import React from 'react';

const tabs = [
  { key: 'currency', label: 'Currency' },
  { key: 'cosmetics', label: 'Cosmetics' },
  { key: 'my-items', label: 'My Items' },
  { key: 'subscription', label: 'Subscription' },
];

export function ShopTabs() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const current = searchParams.get('tab') || 'currency';

  const handleClick = (key: string) => {
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    params.set('tab', key);
    router.replace(`${window.location.pathname}?${params.toString()}`);
  };

  return (
    <div className="flex border-b mb-4">
      {tabs.map(tab => (
        <button
          key={tab.key}
          onClick={() => handleClick(tab.key)}
          className={`px-4 py-2 -mb-px font-medium ${current === tab.key ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-800'}`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
