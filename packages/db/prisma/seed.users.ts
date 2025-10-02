import { prisma } from "./client";
import { hash } from "bcryptjs";

async function main() {
  const users = [
    "demo@example.com",
    ...Array.from({ length: 9 }).map((_, i) => `user${i + 1}@example.com`)
  ];

  for (const email of users) {
    const passwordHash = await hash("password123", 10);
    await prisma.user.upsert({
      where: { email },
      update: {},
      create: { email, passwordHash, theme: "light" }
    });
  }

  console.log("Seeded demo + 9 dummy users");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
