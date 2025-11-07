import { PrismaClient, Prisma } from "@prisma/client";
import { faker } from "@faker-js/faker";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const ROWS_PER_MODEL = 8;
const USERS_TOTAL = 20;

// Skip internal/meta tables and join tables
const EXCLUDE = new Set<string>([
  "_prisma_migrations",
  "VerificationToken", // NextAuth internal
  "Account", // NextAuth internal  
  "Session", // NextAuth internal
  "EmailVerify", // Handled by NextAuth or custom flow
  "PasswordReset", // Handled by NextAuth or custom flow
]);

// Join tables and many-to-many relations to skip
const JOIN_TABLES = new Set<string>([
  "UserAchievement",
  "UserGroup", 
  "UserBadge",
  "UserAvatarItem",
  "UserThemeSettings",
  "UserPreferences",
  "UserSubscription",
  "UserStreak",
  "UserEnergy",
  "UserProfile",
  "UserResponse",
  "UserQuestion",
  "UserArchetypeHistory",
  "UserInsight",
  "UserLegacyBonus",
  "UserTimeZone",
  "GroupMember",
  "ClanMember",
  "FactionMember",
  "CoopMember",
  "DuelSpectator",
  "QuestionVersionTag",
  "AchievementCollectionMember",
  "UserAchievementCollection",
  "MiniEventProgress",
  "WeeklyChallengeParticipation",
  "FlowStepLink",
  "NpcMemory",
  "PartnerApiKey",
  "PartnerStats",
]);

// Smart field value generation
const generateFieldValue = (model: string, field: Prisma.DMMF.Field, index: number, existingData: any = {}) => {
  const key = field.name.toLowerCase();
  
  // Handle special cases first
  if (key.includes("email")) {
    if (index === 0) return "admin@example.com";
    if (index === 1) return "demo@example.com";
    return faker.internet.email();
  }
  
  if (key.includes("password")) {
    return bcrypt.hashSync(index === 0 ? "1AmTheArchitect" : index === 1 ? "demo" : `password${index}`, 10);
  }
  
  if (key === "name" || key.includes("title")) {
    if (key === "name" && model === "User") {
      if (index === 0) return "Admin User";
      if (index === 1) return "Demo User";
    }
    return faker.person.fullName();
  }
  
  if (key.includes("slug")) return `${model}-${index + 1}`.toLowerCase();
  if (key.includes("locale")) return "en";
  if (key.includes("url") || key.includes("link")) return faker.internet.url();
  if (key.includes("image") || key.includes("avatar")) return faker.image.avatar();
  if (key.includes("description") || key.includes("text")) return faker.lorem.sentence();
  if (key.includes("code")) return `${model.toUpperCase()}_${index + 1}`;
  if (key.includes("status")) {
    const statuses = ["active", "inactive", "pending", "completed", "online", "offline"];
    return faker.helpers.arrayElement(statuses);
  }
  if (key.includes("type")) {
    const types = ["SYSTEM", "REWARD", "ACHIEVEMENT", "FRIEND", "TASK"];
    return faker.helpers.arrayElement(types);
  }
  
  // Default based on field type
  switch (field.type) {
    case "Int":
      if (key.includes("level")) return index === 0 ? 99 : faker.number.int({ min: 1, max: 50 });
      if (key.includes("xp")) return index === 0 ? 9999 : faker.number.int({ min: 0, max: 5000 });
      if (key.includes("progress")) return faker.number.int({ min: 0, max: 100 });
      if (key.includes("count") || key.includes("total")) return faker.number.int({ min: 0, max: 100 });
      return faker.number.int({ min: 1, max: 100 });
    
    case "BigInt":
      return BigInt(faker.number.int({ min: 1, max: 1000 }));
    
    case "Float":
    case "Decimal":
      return Number(faker.number.float({ min: 0, max: 1000, fractionDigits: 2 }));
    
    case "Boolean":
      return faker.datatype.boolean();
    
    case "String":
      if (key.includes("id")) return faker.string.alphanumeric(10);
      return faker.lorem.words(3);
    
    case "Json":
      return { seed: true, index, timestamp: new Date().toISOString() };
    
    case "DateTime":
      return faker.date.recent({ days: 30 });
    
    default:
      return null;
  }
};

