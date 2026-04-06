import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface AdminWipPageProps {
  title: string;
}

export function AdminWipPage({ title }: AdminWipPageProps) {
  return (
    <div className="min-h-screen bg-bg p-6">
      <div className="max-w-2xl mx-auto space-y-4">
        <h1 className="text-2xl font-bold text-text">{title}</h1>
        <p className="text-subtle">Not implemented yet.</p>
        <Button asChild variant="outline">
          <Link href="/admin">Back to Admin</Link>
        </Button>
      </div>
    </div>
  );
}
