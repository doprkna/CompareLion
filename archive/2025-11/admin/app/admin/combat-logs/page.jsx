/**
 * Admin Combat Logs Page
 * v0.36.27 - Combat Log 1.0
 */
'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
const TYPE_ICONS = {
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
    const [combatLogs, setCombatLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState('');
    const [filterUserId, setFilterUserId] = useState('');
    const [sendUserId, setSendUserId] = useState('');
    const [sendTitle, setSendTitle] = useState('');
    const [sendBody, setSendBody] = useState('');
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
            if (filterType)
                params.set('type', filterType);
            if (filterUserId)
                params.set('userId', filterUserId);
        }
        finally { }
    };
}
