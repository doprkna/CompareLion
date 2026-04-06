import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { NewsListClient } from './NewsListClient';

const CATEGORIES = [
  { value: '', label: 'All' },
  { value: 'FEATURE', label: 'Feature' },
  { value: 'UPDATE', label: 'Update' },
  { value: 'NEWS', label: 'News' },
  { value: 'PROMO', label: 'Promo' },
  { value: 'ALERT', label: 'Alert' },
] as const;

export default async function NewsPage() {
  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-3xl font-bold text-text mb-6">News & Updates</h1>
        <NewsListClient categories={CATEGORIES} />
      </div>
    </div>
  );
}
