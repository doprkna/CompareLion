'use client';
// sanity-fix
/**
 * useQuestLore Hook
 * Fetches quest lore
 * v0.41.14 - Migrated GET call to unified API client
 */
'use client';
import { useState } from 'react';
import { defaultClient, ApiClientError } from '@parel/api'; // sanity-fix: replaced @parel/api/client with @parel/api (client not exported as subpath)
export function useQuestLore(questId) {
    const [lore, setLore] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const fetchLore = async () => {
        if (!questId) {
            setLore(null);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const response = await defaultClient.get('/quests?includeLore=true');
            const quest = response?.data?.quests?.find((q) => q.questId === questId); // sanity-fix
            if (quest?.lore) {
                setLore(quest.lore);
            }
            else {
                setLore(null);
            }
        }
        catch (err) {
            const errorMessage = err instanceof ApiClientError
                ? err.message
                : err instanceof Error
                    ? err.message
                    : 'Failed to load lore';
            setError(errorMessage);
            setLore(null);
        }
        finally {
            setLoading(false);
        }
    };
    return { lore, loading, error, fetchLore };
}
export function useQuestClaimWithLore() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [lore, setLore] = useState(null);
    const claimWithLore = async (userQuestId) => {
        setLoading(true);
        setError(null);
        setLore(null);
        try {
            const res = await fetch('/api/quests/claim', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userQuestId }),
            });
            const data = await res.json();
            if (!data?.success) { // sanity-fix
                throw new Error(data?.error || 'Failed to claim quest');
            }
            // Set lore if returned
            if (data?.lore) { // sanity-fix
                setLore(data.lore);
            }
            return data;
        }
        catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to claim quest';
            setError(message);
            throw err;
        }
        finally {
            setLoading(false);
        }
    };
    return { claimWithLore, loading, error, lore };
}
