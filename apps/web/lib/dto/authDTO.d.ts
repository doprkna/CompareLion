import type { User as PrismaUser } from '@parel/db/client';
export declare function toAuthDTO(user: PrismaUser, token: string): {
    token: string;
    user: {
        id: string;
        email: string;
        name: string | null;
    };
};
export type AuthDTO = ReturnType<typeof toAuthDTO>;
