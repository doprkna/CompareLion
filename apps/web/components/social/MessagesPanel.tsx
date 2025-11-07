'use client';

/**
 * Messages Panel
 * v0.20.0 - Direct messaging conversation view
 */

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { showToast } from '@/lib/toast';
import { MessageInput } from './MessageInput';
import { logger } from '@/lib/logger';

interface Message {
  id: string;
  content: string;
  createdAt: string;
  isRead: boolean;
  isSentByMe: boolean;
  sender: {
    id: string;
    username: string | null;
    name: string | null;
    avatarUrl: string | null;
  };
  flagged: boolean;
}

interface OtherUser {
  id: string;
  username: string | null;
  name: string | null;
  avatarUrl: string | null;
}

interface MessagesPanelProps {
  userId: string;
}

export function MessagesPanel({ userId }: MessagesPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [otherUser, setOtherUser] = useState<OtherUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages();
  }, [userId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/messages/thread/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
        setOtherUser(data.otherUser);
      } else {
        setError('Failed to load messages');
      }
    } catch (err) {
      logger.error('Failed to fetch messages', err);
      setError('Error loading messages');
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (content: string) => {
    try {
      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          receiverId: userId,
          content,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Add new message to list
        const newMessage: Message = {
          id: data.message.id,
          content: data.message.content,
          createdAt: data.message.createdAt,
          isRead: false,
          isSentByMe: true,
          sender: data.message.sender,
          flagged: data.message.flagged,
        };
        
        setMessages((prev) => [...prev, newMessage]);
        
        if (data.message.moderationWarning) {
          showToast(`⚠️ Message sent but flagged: ${data.message.moderationWarning.join(', ')}`, 'warning');
        } else {
          showToast('Message sent! 💬', 'success');
        }
      } else {
        const data = await response.json();
        showToast(data.error || 'Failed to send message', 'error');
      }
    } catch (err) {
      logger.error('Failed to send message', err);
      showToast('Error sending message', 'error');
    }
  };

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  if (loading) {
    return (
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center gap-3 animate-pulse">
            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700" />
            <div className="flex-1">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20" />
            </div>
          </div>
        </CardHeader>
      </Card>
    );
  }

  if (error || !otherUser) {
    return (
      <Card className="w-full max-w-2xl border-red-200 dark:border-red-800">
        <CardContent className="pt-6">
          <p className="text-red-600 dark:text-red-400">{error || 'User not found'}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl flex flex-col h-[600px]">
      {/* Header */}
      <CardHeader className="border-b flex-shrink-0">
        <div className="flex items-center gap-3">
          {otherUser.avatarUrl ? (
            <img
              src={otherUser.avatarUrl}
              alt={otherUser.username || otherUser.name || 'User'}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center text-white font-bold">
              {(otherUser.username || otherUser.name || 'U')[0].toUpperCase()}
            </div>
          )}
          <div className="flex-1">
            <CardTitle className="text-lg">{otherUser.username || otherUser.name}</CardTitle>
            <CardDescription>Direct Message</CardDescription>
          </div>
          <Button
            onClick={fetchMessages}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            title="Refresh messages"
          >
            <span className="text-lg">🔄</span>
          </Button>
        </div>
      </CardHeader>

      {/* Messages */}
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-2">💬</div>
            <p className="text-muted-foreground">No messages yet</p>
            <p className="text-sm text-muted-foreground mt-1">Send a message to start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isSentByMe ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-lg px-4 py-2 ${
                  message.isSentByMe
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                } ${message.flagged ? 'border-2 border-yellow-500' : ''}`}
              >
                <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                <div className="flex items-center gap-2 mt-1">
                  <p className={`text-xs ${message.isSentByMe ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                    {formatTime(message.createdAt)}
                  </p>
                  {message.isSentByMe && message.isRead && (
                    <span className="text-xs">✓✓</span>
                  )}
                  {message.flagged && (
                    <span className="text-xs" title="Flagged content">⚠️</span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </CardContent>

      {/* Input */}
      <div className="border-t p-4 flex-shrink-0">
        <MessageInput onSend={handleSendMessage} />
      </div>
    </Card>
  );
}

