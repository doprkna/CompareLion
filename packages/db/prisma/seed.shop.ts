import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function seedShop() {
  // 1. Seed a Funds pack
  await prisma.product.upsert({
    where: { slug: "funds-1000" },
    update: {},
    create: {
      slug: "funds-1000",
      title: "Funds Pack — 1,000",
      description: "Top up your soft currency.",
      kind: "CURRENCY_PACK",
      payload: { grants: { funds: 1000, diamonds: 0 } },
      prices: { create: [{ currency: "EUR", unitAmount: 399 }] },
    },
  });
  await prisma.product.upsert({
    where: { slug: "funds-5000" },
    update: {},
    create: {
      slug: "funds-5000",
      title: "Funds Pack — 5,000",
      description: "Top up your soft currency.",
      kind: "CURRENCY_PACK",
      payload: { grants: { funds: 5000, diamonds: 0 } },
      prices: { create: [{ currency: "EUR", unitAmount: 1499 }] },
    },
  });
  await prisma.product.upsert({
    where: { slug: "funds-10000" },
    update: {},
    create: {
      slug: "funds-10000",
      title: "Funds Pack — 10,000",
      description: "Top up your soft currency.",
      kind: "CURRENCY_PACK",
      payload: { grants: { funds: 10000, diamonds: 0 } },
      prices: { create: [{ currency: "EUR", unitAmount: 2499 }] },
    },
  });

  // 2. Seed a Background cosmetic
  await prisma.product.upsert({
    where: { slug: "bg-city-night" },
    update: {},
    create: {
      slug: "bg-city-night",
      title: "Background — City Night",
      description: "Moody neon skyline for your dashboard.",
      kind: "COSMETIC",
      payload: { category: "background", rarity: "rare", price: { funds: 800, diamonds: 80 } },
      prices: { create: [{ currency: "EUR", unitAmount: 0 }] },
    },
  });

  console.log("Seeded shop products: funds-1000, bg-city-night");
}
