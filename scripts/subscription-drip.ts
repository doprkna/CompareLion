import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const subs = await prisma.subscription.findMany({ where: { status: 'active' } });
  for (const sub of subs) {
    const wallet = await prisma.wallet.findFirst({ where: { userId: sub.userId } });
    if (!wallet) continue;
    // Credit 300 diamonds
    await prisma.wallet.update({ where: { id: wallet.id }, data: { diamonds: wallet.diamonds + 300 } });
    await prisma.ledgerEntry.create({ data: {
      walletId: wallet.id,
      kind: 'CREDIT',
      amount: 300,
      currency: 'DIAMONDS',
      refType: 'subscription_drip',
      refId: sub.id,
    }});
    console.log(`Dripped 300 diamonds to ${sub.userId}`);
  }
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
