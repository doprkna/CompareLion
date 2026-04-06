import type { Version as PrismaVersion } from '@parel/db';
export declare function toVersionDTO(ver: PrismaVersion): {
    id: string;
    number: string;
    releasedAt: Date;
    notes: string | null;
};
export type VersionDTO = ReturnType<typeof toVersionDTO>;
