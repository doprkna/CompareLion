import type { User as PrismaUser } from '@prisma/client';

export function toMeDTO(user: PrismaUser): {
  id: string;
  email: string;
  name: string | null;
  role: string;
} {
  return {
    id: user.id,
    email: user.email,
    name: user.name ?? null,
    role: 'user', // derive actual role if available
  };
}

export type MeDTO = ReturnType<typeof toMeDTO>;
