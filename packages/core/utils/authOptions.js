// sanity-fix: Stub for authOptions to make @parel/core independent of web app
// This should be overridden by the web app at runtime
export let authOptions = null;
export function setAuthOptions(options) {
    authOptions = options;
}
