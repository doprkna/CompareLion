import type { User as PrismaUser } from '@parel/db/client';
export declare function toMeDTO(user: PrismaUser): {
    id: string;
    email: string;
    name: string | null;
    role: string;
};
export type MeDTO = ReturnType<typeof toMeDTO>;
