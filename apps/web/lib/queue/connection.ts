import { getRedisClient, hasRedis } from '@parel/redis';

let _connection: ReturnType<typeof getRedisClient> = null;

function getConnection() {
  if (!hasRedis) return null;
  if (!_connection) {
    _connection = getRedisClient();
  }
  return _connection;
}

/** No-op pipeline for when Redis is disabled */
const noopPipeline = {
  get: () => noopPipeline,
  set: () => noopPipeline,
  del: () => noopPipeline,
  exec: () => Promise.resolve([]),
};

/** No-op connection when Redis disabled - avoids throws */
const noopConn = {
  get: () => Promise.resolve(null),
  set: () => Promise.resolve('OK'),
  del: () => Promise.resolve(0),
  duplicate: () => noopConn,
  pipeline: () => noopPipeline,
  quit: () => Promise.resolve('OK'),
};

const connection = new Proxy({} as import('ioredis').default, {
  get(_target, prop) {
    const conn = getConnection();
    if (!conn) return (noopConn as any)[prop] ?? undefined;
    return (conn as any)[prop];
  },
  set(_target, prop, value) {
    const conn = getConnection();
    if (!conn) return true;
    (conn as any)[prop] = value;
    return true;
  },
});

export { connection };
