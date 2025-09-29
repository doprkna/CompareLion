import type { Ping as PrismaPing } from '@parel/db/src/client';

export function toPingDTO(p: PrismaPing): {
  status: 'ok';
  timestamp: Date;
  version: string;
} {
  return {
    status: 'ok',
    timestamp: p.createdAt,
    version: p.version,
  };
}

export type PingDTO = ReturnType<typeof toPingDTO>;
