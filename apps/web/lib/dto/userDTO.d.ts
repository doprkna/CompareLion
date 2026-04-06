import type { User as PrismaUser } from '@parel/db';
export declare function toUserDTO(user: PrismaUser): {
    id: string;
    email: string;
    name: string | null;
    role: string;
    createdAt: Date;
    lastLoginAt: Date | null;
};
export type UserDTO = ReturnType<typeof toUserDTO>;
