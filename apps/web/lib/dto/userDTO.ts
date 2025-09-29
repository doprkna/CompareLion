import type { User as PrismaUser } from '@parel/db';

export function toUserDTO(user: PrismaUser): {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: Date;
  lastLoginAt: Date | null;
} {
  return {
    id: user.id,
    email: user.email,
    name: user.name ?? null,
    role: 'user', // TODO: derive actual role
    createdAt: user.createdAt,
    lastLoginAt: user.lastLoginAt ?? null,
  };
}

export type UserDTO = ReturnType<typeof toUserDTO>;
