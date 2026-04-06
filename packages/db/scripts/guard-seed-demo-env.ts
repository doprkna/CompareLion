const appEnv = (process.env.APP_ENV ?? 'dev').toString().toLowerCase();
if (appEnv === 'prod' || appEnv === 'production') {
  console.error('seed-demo-minimal: ERROR - Seed only runs when APP_ENV=dev. Refusing to run (APP_ENV=' + appEnv + ').');
  process.exit(1);
}
export {};