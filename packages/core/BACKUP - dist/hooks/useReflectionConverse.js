'use client';
import { useState } from 'react';
export function useReflectionConverse() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const converse = async (reflectionId, prompt) => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/reflection/converse', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reflectionId, prompt }),
            });
            const data = await res.json();
            if (!data.success) {
                throw new Error(data.error || 'Failed to converse with reflection');
            }
            return data.conversation;
        }
        catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to converse';
            setError(message);
            throw err;
        }
        finally {
            setLoading(false);
        }
    };
    return { converse, loading, error };
}
export function useReflectionConversation(reflectionId) {
    const [conversation, setConversation] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const fetchConversation = async () => {
        if (!reflectionId) {
            setConversation(null);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/reflection/conversation/${reflectionId}`);
            const data = await res.json();
            if (!data.success) {
                throw new Error(data.error || 'Failed to fetch conversation');
            }
            setConversation(data.conversation);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load conversation');
            setConversation(null);
        }
        finally {
            setLoading(false);
        }
    };
    return { conversation, loading, error, reload: fetchConversation };
}
