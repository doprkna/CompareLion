export function getEnvStamp(): 'DEV' | 'PROD' {
  const vercelEnv = process.env.VERCEL_ENV;
  const nodeEnv = process.env.NODE_ENV;
  if (vercelEnv === 'production' || nodeEnv === 'production') {
    return 'PROD';
  }
  return 'DEV';
}
