// sanity-fix: Minimal stub for useXp to make @parel/core independent of web app
export function useXp() {
    return {
        triggerXp: (_amount, _variant) => {
            // No-op implementation
        },
    };
}
