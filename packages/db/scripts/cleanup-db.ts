/**
 * Database Cleanup Script
 * Local-only operations to clean duplicates and normalize data
 * 
 * Usage:
 *   pnpm tsx packages/db/scripts/cleanup-db.ts [--dry-run]
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const isDryRun = process.argv.includes('--dry-run');

interface CleanupStats {
  duplicatesRemoved: number;
  textsNormalized: number;
  categoriesFixed: number;
  difficultiesFixed: number;
}

/**
 * Remove duplicate questions based on normalized text
 */
async function removeDuplicateQuestions(): Promise<number> {
  console.log('\n🔍 Checking for duplicate questions...');
  
  // Find duplicates by normalized text
  const duplicates = await prisma.$queryRaw<Array<{ text: string; count: number }>>`
    SELECT 
      LOWER(TRIM(REGEXP_REPLACE(text, '\\s+', ' ', 'g'))) as normalized,
      COUNT(*) as count,
      MIN(id) as keep_id
    FROM "questions"
    GROUP BY normalized
    HAVING COUNT(*) > 1
  `;
  
  if (duplicates.length === 0) {
    console.log('✅ No duplicates found');
    return 0;
  }
  
  console.log(`Found ${duplicates.length} groups of duplicates`);
  
  let totalRemoved = 0;
  
  for (const dup of duplicates) {
    // Find all questions with this normalized text
    const questions = await prisma.question.findMany({
      where: {
        text: {
          contains: dup.text,
          mode: 'insensitive'
        }
      },
      orderBy: { createdAt: 'asc' },
      select: { id: true, text: true, createdAt: true }
    });
    
    if (questions.length <= 1) continue;
    
    // Keep the first one (oldest), remove the rest
    const toKeep = questions[0];
    const toRemove = questions.slice(1);
    
    console.log(`  → Keeping: "${toKeep.text.substring(0, 50)}..." (${toKeep.id})`);
    console.log(`  → Removing ${toRemove.length} duplicate(s)`);
    
    if (!isDryRun) {
      // Delete user responses for questions we're removing
      await prisma.userQuestion.deleteMany({
        where: { questionId: { in: toRemove.map(q => q.id) } }
      });
      
      // Delete the duplicate questions
      const deleted = await prisma.question.deleteMany({
        where: { id: { in: toRemove.map(q => q.id) } }
      });
      
      totalRemoved += deleted.count;
    } else {
      totalRemoved += toRemove.length;
    }
  }
  
  console.log(`✅ Would remove ${totalRemoved} duplicate questions`);
  return totalRemoved;
}

/**
 * Normalize question text casing and whitespace
 */
async function normalizeQuestionText(): Promise<number> {
  console.log('\n🔤 Normalizing question text...');
  
  const questions = await prisma.question.findMany({
    select: { id: true, text: true }
  });
  
  let normalized = 0;
  
  for (const question of questions) {
    const original = question.text;
    
    // Normalize: trim, collapse whitespace, sentence case
    const cleaned = original
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/([.!?])\s+/g, '$1 '); // Ensure single space after punctuation
    
    // Sentence case (capitalize first letter)
    const normalized = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
    
    if (normalized !== original) {
      if (!isDryRun) {
        await prisma.question.update({
          where: { id: question.id },
          data: { 
            text: normalized,
            normalizedText: normalized.toLowerCase()
          }
        });
      }
      normalized++;
    }
  }
  
  console.log(`✅ Normalized ${normalized} questions`);
  return normalized;
}

/**
 * Fix missing categories/subcategories
 */
