#!/usr/bin/env tsx
/**
 * Question Generation Worker Script
 * 
 * Processes batches of question generation jobs:
 * - Fetches PENDING jobs from the database
 * - Calls GPT API to generate questions
 * - Saves questions to the database
 * - Updates job and batch statuses
 * - Runs with controlled concurrency
 * 
 * Usage: pnpm gen:questions
 */

/* eslint-disable no-console */
import { PrismaClient } from '@parel/db';
import pLimit from 'p-limit';
import { GEN_CONFIG, validateGeneratorConfig } from '@/lib/config/generator';
import { generateQuestions } from '@/lib/aiClient';

const prisma = new PrismaClient();

/**
 * Get all leaf categories (SssCategory)
 * These are the deepest level categories that need questions
 */
async function getLeafCategories() {
  // Get all SssCategory records - they are by definition leaf nodes
  return prisma.sssCategory.findMany({
    select: { 
      id: true, 
      name: true,
      subSubCategory: {
        select: {
          name: true,
          subCategory: {
            select: {
              name: true,
              category: {
                select: {
                  name: true
                }
              }
            }
          }
        }
      }
    },
  });
}

/**
 * Run a generation batch for a specific language
 */
async function runBatch(language: string) {
  console.log(`\n🚀 Starting batch generation for language: ${language}`);
  
  const cats = await getLeafCategories();
  const targetCount = cats.length;

  console.log(`📊 Found ${targetCount} leaf categories to process`);

  // Create batch record
  const batch = await prisma.generationBatch.create({
    data: { 
      language, 
      targetCount, 
      status: 'PENDING', 
      note: 'Auto-generated batch' 
    },
  });

  console.log(`📦 Created batch: ${batch.id}`);

  // Create jobs for each category
  await prisma.generationJob.createMany({
    data: cats.map((c) => ({
      sssCategoryId: c.id,
      batchId: batch.id,
      language,
      status: 'PENDING',
    })),
  });

  console.log(`✅ Created ${cats.length} jobs`);

  // Mark batch as RUNNING
  await prisma.generationBatch.update({
    where: { id: batch.id },
    data: { status: 'RUNNING', startedAt: new Date() },
  });

  // Set up concurrency limiter
  const limiter = pLimit(GEN_CONFIG.MAX_CONCURRENCY);

  let processed = 0;
  let succeeded = 0;
  let failed = 0;

  // Get all PENDING jobs for this batch
  const pendingJobs = await prisma.generationJob.findMany({
    where: { batchId: batch.id, status: 'PENDING' },
    include: { sssCategory: true },
  });

  console.log(`⚙️  Processing ${pendingJobs.length} jobs with concurrency: ${GEN_CONFIG.MAX_CONCURRENCY}`);
  console.log(`🎲 Generating ${GEN_CONFIG.QUESTIONS_PER_CATEGORY_MIN}-${GEN_CONFIG.QUESTIONS_PER_CATEGORY_MAX} questions per category`);
  
  if (GEN_CONFIG.DRY_RUN) {
    console.log('⚠️  DRY RUN MODE - Questions will not be saved to database');
  }

  // Process jobs with concurrency control
  await Promise.all(
    pendingJobs.map((job) =>
      limiter(async () => {
        const startTime = Date.now();
        
        try {
          // Update job status to RUNNING
          await prisma.generationJob.update({
            where: { id: job.id },
            data: { status: 'RUNNING', startedAt: new Date() },
          });

          const cat = job.sssCategory;
          if (!cat) {
            throw new Error('Category not found');
          }

          // Build category path for context
          const categoryPath = [
            cat.subSubCategory?.subCategory?.category?.name,
            cat.subSubCategory?.subCategory?.name,
            cat.subSubCategory?.name,
          ].filter(Boolean) as string[];

          console.log(`  🔧 [${processed + 1}/${pendingJobs.length}] Generating for: ${cat.name}`);

          // Call GPT API to generate questions
          const result = await generateQuestions({
            categoryName: cat.name,
            categoryPath,
            language,
            minCount: GEN_CONFIG.QUESTIONS_PER_CATEGORY_MIN,
            maxCount: GEN_CONFIG.QUESTIONS_PER_CATEGORY_MAX,
          });

          // Log AI response
          const aiLog = await prisma.aIResponseLog.create({
            data: {
              prompt: `category=${cat.name}, lang=${language}, path=${categoryPath.join(' > ')}`,
              response: JSON.stringify(result.questions),
              tokensIn: result.tokensIn,
              tokensOut: result.tokensOut,
              model: result.model || 'unknown',
            },
          });

          // Save questions to database (unless dry run)
          if (!GEN_CONFIG.DRY_RUN) {
            const questionsToInsert = result.questions
              .map((text: string) => text?.trim())
              .filter(Boolean)
              .map((text: string) => ({
                text,
                ssscId: job.sssCategoryId,
                source: 'ai' as const,
                approved: false,
                categoryId: cat.subSubCategory?.subCategory?.category?.name || 'unknown',
                subCategoryId: cat.subSubCategory?.subCategory?.name,
                subSubCategoryId: cat.subSubCategory?.name,
                metadata: result.meta || {},
              }));

            if (questionsToInsert.length > 0) {
              await prisma.question.createMany({ data: questionsToInsert });
              console.log(`    ✅ Saved ${questionsToInsert.length} questions`);
            }
          } else {
            console.log(`    ⚠️  DRY RUN: Would have saved ${result.questions.length} questions`);
          }

          // Update job status to DONE
          await prisma.generationJob.update({
            where: { id: job.id },
            data: {
              status: 'DONE',
              finishedAt: new Date(),
              aiLogId: aiLog.id,
            },
          });

          succeeded += 1;
          const duration = Date.now() - startTime;
          console.log(`    ⏱️  Completed in ${duration}ms`);
        } catch (error: any) {
          // Update job status to FAILED
          await prisma.generationJob.update({
            where: { id: job.id },
            data: {
              status: 'FAILED',
              error: error?.message || String(error),
              finishedAt: new Date(),
            },
          });

          failed += 1;
          console.error(`    ❌ Job failed:`, error?.message || error);
          logError(error, `generateQuestions job ${job.id}`);
        } finally {
          processed += 1;
          
          // Update batch progress
          await prisma.generationBatch.update({
            where: { id: batch.id },
            data: { processed, succeeded, failed },
          });
        }
      })
    )
  );

  // Mark batch as complete
  const finalStatus = failed > 0 && succeeded === 0 ? 'FAILED' : 'DONE';
  await prisma.generationBatch.update({
    where: { id: batch.id },
    data: {
      status: finalStatus,
      finishedAt: new Date(),
    },
  });

  console.log(`\n✨ Batch ${batch.id} complete:`);
  console.log(`   Processed: ${processed}`);
  console.log(`   Succeeded: ${succeeded}`);
  console.log(`   Failed: ${failed}`);
  console.log(`   Status: ${finalStatus}\n`);
}

