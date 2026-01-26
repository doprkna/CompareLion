'use client';
// sanity-fix
/**
 * useLifeRewardScreen Hook
 * v0.41.17 - Migrated to unified state store
 */
'use client';
import { useCallback } from 'react';
import { LifeRewardScreen } from './LifeRewardScreen'; // sanity-fix
import { useLifeRewardStore } from '@parel/core/state/stores/lifeRewardStore';
export function useLifeRewardScreen() {
    const { isOpen, rewardData, triggerLifeReward, close } = useLifeRewardStore();
    const LifeRewardScreenComponent = useCallback(() => {
        if (!rewardData)
            return null;
        return (<LifeRewardScreen open={isOpen} onClose={close} data={rewardData}/>);
    }, [isOpen, rewardData, close]);
    return {
        triggerLifeReward,
        LifeRewardScreen: LifeRewardScreenComponent,
        isOpen,
        close,
    };
}