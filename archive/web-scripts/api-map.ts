/**
 * API Map Script
 * 
 * Maps all API routes, their methods, models, and FE usage
 * v0.30.3 - API & Schema Sanity Audit
 * 
 * Usage:
 *   pnpm tsx scripts/api-map.ts
 */

import { readdir, readFile, writeFile, mkdir } from 'fs/promises';
import { join, dirname, relative } from 'path';
import { readFileSync } from 'fs';

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

// Prisma model patterns
const PRISMA_MODEL_PATTERN = /prisma\.(\w+)/gi;
const PRISMA_QUERY_PATTERN = /prisma\.(\w+)\.(findMany|findFirst|findUnique|create|update|upsert|delete|count)/gi;

// Method patterns
const METHOD_PATTERN = /export\s+(const\s+)?(GET|POST|PUT|PATCH|DELETE|OPTIONS|HEAD)\s*=/gi;

// Comment patterns
const TODO_PATTERN = /@todo|TODO|FIXME/gi;
const PLACEHOLDER_PATTERN = /@placeholder|PLACEHOLDER|placeholder/gi;

// FE fetch patterns
const FETCH_PATTERN = /fetch\(['"]\/api\/([^'"]+)/gi;

/**
 * Recursively find all route.ts files
 */
async function findRouteFiles(dir: string, baseDir: string = dir): Promise<string[]> {
  const files: string[] = [];
  
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      
      if (entry.isDirectory()) {
        // Skip node_modules and .next
        if (entry.name === 'node_modules' || entry.name === '.next' || entry.name.startsWith('.')) {
          continue;
        }
        
        const subFiles = await findRouteFiles(fullPath, baseDir);
        files.push(...subFiles);
      } else if (entry.name === 'route.ts' || entry.name === 'route.tsx') {
        files.push(fullPath);
      }
    }
  } catch (error) {
    // Skip directories we can't read
  }
  
  return files;
}

/**
 * Extract HTTP methods from a route file
 */
function extractMethods(content: string): string[] {
  const methods = new Set<string>();
  let match;
  
  const regex = new RegExp(METHOD_PATTERN);
  while ((match = regex.exec(content)) !== null) {
    methods.add(match[2]);
  }
  
  return Array.from(methods);
}

/**
 * Extract Prisma models from a route file
 */
function extractModels(content: string): string[] {
  const models = new Set<string>();
  let match;
  
  const regex = new RegExp(PRISMA_QUERY_PATTERN);
  while ((match = regex.exec(content)) !== null) {
    models.add(match[1]);
  }
  
  // Also check for prisma.modelName patterns
  const regex2 = new RegExp(PRISMA_MODEL_PATTERN);
  while ((match = regex2.exec(content)) !== null) {
    models.add(match[1]);
  }
  
  return Array.from(models);
}

/**
 * Check if file has TODO or placeholder comments
 */
function checkComments(content: string): { hasTodo: boolean; hasPlaceholder: boolean } {
  return {
    hasTodo: TODO_PATTERN.test(content),
    hasPlaceholder: PLACEHOLDER_PATTERN.test(content),
  };
}

/**
 * Convert file path to API path
 */
function filePathToApiPath(filePath: string, baseDir: string): string {
  // Remove base directory
  let relativePath = relative(baseDir, filePath);
  
  // Remove 'app/api' prefix
  relativePath = relativePath.replace(/^app[\/\\]api[\/\\]/, '');
  
  // Remove 'route.ts' suffix
  relativePath = relativePath.replace(/[\/\\]route\.tsx?$/, '');
  
  // Convert to API path format
  const pathParts = relativePath.split(/[\/\\]/);
  
  // Handle dynamic routes [param]
  const apiPath = pathParts.map(part => {
    if (part.startsWith('[') && part.endsWith(']')) {
      return `:${part.slice(1, -1)}`;
    }
    return part;
  }).join('/');
  
  return `/api/${apiPath}`;
}

/**
 * Scan FE files for API usage
 */
