/**
 * Excel to Database Seeding Pipeline
 * Converts Excel → CSV/JSON → Prisma createMany()
 * 
 * Usage:
 *   1. Export Excel to CSV: questions.csv
 *   2. Run: pnpm tsx packages/db/scripts/seed-from-excel.ts --file=questions.csv
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface QuestionRow {
  text: string;
  difficulty?: string;
  category?: string;
  subCategory?: string;
  subSubCategory?: string;
  type?: string;
  metadata?: string;
}

interface SeedStats {
  processed: number;
  imported: number;
  skipped: number;
  errors: number;
}

/**
 * Parse CSV file
 */
function parseCSV(filePath: string): QuestionRow[] {
  console.log(`📖 Reading CSV file: ${filePath}`);
  
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim());
  
  if (lines.length === 0) {
    throw new Error('CSV file is empty');
  }
  
  // Parse header
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  const rows: QuestionRow[] = [];
  
  // Parse rows
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
    
    const row: any = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || undefined;
    });
    
    if (row.text) {
      rows.push(row as QuestionRow);
    }
  }
  
  console.log(`✅ Parsed ${rows.length} rows from CSV`);
  return rows;
}

/**
 * Parse JSON file
 */
function parseJSON(filePath: string): QuestionRow[] {
  console.log(`📖 Reading JSON file: ${filePath}`);
  
  const content = fs.readFileSync(filePath, 'utf-8');
  const data = JSON.parse(content);
  
  const rows = Array.isArray(data) ? data : [data];
  
  console.log(`✅ Parsed ${rows.length} rows from JSON`);
  return rows;
}

/**
 * Get or create category
 */
async function ensureCategory(name: string): Promise<string> {
  const normalized = name.trim();
  
  let category = await prisma.category.findFirst({
    where: { name: normalized }
  });
  
  if (!category) {
    category = await prisma.category.create({
      data: {
        id: normalized.toLowerCase().replace(/\s+/g, '-'),
        name: normalized
      }
    });
    console.log(`  ✨ Created category: ${normalized}`);
  }
  
  return category.id;
}

/**
 * Get or create subcategory
 */
async function ensureSubCategory(name: string, categoryId: string): Promise<string> {
  const normalized = name.trim();
  
  let subCategory = await prisma.subCategory.findFirst({
    where: { 
      name: normalized,
      categoryId 
    }
  });
  
  if (!subCategory) {
    subCategory = await prisma.subCategory.create({
      data: {
        id: `${categoryId}-${normalized.toLowerCase().replace(/\s+/g, '-')}`,
        name: normalized,
        categoryId
      }
    });
    console.log(`  ✨ Created subcategory: ${normalized}`);
  }
  
  return subCategory.id;
}

/**
 * Get or create sssc (leaf category)
 */
async function ensureSssc(name: string, subSubCategoryId?: string): Promise<string> {
  const normalized = name.trim();
  
  let sssc = await prisma.sssCategory.findFirst({
    where: { name: normalized }
  });
  
  if (!sssc) {
    sssc = await prisma.sssCategory.create({
      data: {
        id: normalized.toLowerCase().replace(/\s+/g, '-'),
        name: normalized,
        subSubCategoryId: subSubCategoryId || ''
      }
    });
    console.log(`  ✨ Created leaf category: ${normalized}`);
  }
  
  return sssc.id;
}

/**
 * Import questions from parsed data
 */
async function importQuestions(rows: QuestionRow[]): Promise<SeedStats> {
  const stats: SeedStats = {
    processed: 0,
    imported: 0,
    skipped: 0,
    errors: 0
  };
  
  console.log(`\n📥 Importing ${rows.length} questions...`);
  
  const defaultCategory = await ensureCategory('General');
  const defaultSssc = await ensureSssc('General');
  
  for (const row of rows) {
    stats.processed++;
    
    try {
      // Normalize text
      const text = row.text.trim();
      const normalizedText = text.toLowerCase();
      
      // Check for duplicates
      const existing = await prisma.question.findFirst({
        where: { normalizedText }
      });
      
      if (existing) {
        console.log(`  ⏭️  Skipped (duplicate): "${text.substring(0, 50)}..."`);
        stats.skipped++;
        continue;
      }
      
      // Get/create categories
      let categoryId = defaultCategory;
      let ssscId = defaultSssc;
      
      if (row.category) {
        categoryId = await ensureCategory(row.category);
        
        if (row.subCategory) {
          const subCategoryId = await ensureSubCategory(row.subCategory, categoryId);
          
          if (row.subSubCategory) {
            ssscId = await ensureSssc(row.subSubCategory, subCategoryId);
          }
        }
      }
      
      // Standardize difficulty
      const difficulty = (row.difficulty || 'medium').toLowerCase();
      const validDifficulty = ['easy', 'medium', 'hard'].includes(difficulty) ? difficulty : 'medium';
      
      // Create question
      await prisma.question.create({
        data: {
          text,
          normalizedText,
          difficulty: validDifficulty,
          categoryId,
          ssscId,
          subCategoryId: row.subCategory ? `${categoryId}-${row.subCategory.toLowerCase().replace(/\s+/g, '-')}` : null,
          approved: false, // Require manual approval
          metadata: row.metadata ? JSON.parse(row.metadata) : null
        }
      });
      
      stats.imported++;
      console.log(`  ✅ Imported: "${text.substring(0, 50)}..."`);
      
    } catch (error) {
      stats.errors++;
      console.error(`  ❌ Error importing row ${stats.processed}:`, error);
    }
  }
  
  return stats;
}

/**
 * Main seeding function
 */
async function seed(): Promise<void> {
  console.log('🌱 Starting database seeding...\n');
  
  // Get file path from args
  const fileArg = process.argv.find(arg => arg.startsWith('--file='));
  
  if (!fileArg) {
    console.error('❌ Please provide --file=path/to/file.csv or .json');
    process.exit(1);
  }
  
  const filePath = fileArg.split('=')[1];
  
  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    process.exit(1);
  }
  
  try {
    // Parse file based on extension
    const ext = path.extname(filePath).toLowerCase();
    let rows: QuestionRow[];
    
    if (ext === '.csv') {
      rows = parseCSV(filePath);
    } else if (ext === '.json') {
      rows = parseJSON(filePath);
    } else {
      throw new Error(`Unsupported file type: ${ext}. Use .csv or .json`);
    }
    
    // Import questions
    const stats = await importQuestions(rows);
    
    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 SEEDING SUMMARY');
    console.log('='.repeat(60));
    console.log(`Rows processed:     ${stats.processed}`);
    console.log(`Questions imported: ${stats.imported}`);
    console.log(`Skipped (dupe):     ${stats.skipped}`);
    console.log(`Errors:             ${stats.errors}`);
    console.log('='.repeat(60));
    console.log('\n✅ Seeding complete!');
    
  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run seeding
seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });


