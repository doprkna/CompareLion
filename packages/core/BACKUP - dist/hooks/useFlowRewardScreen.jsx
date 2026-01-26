/**
 * useFlowRewardScreen Hook
 * v0.41.17 - Migrated to unified state store
 */
'use client';
import { useCallback } from 'react';
import { FlowRewardScreen } from './FlowRewardScreen'; // sanity-fix
import { useFlowRewardStore } from '../state/stores/flowRewardStore'; // sanity-fix: replaced @parel/core/state/stores self-import with relative import
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
