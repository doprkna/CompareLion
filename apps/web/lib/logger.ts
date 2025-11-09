/**
 * Centralized logging utility with timestamps and level tags
 * v0.22.4 - Replaces scattered console.log/error statements
 * v0.22.6 - Added automatic sensitive data redaction
 */

type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
}

class Logger {
  private readonly sensitiveKeys = [
    'password', 'secret', 'token', 'key', 'api_key', 'apikey',
    'auth', 'credential', 'private', 'passwordHash', 'hash',
    'stripe', 'jwt', 'bearer', 'oauth', 'session'
  ];

  private formatTimestamp(): string {
    return new Date().toISOString();
  }

  /**
   * Redact sensitive values from logs (production mode)
   */
  private redactSensitive(obj: any): any {
    // Skip redaction in development for easier debugging
    if (process.env.NODE_ENV === 'development') {
      return obj;
    }

    if (!obj || typeof obj !== 'object') return obj;
    
    const redacted = Array.isArray(obj) ? [...obj] : { ...obj };
    
    for (const key in redacted) {
      const lowerKey = key.toLowerCase();
      const isSensitive = this.sensitiveKeys.some(sk => lowerKey.includes(sk));
      
      if (isSensitive && typeof redacted[key] === 'string') {
        const val = redacted[key];
        if (val.length > 8) {
          redacted[key] = `${val.slice(0, 4)}${'*'.repeat(val.length - 8)}${val.slice(-4)}`;
        } else {
          redacted[key] = '***REDACTED***';
        }
      } else if (typeof redacted[key] === 'object') {
        redacted[key] = this.redactSensitive(redacted[key]);
      }
    }
    
    return redacted;
  }

  private format(level: LogLevel, message: string, data?: any): LogEntry {
    return {
      timestamp: this.formatTimestamp(),
      level,
      message,
      ...(data && { data: this.redactSensitive(data) }),
    };
  }

  private output(entry: LogEntry): void {
    const prefix = `[${entry.timestamp}] [${entry.level}]`;
    
    if (entry.level === 'ERROR') {
      console.error(prefix, entry.message, entry.data || '');
    } else if (entry.level === 'WARN') {
      console.warn(prefix, entry.message, entry.data || '');
    } else {
      console.log(prefix, entry.message, entry.data || '');
    }
  }

  private shouldLog(level: LogLevel): boolean {
    const logLevel = process.env.LOG_LEVEL?.toLowerCase() || 'info';
    const levels = ['debug', 'info', 'warn', 'error'];
    const currentIndex = levels.indexOf(logLevel);
    const messageIndex = levels.indexOf(level.toLowerCase());
    return messageIndex >= currentIndex;
  }

  debug(message: string, data?: any): void {
    if (process.env.NODE_ENV === 'development' && this.shouldLog('DEBUG')) {
      this.output(this.format('DEBUG', message, data));
    }
  }

  info(message: string, data?: any): void {
    if (this.shouldLog('INFO')) {
      this.output(this.format('INFO', message, data));
    }
  }

  warn(message: string, data?: any): void {
    if (this.shouldLog('WARN')) {
      this.output(this.format('WARN', message, data));
    }
  }

  error(message: string, error?: any): void {
    if (this.shouldLog('ERROR')) {
      this.output(this.format('ERROR', message, error));
    }
  }
}

export const logger = new Logger();

