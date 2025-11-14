import IORedis from 'ioredis';

let _connection: IORedis | null = null;

function getConnection(): IORedis {
  if (!_connection) {
    _connection = new IORedis(process.env.REDIS_URL!);
  }
  return _connection;
}

const connection = new Proxy({} as IORedis, {
  get(_target, prop) {
    return (getConnection() as any)[prop];
  },
  set(_target, prop, value) {
    (getConnection() as any)[prop] = value;
    return true;
  }
});

export { connection };
