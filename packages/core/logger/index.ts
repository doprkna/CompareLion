/**
 * Canonical logger for Parel monorepo (#68)
 * Single stable API: debug, info, warn, error
 * Environment-aware: debug only in dev or when LOG_LEVEL allows
 */

type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

const LEVELS: LogLevel[] = ['DEBUG', 'INFO', 'WARN', 'ERROR'];
const SENSITIVE_KEYS = [
  'password', 'secret', 'token', 'key', 'api_key', 'apikey',
  'auth', 'credential', 'private', 'passwordHash', 'hash',
  'stripe', 'jwt', 'bearer', 'oauth', 'session', 'email', 'phone',
];

function shouldLog(level: LogLevel): boolean {
  const envLevel = (process.env.LOG_LEVEL || 'info').toLowerCase();
  const levels = ['debug', 'info', 'warn', 'error'];
  const currentIdx = levels.indexOf(envLevel);
  const msgIdx = levels.indexOf(level.toLowerCase());
  return msgIdx >= (currentIdx >= 0 ? currentIdx : 1);
}

function isDebugEnabled(): boolean {
  return (
    process.env.NODE_ENV === 'development' ||
    process.env.NEXT_PUBLIC_DEBUG === '1'
  );
}

function redactSensitive(obj: unknown): unknown {
  if (process.env.NODE_ENV === 'development') return obj;
  if (!obj || typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map((item) => redactSensitive(item));
  }

  const out: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(obj as Record<string, unknown>)) {
    const lowerKey = key.toLowerCase();
    if (SENSITIVE_KEYS.some((sk) => lowerKey.includes(sk))) {
      out[key] = '[REDACTED]';
    } else {
      out[key] = redactSensitive(val);
    }
  }
  return out;
}

function formatPrefix(level: LogLevel, scope?: string): string {
  const ts = new Date().toISOString();
  const scopePart = scope ? ` [${scope}]` : '';
  return `[${ts}] [${level}]${scopePart}`;
}

function output(level: LogLevel, message: string, data?: unknown, scope?: string): void {
  const prefix = formatPrefix(level, scope);
  const payload = data !== undefined ? redactSensitive(data) : undefined;

  if (level === 'ERROR') {
    console.error(prefix, message, payload ?? '');
  } else if (level === 'WARN') {
    console.warn(prefix, message, payload ?? '');
  } else {
    console.log(prefix, message, payload ?? '');
  }
}

export interface LoggerApi {
  debug(message: string, data?: unknown): void;
  info(message: string, data?: unknown): void;
  warn(message: string, data?: unknown): void;
  error(message: string, err?: unknown, data?: unknown): void;
  child(scope: string): LoggerApi;
}

function createLogger(scope?: string): LoggerApi {
  return {
    debug(message: string, data?: unknown): void {
      if (!isDebugEnabled() || !shouldLog('DEBUG')) return;
      output('DEBUG', message, data, scope);
    },
    info(message: string, data?: unknown): void {
      if (!shouldLog('INFO')) return;
      output('INFO', message, data, scope);
    },
    warn(message: string, data?: unknown): void {
      if (!shouldLog('WARN')) return;
      output('WARN', message, data, scope);
    },
    error(message: string, err?: unknown, data?: unknown): void {
      if (!shouldLog('ERROR')) return;
      const merged =
        err instanceof Error
          ? { ...(data as object), error: err.message, stack: process.env.NODE_ENV === 'development' ? err.stack : undefined }
          : data !== undefined
            ? { ...(data as object), err }
            : err;
      output('ERROR', message, merged, scope);
    },
    child(scopeName: string): LoggerApi {
      const childScope = scope ? `${scope}:${scopeName}` : scopeName;
      return createLogger(childScope);
    },
  };
}

export const logger: LoggerApi = createLogger();
