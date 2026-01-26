'use client';
// sanity-fix
'use client';
import { useEffect } from 'react';
import { useFriendsStore, useDuelsStore, useSocialFeedStore, useFriendRequestStore, useStartDuelStore, } from '../state/stores/socialStore'; // sanity-fix: replaced @parel/core/state/stores self-import with relative import
export function useFriends() {
    const { state, load, reload } = useFriendsStore();
    useEffect(() => {
        load();
    }, [load]);
    return { friends: state.data?.friends || [], loading: state.loading, error: state.error, reload };
}
export function useDuels() {
    const { state, load, reload } = useDuelsStore();
    useEffect(() => {
        load();
    }, [load]);
    return { duels: state.data?.duels || [], loading: state.loading, error: state.error, reload };
}
export function useSocialFeed() {
    const { state, load, reload } = useSocialFeedStore();
    useEffect(() => {
        load();
    }, [load]);
    return { feed: state.data?.feed || [], loading: state.loading, error: state.error, reload };
}
export function useFriendRequest() {
    const { sendRequest, loading, error } = useFriendRequestStore();
    return { sendRequest, loading, error };
}
export function useStartDuel() {
    const { startDuel, loading, error } = useStartDuelStore();
    return { startDuel, loading, error };
}
