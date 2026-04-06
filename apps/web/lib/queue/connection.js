import IORedis from 'ioredis';
import { hasRedis } from '@/lib/env';
let _connection = null;
function getConnection() {
    if (!hasRedis) {
        return null;
    }
    if (!_connection) {
        _connection = new IORedis(process.env.REDIS_URL);
    }
    return _connection;
}
const connection = new Proxy({}, {
    get(_target, prop) {
        const conn = getConnection();
        if (!conn) {
            throw new Error("Redis connection not available - REDIS_URL not configured");
        }
        return conn[prop];
    },
    set(_target, prop, value) {
        const conn = getConnection();
        if (!conn) {
            throw new Error("Redis connection not available - REDIS_URL not configured");
        }
        conn[prop] = value;
        return true;
    }
});
export { connection };
