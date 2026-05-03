/**
 * Client-safe admin role check (aligns with Prisma `UserRole.ADMIN`).
 */

export type AdminCheckUser = {
  role?: string | null;
} | null | undefined;

export function isAdmin(user: AdminCheckUser): boolean {
  if (user == null) return false;
  const role = user.role;
  if (role == null || typeof role !== "string") return false;
  return role.toUpperCase() === "ADMIN";
}
