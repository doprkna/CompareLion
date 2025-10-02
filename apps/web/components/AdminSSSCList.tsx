import { useEffect, useState } from 'react';
import Link from 'next/link';

interface SssCategoryDTO {
  id: string;
  label: string;
  status: string;
  sizeTag: string | null;
  lastRun: Date | null;
  version: number;
}

export function AdminSSSCList() {
  const [entries, setEntries] = useState<SssCategoryDTO[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/admin/sssc/pending')
      .then(res => res.json())
      .then(data => setEntries(data.entries))
      .catch(console.error);
  }, []);

  const handleGenerate = async (id: string) => {
    setLoading(true);
    await fetch(`/api/admin/sssc/${id}/generate`, { method: 'POST' });
    setLoading(false);
  };

  return (
    <div>
      <h2>Pending Sub-Sub-Sub Categories</h2>
      {entries.length === 0 && <p>No pending items.</p>}
      <table>
        <thead>
          <tr><th>Label</th><th>Status</th><th>Actions</th><th>Review</th></tr>
        </thead>
        <tbody>
          {entries.map(e => (
            <tr key={e.id}>
              <td>{e.label}</td>
              <td>{e.status}</td>
              <td>
                <button disabled={loading} onClick={() => handleGenerate(e.id)}>
                  Generate Now
                </button>
              </td>
              <td>
                <Link href={`/admin/sssc/${e.id}/questions`}>
                  <button>Review</button>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
