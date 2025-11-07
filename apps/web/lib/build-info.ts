/**
 * Build-time Information
 * 
 * This file embeds version and build metadata at compile time
 * to avoid requiring package.json at runtime.
 */

// These values are embedded at build time
export const BUILD_INFO = {
  version: '0.12.8',
  buildTime: new Date().toISOString(),
  nodeVersion: process.version,
} as const;

// Runtime information
export function getRuntimeInfo() {
  return {
    version: BUILD_INFO.version,
    buildTime: BUILD_INFO.buildTime,
    commit: process.env.VERCEL_GIT_COMMIT_SHA || 
            process.env.GIT_SHA || 
            null,
    env: {
      node: BUILD_INFO.nodeVersion,
      runtime: typeof EdgeRuntime !== 'undefined' ? 'edge' as const : 'node' as const,
    },
  };
}



