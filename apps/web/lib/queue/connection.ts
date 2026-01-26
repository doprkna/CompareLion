import IORedis from 'ioredis';
import { hasRedis } from '@/lib/env';

let _connection: IORedis | null = null;

function getConnection(): IORedis | null {
  if (!hasRedis) {
    return null;
  }
  if (!_connection) {
    _connection = new IORedis(process.env.REDIS_URL!);
  }
  return _connection;
}

const connection = new Proxy({} as IORedis, {
  get(_target, prop) {
    const conn = getConnection();
    if (!conn) {
      throw new Error("Redis connection not available - REDIS_URL not configured");
    }
    return (conn as any)[prop];
  },
  set(_target, prop, value) {
    const conn = getConnection();
    if (!conn) {
      throw new Error("Redis connection not available - REDIS_URL not configured");
    }
    (conn as any)[prop] = value;
    return true;
  }
});

export { connection };
