import type { FlowProgress as PrismaFlowProgress } from '@parel/db';
export declare function toSessionDTO(s: PrismaFlowProgress): {
    id: string;
    userId: string;
    startedAt: Date;
    endedAt: Date | null;
    status: string;
};
export type SessionDTO = ReturnType<typeof toSessionDTO>;
