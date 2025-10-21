/**
 * Next.js Instrumentation Hook
 * Runs once when the server starts
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Server is ready
    const port = process.env.PORT || 3000;
    const env = process.env.NODE_ENV || 'development';
    
    console.log('\n🟢 ═══════════════════════════════════════════════════');
    console.log(`🟢 PareL App online at http://localhost:${port}`);
    console.log(`🟢 Environment: ${env}`);
    console.log('🟢 ═══════════════════════════════════════════════════\n');
  }
}
