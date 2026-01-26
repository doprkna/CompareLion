// sanity-fix: Stub for authOptions to make @parel/core independent of web app
// This should be overridden by the web app at runtime
export let authOptions: any = null;

export function setAuthOptions(options: any): void {
  authOptions = options;
}

