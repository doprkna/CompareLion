/**
 * Questions Seed Script
 * Version: 0.23.0 - Added localization support (Phase G)
 * 
 * Seeds the database with sample questions for all question types:
 * - SINGLE_CHOICE: Select one option
 * - MULTI_CHOICE: Select multiple options
 * - RANGE: Slider/range input (stored in numericVal)
 * - NUMBER: Numeric input (stored in numericVal)
 * - TEXT: Free text input (stored in textVal)
 * 
 * Localization:
 * - metadata.localization.lang: ['en', 'cs'] - supported languages
 * - metadata.localization.region: ['EU-CZ', 'GLOBAL'] - allowed regions
 * - metadata.localization.excludeRegions: ['US'] - blocked regions
 */

import { PrismaClient, QuestionType } from '@prisma/client';

const prisma = new PrismaClient();

interface QuestionSeedData {
  text: string;
  type: QuestionType;
  locale: string;
  categoryId?: string;
  metadata?: any; // v0.23.0 - Localization data
  options?: Array<{
    label: string;
    value: string;
    order?: number;
  }>;
}

const questions: QuestionSeedData[] = [
  // SINGLE_CHOICE Questions
  {
    text: "What is your primary career focus?",
    type: "SINGLE_CHOICE",
    locale: "en",
    options: [
      { label: "Technology & Engineering", value: "tech", order: 1 },
      { label: "Business & Management", value: "business", order: 2 },
      { label: "Creative Arts", value: "creative", order: 3 },
      { label: "Healthcare", value: "healthcare", order: 4 },
      { label: "Education", value: "education", order: 5 },
      { label: "Other", value: "other", order: 6 },
    ],
  },
  {
    text: "How do you prefer to start your day?",
    type: "SINGLE_CHOICE",
    locale: "en",
    options: [
      { label: "Exercise", value: "exercise", order: 1 },
      { label: "Meditation", value: "meditation", order: 2 },
      { label: "Coffee and news", value: "coffee_news", order: 3 },
      { label: "Jump right into work", value: "straight_work", order: 4 },
      { label: "Sleep in", value: "sleep_in", order: 5 },
    ],
  },

  // MULTI_CHOICE Questions
  {
    text: "What drinks do you consume regularly? (Select all that apply)",
    type: "MULTI_CHOICE",
    locale: "en",
    options: [
      { label: "Coffee", value: "coffee", order: 1 },
      { label: "Tea", value: "tea", order: 2 },
      { label: "Water", value: "water", order: 3 },
      { label: "Juice", value: "juice", order: 4 },
      { label: "Soda", value: "soda", order: 5 },
      { label: "Energy Drinks", value: "energy", order: 6 },
    ],
  },
  {
    text: "Which skills are you currently developing? (Select all that apply)",
    type: "MULTI_CHOICE",
    locale: "en",
    options: [
      { label: "Programming", value: "programming", order: 1 },
      { label: "Design", value: "design", order: 2 },
      { label: "Writing", value: "writing", order: 3 },
      { label: "Public Speaking", value: "public_speaking", order: 4 },
      { label: "Leadership", value: "leadership", order: 5 },
      { label: "Foreign Language", value: "language", order: 6 },
    ],
  },

  // RANGE Questions
  {
    text: "How many hours do you sleep on average per night?",
    type: "RANGE",
    locale: "en",
    options: [], // Range questions don't need options
  },
  {
    text: "On a scale of 1-10, how satisfied are you with your work-life balance?",
    type: "RANGE",
    locale: "en",
    options: [],
  },
  {
    text: "How many hours per week do you dedicate to personal development?",
    type: "RANGE",
    locale: "en",
    options: [],
  },

  // NUMBER Questions
  {
    text: "How many books did you read last year?",
    type: "NUMBER",
    locale: "en",
    options: [],
  },
  {
    text: "What is your target daily step count?",
    type: "NUMBER",
    locale: "en",
    options: [],
  },

  // TEXT Questions
  {
    text: "What is your biggest professional goal for this year?",
    type: "TEXT",
    locale: "en",
    options: [],
  },
  {
    text: "Describe your ideal morning routine in a few sentences.",
    type: "TEXT",
    locale: "en",
    options: [],
  },
  {
    text: "What motivates you to keep learning and growing?",
    type: "TEXT",
    locale: "en",
    options: [],
  },

  // ========================================
  // LOCALIZED QUESTIONS (v0.23.0 - Phase G)
  // ========================================

  // Czech-specific question (Brno example)
  {
    text: "Je Brno to nejpříjemnější město v Česku?",
    type: "SINGLE_CHOICE",
    locale: "cs",
    metadata: {
      localization: {
        lang: ["cs"],
        region: ["EU-CZ"],
      }
    },
    options: [
      { label: "Ano, určitě!", value: "yes_definitely", order: 1 },
      { label: "Možná", value: "maybe", order: 2 },
      { label: "Ne", value: "no", order: 3 },
      { label: "Nevím", value: "dont_know", order: 4 },
    ],
  },

  // Multi-language global question
  {
    text: "What's your go-to comfort meal?",
    type: "SINGLE_CHOICE",
    locale: "en",
    metadata: {
      localization: {
        lang: ["en", "cs"],
        region: ["GLOBAL"],
      }
    },
    options: [
      { label: "Pizza", value: "pizza", order: 1 },
      { label: "Pasta", value: "pasta", order: 2 },
      { label: "Soup", value: "soup", order: 3 },
      { label: "Something sweet", value: "sweet", order: 4 },
      { label: "Home-cooked traditional meal", value: "traditional", order: 5 },
    ],
  },

  // Czech + Polish question
  {
    text: "Preferuješ hory nebo moře?",
    type: "SINGLE_CHOICE",
    locale: "cs",
    metadata: {
      localization: {
        lang: ["cs"],
        region: ["EU-CZ", "EU-PL"],
      }
    },
    options: [
      { label: "Hory", value: "mountains", order: 1 },
      { label: "Moře", value: "sea", order: 2 },
      { label: "Obojí stejně", value: "both", order: 3 },
    ],
  },

  // English-only, exclude specific regions
  {
    text: "Do you prefer working from home or office?",
    type: "SINGLE_CHOICE",
    locale: "en",
    metadata: {
      localization: {
        lang: ["en"],
        excludeRegions: ["EU-CZ"], // Example: testing exclusion
      }
    },
    options: [
      { label: "Home", value: "home", order: 1 },
      { label: "Office", value: "office", order: 2 },
      { label: "Hybrid", value: "hybrid", order: 3 },
      { label: "Coworking space", value: "coworking", order: 4 },
    ],
  },

  // Pure global question (no restrictions)
  {
    text: "How many hours of sleep do you usually get?",
    type: "RANGE",
    locale: "en",
    metadata: {
      localization: {
        lang: ["en", "cs"],
        region: ["GLOBAL"],
      }
    },
    options: [], // RANGE type doesn't need options
  },
];