// Get enum values from DMMF
const getEnumValues = (enumName: string) => {
  try {
    const dmmf = Prisma.dmmf as any;
    const enumType = dmmf.schema?.enumTypes?.model?.find((e: any) => e.name === enumName);
    return enumType?.values?.map((v: any) => v.name) || [];
  } catch {
    return [];
  }
};

// Generate data for a model
const generateModelData = async (modelName: string, count: number) => {
  const model = (Prisma.dmmf as any).datamodel.models.find((m: any) => m.name === modelName);
  if (!model) return [];

  const results = [];
  
  for (let i = 0; i < count; i++) {
    const data: any = {};
    
    for (const field of model.fields) {
      // Skip id fields (auto-generated)
      if (field.isId) continue;
      
      // Skip fields with default values
      if (field.hasDefaultValue) continue;
      
      // Handle relations
      if (field.kind === "object") {
        if (field.isRequired && !field.isList) {
          // Required single relation - try to connect to existing record
          try {
            const relatedModel = (Prisma as any)[field.type];
            if (relatedModel) {
              const existing = await (prisma as any)[field.type.charAt(0).toLowerCase() + field.type.slice(1)].findFirst({
                select: { id: true }
              });
              if (existing) {
                data[field.name] = { connect: { id: existing.id } };
              }
            }
          } catch {
            // Skip if can't connect
          }
        }
        continue;
      }
      
      // Handle enums
      if (field.kind === "enum") {
        const enumValues = getEnumValues(field.type);
        if (enumValues.length > 0) {
          data[field.name] = enumValues[i % enumValues.length];
        }
        continue;
      }
      
      // Handle scalar fields
      if (field.kind === "scalar") {
        const value = generateFieldValue(modelName, field, i);
        if (value !== null) {
          data[field.name] = value;
        }
      }
    }
    
    results.push(data);
  }
  
  return results;
};

// Topological sort for dependency resolution
const getTopologicalOrder = (models: any[]) => {
  const graph = new Map<string, string[]>();
  const incoming = new Map<string, number>();
  
  // Initialize
  models.forEach(model => {
    graph.set(model.name, []);
    incoming.set(model.name, 0);
  });
  
  // Build dependency graph
  models.forEach(model => {
    model.fields.forEach((field: any) => {
      if (field.kind === "object" && field.isRequired && !field.isList && field.type !== model.name) {
        const deps = graph.get(model.name) || [];
        deps.push(field.type);
        graph.set(model.name, deps);
        incoming.set(model.name, (incoming.get(model.name) || 0) + 1);
      }
    });
  });
  
  // Topological sort
  const queue = Array.from(incoming.entries())
    .filter(([_, count]) => count === 0)
    .map(([name, _]) => name);
  
  const result = [];
  while (queue.length > 0) {
    const current = queue.shift()!;
    result.push(current);
    
    for (const [model, deps] of graph) {
      if (deps.includes(current)) {
        const newCount = (incoming.get(model) || 0) - 1;
        incoming.set(model, newCount);
        if (newCount === 0) {
          queue.push(model);
        }
      }
    }
  }
  
  return result;
};

