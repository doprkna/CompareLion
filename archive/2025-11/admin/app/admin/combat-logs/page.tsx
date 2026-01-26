/**
 * Admin Combat Logs Page
 * v0.36.27 - Combat Log 1.0
 */

'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Loader2, Filter, Send, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

type CombatLog = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  refId: string | null;
  isRead: boolean;
  createdAt: Date;
  user: {
    id: string;
    username: string | null;
    name: string | null;
    email: string | null;
  };
};

const TYPE_ICONS: Record<string, string> = {
  achievement: '🏆',
  fight: '⚔️',
  quest: '📘',
  levelup: '⭐',
  loot: '🎁',
  system: '🛠️',
  social: '💬',
};

export default function AdminCombatLogsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [combatLogs, setCombatLogs] = useState<CombatLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('');
  const [filterUserId, setFilterUserId] = useState<string>('');
  const [sendUserId, setSendUserId] = useState<string>('');
  const [sendTitle, setSendTitle] = useState<string>('');
  const [sendBody, setSendBody] = useState<string>('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    loadCombatLogs();
  }, [status, filterType, filterUserId]);

  const loadCombatLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterType) params.set('type', filterType);
      if (filterUserId) params.set('userId', filterUserId