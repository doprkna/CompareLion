import './_loadEnv';
/**
 * db-doctor.ts - DB connectivity and env sanity check.
 * Run: pnpm db:doctor:dev | pnpm db:doctor:prod
 */
import { ensureDatabaseUrl } from '../src/resolveDatabaseUrl';
import { prisma } from '../src/client';
function redactUrl(url) {
    try {
        const u = new URL(url);
        const protocol = u.protocol.replace(':', '');
        const host = u.hostname;
        const port = u.port || (protocol === 'postgresql' ? '5432' : '');
        const path = u.pathname.replace(/^\//, '') || '(default)';
        const auth = u.username ? '***@' : '';
        return `${protocol}://${auth}${host}${port ? ':' + port : ''}/${path}`;
    }
    catch {
        return '(invalid-url)';
    }
}
async function main() {
    let exitCode = 0;
    ensureDatabaseUrl();
    const appEnv = (process.env.APP_ENV ?? 'dev').toString().toLowerCase();
    const hasDev = Boolean(process.env.DATABASE_URL_DEV?.trim());
    const hasProd = Boolean(process.env.DATABASE_URL_PROD?.trim());
    const url = process.env.DATABASE_URL ?? '';
    console.log('APP_ENV:', appEnv);
    console.log('DATABASE_URL_DEV set:', hasDev);
    console.log('DATABASE_URL_PROD set:', hasProd);
    console.log('DATABASE_URL (redacted):', redactUrl(url));
    if (appEnv === 'prod' || appEnv === 'production') {
        if (url.includes('-dev')) {
            console.error('ERROR: APP_ENV=prod but DATABASE_URL contains "-dev" (dev project/branch). Refusing to run.');
            return 1;
        }
    }
    try {
        await prisma.$queryRaw `SELECT 1`;
        console.log('OK: SELECT 1 succeeded');
    }
    catch (e) {
        console.error('FAIL: SELECT 1', e);
        exitCode = 1;
    }
    finally {
        await prisma.$disconnect();
    }
    return exitCode;
}
main().then((code) => process.exit(code)).catch((e) => {
    console.error(e);
    process.exit(1);
});
