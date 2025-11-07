"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog } from '@headlessui/react';
import LedgerTable from './LedgerTable';
import { logger } from '@/lib/logger';

export default function ShopHeader() {
  const [funds, setFunds] = useState<number>(0);
  const [diamonds, setDiamonds] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [showLedger, setShowLedger] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function loadWallet() {
      const res = await fetch('/api/wallet');
      const data = await res.json();
      if (data.success) {
        setFunds(data.funds);
        setDiamonds(data.diamonds);
      }
    }
    loadWallet();
  }, []);

  const handleCheckout = async (type: 'funds' | 'diamonds') => {
    setLoading(true);
    try {
      const res = await fetch('/api/shop/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: type === 'funds' ? 'funds-pack' : 'diamonds-pack', quantity: 1 }),
      });
      const data = await res.json();
      if (data.success && data.url) {
        window.location.assign(data.url);
      }
    } catch (err) {
      logger.error('Checkout error', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePortal = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/shop/stripe/portal', { method: 'POST' });
      const data = await res.json();
      if (data.success && data.url) {
        window.location.assign(data.url);
      }
    } catch (err) {
      logger.error('Portal error', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <div className="bg-white p-4 rounded shadow flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
      <div className="text-lg font-semibold">
        Funds: <span className="text-blue-600">{funds}</span> • Diamonds: <span className="text-purple-600">{diamonds}</span>
      </div>
      <div className="mt-4 sm:mt-0 flex gap-2">
        <button
          onClick={() => handleCheckout('funds')}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50"
        >
          Add Funds
        </button>
        <button
          onClick={() => handleCheckout('diamonds')}
          disabled={loading}
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition disabled:opacity-50"
        >
          Get Diamonds
        </button>
        <button
          onClick={handlePortal}
          disabled={loading}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition disabled:opacity-50"
        >
          Open Portal
        </button>
        <button
          onClick={() => setShowLedger(true)}
          className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition disabled:opacity-50"
        >
          View Ledger
        </button>
      </div>
    </div>

    {/* Ledger Modal */}
    <Dialog open={showLedger} onClose={() => setShowLedger(false)} className="fixed z-10 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen">
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
        <div className="bg-white rounded p-6 z-20 w-full max-w-2xl">
          <Dialog.Title className="text-lg font-semibold mb-4">Ledger</Dialog.Title>
          <LedgerTable />
          <div className="mt-4 text-right">
            <button onClick={() => setShowLedger(false)} className="px-4 py-2 bg-blue-600 text-white rounded">Close</button>
          </div>
        </div>
      </div>
    </Dialog>
    </>
  );
}
