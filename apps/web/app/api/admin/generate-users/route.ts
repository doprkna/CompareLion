import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hash } from "bcryptjs";

export async function POST() {
  try {
    const names = ['AutoUser1', 'AutoUser2', 'AutoUser3', 'AutoUser4', 'AutoUser5'];
    
    for (let i = 0; i < names.length; i++) {
      const email = `auto${i + 1}@demo.com`;
      const passwordHash = await hash("password123", 10);
      
      await prisma.user.upsert({
        where: { email },
        update: {},
        create: {
          email,
          passwordHash,
          name: names[i],
          role: "USER",
          xp: (i + 1) * 100,
          level: i + 1,
          funds: (i + 1) * 50,
          emailVerified: new Date(),
          emailVerifiedAt: new Date(),
        },
      });
    }

    return NextResponse.json({ ok: true, count: names.length });
  } catch (err: any) {
    console.error('[Admin] generate-users error:', err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}













