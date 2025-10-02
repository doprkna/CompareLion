"use client";
import React from 'react';
import useSWR from 'swr';

interface Entry {
  id: string;
  createdAt: string;
  currency: 'FUNDS' | 'DIAMONDS';
  kind: 'CREDIT' | 'DEBIT';
  amount: number;
  refType: string;
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function LedgerTable() {
  const { data, error } = useSWR('/api/wallet', fetcher);
  if (error) return <p className="p-4 text-red-600">Failed to load ledger.</p>;
  if (!data) return <p className="p-4">Loading ledger…</p>;

  const entries: Entry[] = data.ledgerPreview;

  return (
    <div className="overflow-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-gray-100">
            <th className="px-4 py-2 text-left">Date</th>
            <th className="px-4 py-2 text-left">Currency</th>
            <th className="px-4 py-2 text-right">Amount</th>
            <th className="px-4 py-2 text-left">Type</th>
          </tr>
        </thead>
        <tbody>
          {entries.map(e => (
            <tr key={e.id} className="border-b">
              <td className="px-4 py-2">{new Date(e.createdAt).toLocaleString()}</td>
              <td className="px-4 py-2">{e.currency}</td>
              <td className={`px-4 py-2 text-right ${e.amount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                {e.amount}
              </td>
              <td className="px-4 py-2">{e.kind}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
