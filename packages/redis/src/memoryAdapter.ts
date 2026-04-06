/**
 * In-memory fallback when Redis is disabled.
 * Implements get/set/del with TTL for dev parity.
 */

interface Entry {
  value: string;
  expiresAt: number;
}

const store = new Map<string, Entry>();

function prune(): void {
  const now = Date.now();
  for (const [k, v] of store) {
    if (v.expiresAt > 0 && v.expiresAt < now) store.delete(k);
  }
}

export const memoryAdapter = {
  async get(key: string): Promise<string | null> {
    prune();
    const e = store.get(key);
    if (!e) return null;
    if (e.expiresAt > 0 && e.expiresAt < Date.now()) {
      store.delete(key);
      return null;
    }
    return e.value;
  },
  async set(key: string, value: string, ...args: unknown[]): Promise<'OK'> {
    let ttl = 0;
    if (args[0] === 'EX' && typeof args[1] === 'number') {
      ttl = args[1] * 1000;
    }
    store.set(key, {
      value,
      expiresAt: ttl > 0 ? Date.now() + ttl : 0,
    });
    return 'OK';
  },
  async del(...keys: string[]): Promise<number> {
    let n = 0;
    for (const k of keys) {
      if (store.delete(k)) n++;
    }
    return n;
  },
};
