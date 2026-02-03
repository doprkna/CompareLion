/**
 * API Map Script
 *
 * Maps all API routes, their methods, models, and FE usage
 * v0.30.3 - API & Schema Sanity Audit
 *
 * Usage:
 *   pnpm tsx scripts/api-map.ts
 */
interface ApiRoute {
    path: string;
    methods: string[];
    models: string[];
    status: 'ok' | 'missing-model' | 'no-fe';
    hasTodo?: boolean;
    hasPlaceholder?: boolean;
    filePath: string;
}
interface ApiMap {
    timestamp: string;
    totalRoutes: number;
    routesByMethod: Record<string, number>;
    modelsUsed: string[];
    orphanedModels: string[];
    routesWithoutFe: string[];
    routes: ApiRoute[];
    routesBySystem: Record<string, ApiRoute[]>;
}
/**
 * Main function
 */
declare function main(): Promise<ApiMap>;
export { main };