// Seed core QuestionTags for humor/tone and content sensitivity
async function seedCoreQuestionTags() {
  console.log("\n🏷️  Seeding core QuestionTags...");
  const tags: Array<{ name: string; type: 'tone' | 'content'; description?: string }> = [
    { name: 'dry', type: 'tone' },
    { name: 'sarcastic', type: 'tone' },
    { name: 'dark', type: 'tone' },
    { name: 'wholesome', type: 'tone' },
    { name: 'absurd', type: 'tone' },
    { name: 'emotional', type: 'tone' },
    { name: 'picky', type: 'content' },
    { name: 'complex', type: 'content' },
    { name: 'nsfw', type: 'content', description: 'Mature content; hidden by default' },
    { name: 'sensitive', type: 'content', description: 'Potentially sensitive topics' },
    { name: 'reflective', type: 'tone' },
  ];

  let inserted = 0;
  for (const t of tags) {
    try {
      await prisma.questionTag.upsert({
        where: { name: t.name },
        update: { type: t.type as any, description: t.description },
        create: { name: t.name, type: t.type as any, description: t.description },
      });
      inserted++;
    } catch (e: any) {
      console.warn(`   ⚠️  Tag ${t.name}: ${e.message}`);
    }
  }
  console.log(`   ✅ Ensured ${inserted} core tags`);
}