async function seedQuestions() {
  console.log('🌱 Starting question seeding...\n');

  let questionCount = 0;
  let optionCount = 0;
  const createdQuestions: string[] = [];

  for (const questionData of questions) {
    // Check if question already exists (by text and type)
    const existing = await prisma.flowQuestion.findFirst({
      where: {
        text: questionData.text,
        type: questionData.type,
      },
    });

    if (existing) {
      console.log(`⏭️  Skipping existing question: "${questionData.text.substring(0, 50)}..."`);
      continue;
    }

    // Create question
    // NOTE: FlowQuestion model currently doesn't have metadata field
    // Localization data from questionData.metadata is prepared but not stored
    // Future: Add metadata Json? field to FlowQuestion schema
    // For now, locale field serves as basic language indicator
    const question = await prisma.flowQuestion.create({
      data: {
        text: questionData.text,
        type: questionData.type,
        locale: questionData.locale,
        isActive: true,
        categoryId: questionData.categoryId || null,
        // metadata: questionData.metadata || {}, // TODO: Add to schema
      },
    });

    questionCount++;
    createdQuestions.push(question.id);
    console.log(`✅ Created ${questionData.type} question: "${question.text.substring(0, 60)}..."`);
    console.log(`   ID: ${question.id}`);

    // Create options if present
    if (questionData.options && questionData.options.length > 0) {
      for (const option of questionData.options) {
        await prisma.flowQuestionOption.create({
          data: {
            questionId: question.id,
            label: option.label,
            value: option.value,
            order: option.order || 0,
          },
        });
        optionCount++;
      }
      console.log(`   ↳ Created ${questionData.options.length} options`);
    }

    console.log('');
  }

  console.log('\n' + '═'.repeat(60));
  console.log('📊 Seeding Summary');
  console.log('═'.repeat(60));
  console.log(`✅ Questions created: ${questionCount}`);
  console.log(`✅ Options created: ${optionCount}`);
  console.log(`✅ Question IDs: ${createdQuestions.slice(0, 3).join(', ')}${createdQuestions.length > 3 ? '...' : ''}`);
  console.log('═'.repeat(60) + '\n');
}

async function main() {
  try {
    await seedQuestions();
    console.log('🎉 Question seeding completed successfully!\n');
  } catch (error) {
    console.error('❌ Error seeding questions:', error);
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










