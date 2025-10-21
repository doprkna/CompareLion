import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const texts = [
  "Hello!", 
  "How's it going?", 
  "Need help?", 
  "GG!", 
  "Nice one!", 
  "Great job!", 
  "Thanks!", 
  "See you!", 
  "Let's play!", 
  "Good luck!",
  "Want to do a flow together?",
  "Check out my latest score!",
  "That question was tricky!",
  "Nice work on the leaderboard!",
];

export async function POST() {
  try {
    const users = await prisma.user.findMany({ take: 10 });
    
    if (users.length < 2) {
      return NextResponse.json({ ok: false, error: "Need at least 2 users" }, { status: 400 });
    }

    let created = 0;
    for (let i = 0; i < 10; i++) {
      const sender = users[Math.floor(Math.random() * users.length)];
      const receiver = users[Math.floor(Math.random() * users.length)];
      
      if (sender.id === receiver.id) continue;
      
      await prisma.message.create({
        data: {
          senderId: sender.id,
          receiverId: receiver.id,
          content: texts[Math.floor(Math.random() * texts.length)],
        },
      });
      created++;
    }

    return NextResponse.json({ ok: true, created });
  } catch (err: any) {
    console.error('[Admin] generate-messages error:', err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
