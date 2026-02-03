/**
 * @parel/db - Database Package Entry Point
 *
 * Exports Prisma client with global singleton pattern
 * for Next.js compatibility and NextAuth adapter support
 */
declare const prisma: any;
export default prisma;
export { prisma };
export * from "@prisma/client";