/**
 * Main entry point
 */
async function main() {
  console.log('🤖 Question Generation Worker Starting...\n');
  
  // Validate configuration
  const validation = validateGeneratorConfig();
  if (!validation.valid) {
    console.error('❌ Configuration errors:');
    validation.errors.forEach(err => console.error(`   - ${err}`));
    process.exit(1);
  }

  console.log('⚙️  Configuration:');
  console.log(`   Languages: ${GEN_CONFIG.LANGUAGES.join(', ')}`);
  console.log(`   Concurrency: ${GEN_CONFIG.MAX_CONCURRENCY}`);
  console.log(`   Questions per category: ${GEN_CONFIG.QUESTIONS_PER_CATEGORY_MIN}-${GEN_CONFIG.QUESTIONS_PER_CATEGORY_MAX}`);
  console.log(`   GPT URL: ${GEN_CONFIG.GPT_URL ? '✅ Configured' : '❌ Not configured'}`);
  console.log(`   Dry run: ${GEN_CONFIG.DRY_RUN ? 'Yes' : 'No'}`);

  // Process each configured language
  for (const lang of GEN_CONFIG.LANGUAGES) {
    await runBatch(lang);
  }

  await prisma.$disconnect();
  console.log('✅ All batches complete. Worker finished.\n');
}

// Run the worker
main().catch((error) => {
  console.error('\n❌ Fatal error:', error);
  logError(error, 'generate-questions main');
  prisma.$disconnect();
  process.exit(1);
});

