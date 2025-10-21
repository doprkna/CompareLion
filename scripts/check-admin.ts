import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkAdmin() {
  try {
    const admin = await prisma.user.findUnique({
      where: { email: "admin@example.com" },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        level: true,
        xp: true,
        funds: true,
        diamonds: true,
        passwordHash: true,
      },
    });

    if (!admin) {
      console.log("❌ Admin user NOT found!");
      return;
    }

    console.log("\n✅ Admin user found:");
    console.log("━".repeat(50));
    console.log(`📧 Email:    ${admin.email}`);
    console.log(`👤 Name:     ${admin.name}`);
    console.log(`🎯 Role:     ${admin.role}`);
    console.log(`⭐ Level:    ${admin.level}`);
    console.log(`💎 XP:       ${admin.xp}`);
    console.log(`💰 Funds:    ${admin.funds}`);
    console.log(`💎 Diamonds: ${admin.diamonds}`);
    console.log(`🔐 Password: ${admin.passwordHash ? admin.passwordHash.substring(0, 20) + "..." : "NONE!"}`);
    console.log("━".repeat(50));
    console.log("\n🔑 Login credentials:");
    console.log("   Email: admin@example.com");
    console.log("   Password: 1AmTheArchitect\n");
  } catch (error) {
    console.error("❌ Error checking admin:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdmin();