async function main() {
  console.log("🌱 Starting comprehensive seed...\n");
  
  const dmmf = Prisma.dmmf as any;
  const models = dmmf.datamodel.models
    .filter((m: any) => !m.name.startsWith("_") && !EXCLUDE.has(m.name) && !JOIN_TABLES.has(m.name));
  
  console.log(`📊 Found ${models.length} models to seed\n`);
  
  // Get topological order
  const order = getTopologicalOrder(models);
  console.log("🔄 Seed order:", order.slice(0, 10).join(" → "), "...\n");
  
  const stats = new Map<string, { inserted: number; skipped: number }>();
  
  // 1. Seed Users first (special handling)
  if (models.find((m: any) => m.name === "User")) {
    console.log("👥 Seeding Users...");
    
    const adminPasswordHash = await bcrypt.hash("1AmTheArchitect", 10);
    const demoPasswordHash = await bcrypt.hash("demo", 10);
    
    // Create admin and demo users first
    await prisma.user.upsert({
      where: { email: "admin@example.com" },
      update: {},
      create: {
        email: "admin@example.com",
        passwordHash: adminPasswordHash,
        name: "Admin User",
        role: "ADMIN",
        level: 99,
        xp: 9999,
        funds: 5000,
        diamonds: 500,
        streakCount: 365,
        questionsAnswered: 1000,
        emailVerified: new Date(),
      },
    });
    
    await prisma.user.upsert({
      where: { email: "demo@example.com" },
      update: {},
      create: {
        email: "demo@example.com",
        passwordHash: demoPasswordHash,
        name: "Demo User",
        role: "USER",
        level: 10,
        xp: 2500,
        funds: 1000,
        diamonds: 50,
        streakCount: 30,
        questionsAnswered: 150,
        emailVerified: new Date(),
      },
    });
    
    // Create random users
    for (let i = 2; i < USERS_TOTAL; i++) {
      try {
        await prisma.user.create({
          data: {
            email: faker.internet.email(),
            passwordHash: await bcrypt.hash(`password${i}`, 10),
            name: faker.person.fullName(),
            role: "USER",
            level: faker.number.int({ min: 1, max: 40 }),
            xp: faker.number.int({ min: 0, max: 5000 }),
            funds: faker.number.int({ min: 0, max: 1000 }),
            diamonds: faker.number.int({ min: 0, max: 100 }),
            streakCount: faker.number.int({ min: 0, max: 30 }),
            questionsAnswered: faker.number.int({ min: 0, max: 200 }),
            emailVerified: Math.random() > 0.3 ? new Date() : null,
          },
        });
      } catch (error: any) {
        console.warn(`   ⚠️  User ${i}: ${error.message}`);
      }
    }
    
    console.log("   🔑 Admin: admin@example.com / 1AmTheArchitect");
    console.log("   🔑 Demo: demo@example.com / demo");
    console.log(`   ✅ Created ${USERS_TOTAL} users\n`);
    stats.set("User", { inserted: USERS_TOTAL, skipped: 0 });
  }
  
  // 2. Seed other models in topological order
  for (const modelName of order) {
    if (modelName === "User") continue; // Already handled
    
    console.log(`🔨 Seeding ${modelName}...`);
    
    let inserted = 0;
    let skipped = 0;
    
    try {
      const dataArray = await generateModelData(modelName, ROWS_PER_MODEL);
      
      for (const data of dataArray) {
        try {
          await (prisma as any)[modelName.charAt(0).toLowerCase() + modelName.slice(1)].create({ data });
          inserted++;
        } catch (error: any) {
          skipped++;
          if (error.message.includes("Unique constraint") || error.message.includes("duplicate")) {
            // Skip silently for unique constraint violations
          } else {
            console.warn(`   ⚠️  ${modelName}: ${error.message}`);
          }
        }
      }
      
      console.log(`   ✅ Created ${inserted} ${modelName} records`);
      stats.set(modelName, { inserted, skipped });
      
    } catch (error: any) {
      console.warn(`   ❌ ${modelName}: ${error.message}`);
      stats.set(modelName, { inserted: 0, skipped: ROWS_PER_MODEL });
    }
  }
  
  // 3. Seed relationship data (UserAchievements, etc.)
  console.log("\n🔗 Seeding relationships...");
  
  try {
    // Get some users and achievements for linking
    const users = await prisma.user.findMany({ take: 10 });
    const achievements = await prisma.achievement.findMany({ take: 5 });
    
    // Create UserAchievements
    for (const user of users) {
      const userAchs = faker.helpers.arrayElements(achievements, { min: 1, max: 3 });
      for (const achievement of userAchs) {
        try {
          await prisma.userAchievement.create({
            data: {
              userId: user.id,
              achievementId: achievement.id,
              earnedAt: faker.date.recent({ days: 30 }),
            },
          });
        } catch {
          // Skip if already exists
        }
      }
    }
    
    // Create some messages between users
    const admin = await prisma.user.findUnique({ where: { email: "admin@example.com" } });
    const demo = await prisma.user.findUnique({ where: { email: "demo@example.com" } });
    
    if (admin && demo) {
      await prisma.message.createMany([
        {
          senderId: admin.id,
          receiverId: demo.id,
          text: "Welcome to PareL! 🎉",
          createdAt: faker.date.recent(),
        },
        {
          senderId: demo.id,
          receiverId: admin.id,
          text: "Thanks! This looks amazing!",
          createdAt: faker.date.recent(),
        },
      ]);
      
      // Create notifications
      await prisma.notification.createMany([
        {
          userId: admin.id,
          type: "SYSTEM",
          text: "System seeded successfully! 🚀",
          read: false,
        },
        {
          userId: demo.id,
          type: "REWARD",
          text: "You earned 100 XP for completing your first task!",
          read: false,
        },
      ]);
      
      // Create presence records
      await prisma.presence.createMany([
        {
          userId: admin.id,
          status: "online",
          lastActive: new Date(),
        },
        {
          userId: demo.id,
          status: "online", 
          lastActive: new Date(),
        },
      ]);
    }
    
    console.log("   ✅ Created relationships\n");
  } catch (error: any) {
    console.warn(`   ⚠️  Relationships: ${error.message}\n`);
  }
  
  // 4. Seed core tags for tone/content
  await seedCoreQuestionTags();
  
  // 5. Final summary
  console.log("📊 SEEDING SUMMARY:");
  console.log("=" .repeat(50));
  
  let totalInserted = 0;
  let totalSkipped = 0;
  
  for (const [model, counts] of stats) {
    const { inserted, skipped } = counts;
    totalInserted += inserted;
    totalSkipped += skipped;
    console.log(`${model.padEnd(25)} ${inserted.toString().padStart(3)} inserted, ${skipped.toString().padStart(3)} skipped`);
  }
  
  console.log("=" .repeat(50));
  console.log(`Total: ${totalInserted} inserted, ${totalSkipped} skipped`);
  console.log("\n🎉 Seed complete! App should now look alive!");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });