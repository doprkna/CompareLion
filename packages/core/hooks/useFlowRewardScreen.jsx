'use client';
// sanity-fix
/**
 * useFlowRewardScreen Hook
 * v0.41.17 - Migrated to unified state store
 */
'use client';
import { useCallback } from 'react';
import { FlowRewardScreen } from './FlowRewardScreen'; // sanity-fix
import { useFlowRewardStore } from '@parel/core/state/stores/flowRewardStore';
export function useFlowRewardScreen() {
    const { isOpen, rewardData, triggerFlowReward, close } = useFlowRewardStore();
    const FlowRewardScreenComponent = useCallback(() => {
        if (!rewardData)
            return null;
        return (<FlowRewardScreen open={isOpen} onClose={close} data={rewardData}/>);
    }, [isOpen, rewardData, close]);
    return {
        triggerFlowReward,
        FlowRewardScreen: FlowRewardScreenComponent,
        isOpen,
        close,
    };
}