async function scanFeUsage(apiPath: string, webDir: string): Promise<boolean> {
  const searchPath = apiPath.replace('/api/', '');
  const patterns = [
    new RegExp(`fetch\\(['"]${apiPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'gi'),
    new RegExp(`fetch\\(['"]/api/${searchPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'gi'),
    new RegExp(`apiFetch\\(['"]${apiPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'gi'),
    new RegExp(`['"]${apiPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'gi'),
  ];
  
  try {
    const files = await findFeFiles(webDir);
    for (const file of files) {
      try {
        const content = await readFile(file, 'utf-8');
        for (const pattern of patterns) {
          if (pattern.test(content)) {
            return true;
          }
        }
      } catch {
        // Skip files we can't read
      }
    }
  } catch {
    // Skip if can't scan
  }
  
  return false;
}

/**
 * Find all FE files (tsx, ts, jsx, js)
 */
async function findFeFiles(dir: string): Promise<string[]> {
  const files: string[] = [];
  
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      
      if (entry.isDirectory()) {
        if (entry.name === 'node_modules' || entry.name === '.next' || entry.name === 'api') {
          continue;
        }
        const subFiles = await findFeFiles(fullPath);
        files.push(...subFiles);
      } else if (/\.(tsx?|jsx?)$/.test(entry.name)) {
        files.push(fullPath);
      }
    }
  } catch {
    // Skip directories we can't read
  }
  
  return files;
}

/**
 * Get all models from schema
 */
function getSchemaModels(schemaPath: string): string[] {
  try {
    const schema = readFileSync(schemaPath, 'utf-8');
    const models: string[] = [];
    const modelRegex = /^model\s+(\w+)\s*{/gm;
    let match;
    
    while ((match = modelRegex.exec(schema)) !== null) {
      models.push(match[1]);
    }
    
    return models;
  } catch {
    return [];
  }
}

/**
 * Group routes by system
 */
function groupRoutesBySystem(routes: ApiRoute[]): Record<string, ApiRoute[]> {
  const grouped: Record<string, ApiRoute[]> = {};
  
  for (const route of routes) {
    // Extract system from path (e.g., /api/flows -> flows)
    const match = route.path.match(/\/api\/([^\/]+)/);
    const system = match ? match[1] : 'other';
    
    if (!grouped[system]) {
      grouped[system] = [];
    }
    grouped[system].push(route);
  }
  
  return grouped;
}

/**
 * Main function
 */
async function main() {
  const webDir = join(process.cwd(), 'apps', 'web');
  const apiDir = join(webDir, 'app', 'api');
  const schemaPath = join(process.cwd(), 'packages', 'db', 'schema.prisma');
  
  console.log('\n' + 'â•'.repeat(60));
  console.log('ðŸ—ºï¸  API Map Generator');
  console.log('â•'.repeat(60) + '\n');
  
  console.log('ðŸ“‚ Scanning API routes...');
  const routeFiles = await findRouteFiles(apiDir);
  console.log(`   Found ${routeFiles.length} route files\n`);
  
  console.log('ðŸ” Analyzing routes...');
  const routes: ApiRoute[] = [];
  const allModels = new Set<string>();
  
  // Process routes in chunks (by folder depth)
  const chunks = routeFiles.reduce((acc, file) => {
    const depth = file.split(/[\/\\]/).length;
    if (!acc[depth]) acc[depth] = [];
    acc[depth].push(file);
    return acc;
  }, {} as Record<number, string[]>);
  
  for (const depth of Object.keys(chunks).map(Number).sort()) {
    const chunk = chunks[depth];
    console.log(`   Processing depth ${depth} (${chunk.length} files)...`);
    
    for (const file of chunk) {
      try {
        const content = await readFile(file, 'utf-8');
        const methods = extractMethods(content);
        const models = extractModels(content);
        const comments = checkComments(content);
        const apiPath = filePathToApiPath(file, apiDir);
        
        // Check FE usage
        const hasFeUsage = await scanFeUsage(apiPath, webDir);
        
        // Determine status
        let status: 'ok' | 'missing-model' | 'no-fe' = 'ok';
        if (!hasFeUsage) {
          status = 'no-fe';
        }
        
        const route: ApiRoute = {
          path: apiPath,
          methods,
          models,
          status,
          hasTodo: comments.hasTodo,
          hasPlaceholder: comments.hasPlaceholder,
          filePath: relative(process.cwd(), file),
        };
        
        routes.push(route);
        models.forEach(m => allModels.add(m));
      } catch (error) {
        console.error(`   âš ï¸  Error processing ${file}:`, error);
      }
    }
  }
  
  // Get schema models
  console.log('\nðŸ“‹ Checking schema...');
  const schemaModels = getSchemaModels(schemaPath);
  console.log(`   Found ${schemaModels.length} models in schema\n`);
  
  // Find orphaned models (in schema but never used in routes)
  const orphanedModels = schemaModels.filter(m => !allModels.has(m));
  
  // Group routes by system
  const routesBySystem = groupRoutesBySystem(routes);
  
  // Count methods
  const routesByMethod: Record<string, number> = {};
  routes.forEach(r => {
    r.methods.forEach(m => {
      routesByMethod[m] = (routesByMethod[m] || 0) + 1;
    });
  });
  
  // Routes without FE usage
  const routesWithoutFe = routes.filter(r => r.status === 'no-fe').map(r => r.path);
  
  // Build map
  const apiMap: ApiMap = {
    timestamp: new Date().toISOString(),
    totalRoutes: routes.length,
    routesByMethod,
    modelsUsed: Array.from(allModels).sort(),
    orphanedModels: orphanedModels.sort(),
    routesWithoutFe,
    routes: routes.sort((a, b) => a.path.localeCompare(b.path)),
    routesBySystem,
  };
  
  // Save JSON
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `api-map-${timestamp}.json`;
  const logsDir = join(process.cwd(), 'logs');
  
  await mkdir(logsDir, { recursive: true });
  const filepath = join(logsDir, filename);
  await writeFile(filepath, JSON.stringify(apiMap, null, 2));
  
  // Display summary
  console.log('â•'.repeat(60));
  console.log('ðŸ“Š API MAP SUMMARY');
  console.log('â•'.repeat(60) + '\n');
  
  console.log(`Total Routes: ${apiMap.totalRoutes}`);
  console.log(`Routes by Method:`);
  Object.entries(apiMap.routesByMethod).forEach(([method, count]) => {
    console.log(`   ${method}: ${count}`);
  });
  console.log(`\nModels Used: ${apiMap.modelsUsed.length}`);
  console.log(`Orphaned Models: ${apiMap.orphanedModels.length}`);
  console.log(`Routes without FE: ${apiMap.routesWithoutFe.length}\n`);
  
  if (apiMap.orphanedModels.length > 0) {
    console.log('ðŸ”´ Orphaned Models (in schema but not used):');
    apiMap.orphanedModels.slice(0, 10).forEach(m => {
      console.log(`   â€¢ ${m}`);
    });
    if (apiMap.orphanedModels.length > 10) {
      console.log(`   ... and ${apiMap.orphanedModels.length - 10} more`);
    }
    console.log('');
  }
  
  if (apiMap.routesWithoutFe.length > 0) {
    console.log('âš ï¸  Routes without FE usage (first 10):');
    apiMap.routesWithoutFe.slice(0, 10).forEach(r => {
      console.log(`   â€¢ ${r}`);
    });
    if (apiMap.routesWithoutFe.length > 10) {
      console.log(`   ... and ${apiMap.routesWithoutFe.length - 10} more`);
    }
    console.log('');
  }
  
  console.log('â•'.repeat(60));
  console.log(`ðŸ’¾ Saved to: ${filepath}`);
  console.log('â•'.repeat(60) + '\n');
  
  return apiMap;
}

// Run if called directly
if (require.main === module) {
  main()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

export { main };