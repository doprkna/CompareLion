/**
 * Test Data Seed Script
 * Version: 0.13.2
 * 
 * Seeds demo users and responses for immediate flow testing.
 * Creates 3 demo users with varied responses across all question types.
 */

import { PrismaClient, QuestionType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

interface DemoUser {
  email: string;
  name: string;
  password: string;
}

const demoUsers: DemoUser[] = [
  {
    email: 'demo@parel.app',
    name: 'Demo User',
    password: 'demo123',
  },
  {
    email: 'user@parel.app',
    name: 'Test User',
    password: 'test123',
  },
  {
    email: 'test@parel.app',
    name: 'Sample User',
    password: 'sample123',
  },
];

/**
 * Get a random integer between min and max (inclusive)
 */
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Get random items from an array
 */
function randomItems<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, array.length));
}

/**
 * Generate a random response based on question type
 */
async function generateResponse(questionId: string, questionType: QuestionType, options: any[]) {
  switch (questionType) {
    case 'SINGLE_CHOICE':
      // Pick one random option
      const singleOption = options[randomInt(0, options.length - 1)];
      return {
        optionIds: [singleOption.id],
        numericVal: null,
        textVal: null,
      };

    case 'MULTI_CHOICE':
      // Pick 1-3 random options
      const multiCount = randomInt(1, Math.min(3, options.length));
      const multiOptions = randomItems(options, multiCount);
      return {
        optionIds: multiOptions.map((opt) => opt.id),
        numericVal: null,
        textVal: null,
      };

    case 'RANGE':
      // Random value between 1-10
      return {
        optionIds: [],
        numericVal: randomInt(1, 10),
        textVal: null,
      };

    case 'NUMBER':
      // Random integer between reasonable bounds
      return {
        optionIds: [],
        numericVal: randomInt(0, 100),
        textVal: null,
      };

    case 'TEXT':
      // Generate sample text responses
      const textSamples = [
        'I want to improve my skills and grow professionally.',
        'Building a successful career while maintaining work-life balance.',
        'Learning new technologies and staying relevant in my field.',
        'Making a positive impact in my community.',
        'Achieving financial independence and security.',
      ];
      return {
        optionIds: [],
        numericVal: null,
        textVal: textSamples[randomInt(0, textSamples.length - 1)],
      };

    default:
      return {
        optionIds: [],
        numericVal: null,
        textVal: null,
      };
  }
}

async function seedTestData() {
  console.log('🌱 Starting test data seeding...\n');

  let userCount = 0;
  let responseCount = 0;
  const createdUserIds: string[] = [];

  // Step 1: Create demo users
  console.log('👤 Creating demo users...');
  for (const userData of demoUsers) {
    const existing = await prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (existing) {
      console.log(`⏭️  User already exists: ${userData.email}`);
      createdUserIds.push(existing.id);
      continue;
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const user = await prisma.user.create({
      data: {
        email: userData.email,
        name: userData.name,
        passwordHash: hashedPassword,
        emailVerified: new Date(),
        role: 'USER',
        level: 1,
        xp: 0,
      },
    });

    userCount++;
    createdUserIds.push(user.id);
    console.log(`✅ Created user: ${user.email} (ID: ${user.id})`);
  }

  console.log('');

  // Step 2: Get all active questions
  console.log('📝 Fetching active questions...');
  const questions = await prisma.flowQuestion.findMany({
    where: { isActive: true },
    include: { options: true },
  });

  console.log(`✅ Found ${questions.length} active questions\n`);

  if (questions.length === 0) {
    console.log('⚠️  No questions found. Please run questions.seed.ts first!');
    return;
  }

  // Step 3: Create responses for each user
  console.log('💬 Generating responses...');
  for (const userId of createdUserIds) {
    console.log(`\n👤 User: ${userId.substring(0, 8)}...`);
    
    for (const question of questions) {
      // Check if response already exists
      const existing = await prisma.userResponse.findUnique({
        where: {
          userId_questionId: {
            userId,
            questionId: question.id,
          },
        },
      });

      if (existing) {
        continue;
      }

      // Generate appropriate response based on question type
      const responseData = await generateResponse(
        question.id,
        question.type,
        question.options
      );

      await prisma.userResponse.create({
        data: {
          userId,
          questionId: question.id,
          optionIds: responseData.optionIds,
          numericVal: responseData.numericVal,
          textVal: responseData.textVal,
          skipped: false,
        },
      });

      responseCount++;
      
      // Log the response based on type
      const logText = question.text.substring(0, 40) + '...';
      let responseDesc = '';
      
      if (responseData.optionIds.length > 0) {
        responseDesc = `${responseData.optionIds.length} option(s)`;
      } else if (responseData.numericVal !== null) {
        responseDesc = `value: ${responseData.numericVal}`;
      } else if (responseData.textVal) {
        responseDesc = `text: "${responseData.textVal.substring(0, 30)}..."`;
      }
      
      console.log(`  ✅ ${question.type}: ${logText} → ${responseDesc}`);
    }
  }

  console.log('\n' + '═'.repeat(60));
  console.log('📊 Test Data Seeding Summary');
  console.log('═'.repeat(60));
  console.log(`✅ Users seeded: ${userCount}`);
  console.log(`✅ Responses created: ${responseCount}`);
  console.log(`✅ Questions answered: ${questions.length}`);
  console.log(`✅ Avg responses per user: ${Math.round(responseCount / createdUserIds.length)}`);
  console.log('═'.repeat(60));
  console.log('\n📧 Demo Login Credentials:');
  demoUsers.forEach((user) => {
    console.log(`   ${user.email} / ${user.password}`);
  });
  console.log('═'.repeat(60) + '\n');
}

async function main() {
  try {
    await seedTestData();
    console.log('🎉 Test data seeding completed successfully!\n');
  } catch (error) {
    console.error('❌ Error seeding test data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });


