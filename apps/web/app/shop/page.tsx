"use client";
import React, { useEffect, useState } from 'react';

export default function ShopPage() {
  const [funds, setFunds] = useState('0');
  const [diamonds, setDiamonds] = useState(0);
  const [loading, setLoading] = useState(true);
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${base}/api/profile`, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          setFunds(data.user.funds || '0');
          setDiamonds(data.user.diamonds || 0);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded shadow">
        <h1 className="text-2xl font-bold mb-4">Shop</h1>
        <div className="mb-6 flex gap-6 justify-center">
          <div className="flex flex-col items-center">
            <span className="text-sm text-gray-500">Funds ($)</span>
            <span className="text-xl font-bold text-blue-700">{loading ? '...' : funds}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-sm text-gray-500">Diamonds</span>
            <span className="text-xl font-bold text-blue-700">{loading ? '...' : diamonds}</span>
          </div>
        </div>
        <p className="text-gray-600 mb-6">This is a placeholder for the shop page.</p>
        <div className="space-y-4">
          <div className="border rounded p-4">
            <h2 className="font-semibold mb-2">Buy Funds</h2>
            <p className="text-sm text-gray-500">[TODO: Buy funds modal/section]</p>
          </div>
          <div className="border rounded p-4">
            <h2 className="font-semibold mb-2">Report Issue</h2>
            <p className="text-sm text-gray-500">[TODO: Report issue action]</p>
          </div>
        </div>
      </div>
    </div>
  );
}
