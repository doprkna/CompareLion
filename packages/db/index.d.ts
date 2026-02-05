/**
 * @parel/db - Database Package Entry Point
 *
 * Exports Prisma client with global singleton pattern
 * for Next.js compatibility and NextAuth adapter support
 */
import { PrismaClient } from "@prisma/client";
declare const prisma: PrismaClient<import(".prisma/client").Prisma.PrismaClientOptions, never, import("@prisma/client/runtime/library").DefaultArgs>;
export default prisma;
export { prisma };
export * from "@prisma/client";