async function fixMissingCategories(): Promise<number> {
  console.log('\n📁 Checking for missing categories...');
  
  const questionsWithoutCategory = await prisma.question.count({
    where: { categoryId: '' }
  });
  
  if (questionsWithoutCategory === 0) {
    console.log('✅ All questions have categories');
    return 0;
  }
  
  console.log(`Found ${questionsWithoutCategory} questions without category`);
  
  // Get or create "Uncategorized" category
  let uncategorizedCategory = await prisma.category.findFirst({
    where: { name: 'Uncategorized' }
  });
  
  if (!uncategorizedCategory) {
    if (!isDryRun) {
      uncategorizedCategory = await prisma.category.create({
        data: {
          id: 'uncategorized',
          name: 'Uncategorized'
        }
      });
      console.log('Created "Uncategorized" category');
    } else {
      console.log('Would create "Uncategorized" category');
      return questionsWithoutCategory;
    }
  }
  
  if (!isDryRun && uncategorizedCategory) {
    await prisma.question.updateMany({
      where: { categoryId: '' },
      data: { categoryId: uncategorizedCategory.id }
    });
  }
  
  console.log(`✅ Fixed ${questionsWithoutCategory} questions`);
  return questionsWithoutCategory;
}

/**
 * Standardize difficulty values
 */
async function standardizeDifficulty(): Promise<number> {
  console.log('\n⚖️  Standardizing difficulty levels...');
  
  const validDifficulties = ['easy', 'medium', 'hard'];
  
  const questionsWithInvalidDifficulty = await prisma.question.findMany({
    where: {
      OR: [
        { difficulty: null },
        { difficulty: { notIn: validDifficulties } }
      ]
    },
    select: { id: true, difficulty: true }
  });
  
  if (questionsWithInvalidDifficulty.length === 0) {
    console.log('✅ All difficulties are standardized');
    return 0;
  }
  
  console.log(`Found ${questionsWithInvalidDifficulty.length} questions with non-standard difficulty`);
  
  let fixed = 0;
  
  for (const question of questionsWithInvalidDifficulty) {
    const newDifficulty = question.difficulty?.toLowerCase() || 'medium';
    
    // Map common variants
    const difficultyMap: Record<string, string> = {
      'beginner': 'easy',
      'simple': 'easy',
      'intermediate': 'medium',
      'normal': 'medium',
      'challenging': 'hard',
      'difficult': 'hard',
      'expert': 'hard'
    };
    
    const mapped = difficultyMap[newDifficulty] || 
                   (validDifficulties.includes(newDifficulty) ? newDifficulty : 'medium');
    
    if (!isDryRun) {
      await prisma.question.update({
        where: { id: question.id },
        data: { difficulty: mapped }
      });
    }
    
    fixed++;
  }
  
  console.log(`✅ Standardized ${fixed} difficulty values`);
  return fixed;
}

/**
 * Main cleanup function
 */
async function cleanup(): Promise<CleanupStats> {
  console.log('🧹 Starting database cleanup...');
  console.log(isDryRun ? '⚠️  DRY RUN MODE - No changes will be made\n' : '🔥 LIVE MODE - Changes will be applied\n');
  
  const stats: CleanupStats = {
    duplicatesRemoved: 0,
    textsNormalized: 0,
    categoriesFixed: 0,
    difficultiesFixed: 0
  };
  
  try {
    stats.duplicatesRemoved = await removeDuplicateQuestions();
    stats.textsNormalized = await normalizeQuestionText();
    stats.categoriesFixed = await fixMissingCategories();
    stats.difficultiesFixed = await standardizeDifficulty();
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 CLEANUP SUMMARY');
    console.log('='.repeat(60));
    console.log(`Duplicates removed:      ${stats.duplicatesRemoved}`);
    console.log(`Questions normalized:    ${stats.textsNormalized}`);
    console.log(`Categories fixed:        ${stats.categoriesFixed}`);
    console.log(`Difficulties fixed:      ${stats.difficultiesFixed}`);
    console.log('='.repeat(60));
    
    if (isDryRun) {
      console.log('\n💡 Run without --dry-run to apply changes');
    } else {
      console.log('\n✅ Cleanup complete!');
    }
    
  } catch (error) {
    console.error('\n❌ Cleanup failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
  
  return stats;
}

// Run cleanup
cleanup()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });


