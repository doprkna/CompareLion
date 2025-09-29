import type { User as PrismaUser } from '@prisma/client';

export function toAuthDTO(user: PrismaUser, token: string): {
  token: string;
  user: { id: string; email: string; name: string | null };
} {
  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name ?? null,
    },
  };
}

export type AuthDTO = ReturnType<typeof toAuthDTO>;
