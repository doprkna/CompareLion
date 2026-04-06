'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { apiFetch } from '@/lib/apiBase';
import { Input } from '@/components/ui/input';
import { useXp } from '@/components/XpProvider';
import { useToast } from '@/components/ui/use-toast';
import { useEventBus } from '@parel/core/hooks/useEventBus';
import { EmptyState } from '@/components/ui/EmptyState';
import { MessageCircle } from 'lucide-react';
import { logger } from '@/lib/logger';

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
  isRead: boolean;
  sender: { id: string; email: string; name: string | null };
  receiver: { id: string; email: string; name: string | null };
}

export function MessagesTab() {
  const { data: session } = useSession();
  const { triggerXp } = useXp();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [toEmail, setToEmail] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoadError(null);
    const res = await apiFetch<{ success?: boolean; messages?: Message[] }>('/api/messages');
    if ((res as any).ok && (res as any).data?.messages) {
      setMessages((res as any).data.messages);
    } else {
      setLoadError((res as any).error || 'Failed to load messages');
    }
  }, []);

  useEventBus(
    'message:new',
    useCallback(
      (msg: any) => {
        toast({
          title: '💬 New Message',
          description: `From: ${msg.senderEmail}`,
        });
        load();
      },
      [load, toast]
    )
  );

  useEffect(() => {
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [load]);

  async function send() {
    if (!toEmail || !content) return;
    setLoading(true);
    try {
      const res = await apiFetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toEmail, content }),
      });

      if ((res as any).ok) {
        triggerXp(5, 'xp');
        toast({
          title: '+5 XP — Social Interaction! 💬',
          description: 'Message sent successfully',
          duration: 3000,
        });
        setContent('');
        setToEmail('');
        load();
      } else {
        toast({
          title: 'Error',
          description: 'Failed to send message',
          duration: 3000,
        });
      }
    } catch (error) {
      logger.error('Send error', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const currentUserEmail = session?.user?.email;

  return (
    <div className="space-y-6">
      {loadError && (
        <div className="bg-card border-2 border-red-500/30 rounded-xl p-4 text-red-500 text-sm">
          {loadError} — <button onClick={load} className="underline">Retry</button>
        </div>
      )}
      <div className="bg-card border-2 border-border rounded-xl p-6">
        <h2 className="text-xl font-bold text-text mb-4">Send Message</h2>
        <div className="flex gap-3 flex-wrap">
          <Input
            placeholder="Receiver email (e.g., demo1@example.com)"
            value={toEmail}
            onChange={(e) => setToEmail(e.target.value)}
            className="w-full sm:w-64 bg-bg border-border text-text"
            disabled={loading}
          />
          <Input
            placeholder="Type your message..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="flex-1 min-w-[200px] bg-bg border-border text-text"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !loading) send();
            }}
            disabled={loading}
          />
          <button
            onClick={send}
            disabled={loading || !toEmail || !content}
            className="px-6 py-2 bg-accent text-white rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Sending...' : 'Send'}
          </button>
        </div>
        <p className="text-xs text-subtle mt-2">💡 Earn +5 XP for each message sent!</p>
      </div>

      <div className="bg-card border-2 border-border rounded-xl p-6">
        <h2 className="text-xl font-bold text-text mb-4">Inbox & Sent ({messages.length})</h2>
        <div className="space-y-3 max-h-[60vh] overflow-y-auto">
          {messages.length === 0 ? (
            <EmptyState
              icon={MessageCircle}
              title="No Messages Yet"
              description="Your inbox is empty! Send your first message using the form above to start connecting with other users and earn XP."
            />
          ) : (
            messages.map((m) => {
              const isSent = m.sender.email === currentUserEmail;
              const otherUser = isSent ? m.receiver : m.sender;
              return (
                <div
                  key={m.id}
                  className={`border-2 rounded-lg p-4 transition ${
                    isSent ? 'border-border bg-bg/50' : !m.isRead ? 'border-accent bg-accent/5' : 'border-border bg-bg/50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{isSent ? '📤' : '📥'}</span>
                      <div>
                        <span className="text-text font-medium">
                          {isSent ? 'You' : otherUser.name || otherUser.email}
                        </span>
                        <span className="text-subtle mx-2">→</span>
                        <span className="text-subtle">
                          {isSent ? otherUser.name || otherUser.email : 'You'}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-xs text-subtle">{new Date(m.createdAt).toLocaleString()}</span>
                      {!isSent && !m.isRead && (
                        <span className="px-2 py-0.5 bg-accent text-white text-xs font-bold rounded">NEW</span>
                      )}
                    </div>
                  </div>
                  <p className="text-text pl-10">{m.content}</p>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-4">
        <p className="text-subtle text-sm text-center">
          💡 Try sending a message to demo1@example.com, demo2@example.com, etc.
        </p>
      </div>
    </div>
  );
}
