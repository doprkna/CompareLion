"use client";
import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';

interface BuyDialogProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  price: { currencyCode: string; unitAmount: number };
  onConfirm: (method: 'stripe' | 'funds' | 'diamonds') => void;
}

export function BuyDialog({ isOpen, onClose, productId, price, onConfirm }: BuyDialogProps) {
  const [method, setMethod] = useState<'stripe' | 'funds' | 'diamonds'>('stripe');
  const [loading, setLoading] = useState(false);

  const handleBuy = async () => {
    setLoading(true);
    await onConfirm(method);
    setLoading(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed z-10 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen">
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
        <div className="bg-white rounded p-6 z-20 w-80">
          <Dialog.Title className="text-lg font-semibold mb-4">Confirm Purchase</Dialog.Title>
          <p className="mb-4">{`Buy for ${price.currencyCode} ${price.unitAmount/100}`}</p>
          <div className="mb-4">
            <label className="block mb-1">Payment Method</label>
            <select
              className="w-full border rounded p-2"
              value={method}
              onChange={e => setMethod(e.target.value as any)}
            >
              <option value="stripe">Stripe</option>
              <option value="funds">Funds</option>
              <option value="diamonds">Diamonds</option>
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
            <button onClick={handleBuy} disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50">{loading ? 'Processing...' : 'Confirm'}</button>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
