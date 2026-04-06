/**
 * Build-time Information
 *
 * This file embeds version and build metadata at compile time
 * to avoid requiring package.json at runtime.
 */
export declare const BUILD_INFO: {
    readonly version: "0.12.8";
    readonly buildTime: string;
    readonly nodeVersion: string;
};
export declare function getRuntimeInfo(): {
    version: "0.12.8";
    buildTime: string;
    commit: string | null;
    env: {
        node: string;
        runtime: "edge" | "node";
    };
};
