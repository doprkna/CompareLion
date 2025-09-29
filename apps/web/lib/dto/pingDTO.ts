// Pure DTO mapper for ping endpoint
export function toPingDTO(p: { status: 'ok'; timestamp: Date; version: string }): {
  status: 'ok';
  timestamp: Date;
  version: string;
} {
  return {
    status: p.status,
    timestamp: p.timestamp,
    version: p.version,
  };
}

export type PingDTO = ReturnType<typeof toPingDTO>;
