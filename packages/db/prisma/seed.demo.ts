import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function seedDemo() {
  console.log('🌱 Seeding demo data...');

  // 1. Create demo users
  const users = [];
  const names = ['Alex', 'Jordan', 'Sam', 'Casey', 'Morgan', 'Taylor', 'Riley', 'Avery', 'Quinn', 'Parker'];
  
  for (let i = 0; i < names.length; i++) {
    const email = `demo${i + 1}@example.com`;
    const passwordHash = await hash("password123", 10);
    
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        name: names[i],
        xp: 5000 - (i * 450),
        level: Math.max(1, 10 - i),
        funds: 1000 - (i * 90),
        diamonds: Math.max(5, 50 - (i * 5)),
        score: 5000 - (i * 450),
        questionsAnswered: Math.max(10, 100 - (i * 10)),
      },
      create: {
        email,
        passwordHash,
        name: names[i],
        xp: 5000 - (i * 450),
        level: Math.max(1, 10 - i),
        funds: 1000 - (i * 90),
        diamonds: Math.max(5, 50 - (i * 5)),
        score: 5000 - (i * 450),
        questionsAnswered: Math.max(10, 100 - (i * 10)),
        theme: 'dark',
        emailVerified: new Date(),
        emailVerifiedAt: new Date(),
      },
    });
    users.push(user);
  }
  console.log(`✅ Created/updated ${users.length} demo users`);

  // 2. Create demo messages
  await prisma.message.deleteMany();
  
  // Create messages using user IDs
  if (users.length >= 4) {
    const messageData = [
      { from: 0, to: 1, text: 'Hey! Want to compare scores on the latest flow?' },
      { from: 1, to: 0, text: 'Sure! You're leading right now 🏆' },
      { from: 2, to: 0, text: 'Thanks for the help with that tricky question!' },
      { from: 0, to: 2, text: 'No problem! Let me know if you need more tips.' },
      { from: 3, to: 0, text: 'Nice progress on the leaderboard! Keep it up.' },
    ];

    for (const msg of messageData) {
      await prisma.message.create({
        data: {
          senderId: users[msg.from].id,
          receiverId: users[msg.to].id,
          content: msg.text,
        },
      });
    }
    console.log('✅ Created demo messages');
  }

  console.log('✅ Demo data seeding complete!');
}

seedDemo()
  .catch((e) => {
    console.error('❌ Demo seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
