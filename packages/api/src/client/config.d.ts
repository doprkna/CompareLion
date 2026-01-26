/**
 * API Client Configuration
 * Default configuration and config factory
 * v0.41.11 - C3 Step 12: API Client Consolidation (Foundation Layer)
 */
import type { ApiClientConfig } from './types';
/**
 * Default API client configuration
 */
export declare function getDefaultConfig(): Required<ApiClientConfig>;
/**
 * Create API client configuration with overrides
 */
export declare function createClientConfig(overrides?: Partial<ApiClientConfig>): Required<ApiClientConfig>;
