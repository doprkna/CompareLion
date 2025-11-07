# Database Scripts

This directory contains utility scripts for database maintenance and seeding.

## Scripts

### `cleanup-db.ts`
Production-safe database cleanup tool.

**Features**:
- Remove duplicate questions
- Normalize text formatting
- Fix missing categories
- Standardize difficulty values

**Usage**:
```bash
# Dry run (preview only)
pnpm tsx packages/db/scripts/cleanup-db.ts --dry-run

# Execute cleanup
pnpm tsx packages/db/scripts/cleanup-db.ts
```

---

### `seed-from-excel.ts`
Import questions from Excel (via CSV/JSON).

**CSV Format**:
```csv
text,difficulty,category,subCategory,subSubCategory,metadata
"What is your goal?",easy,Personal,Goals,Career,"{""tags"":[""intro""]}"
```

**JSON Format**:
```json
[
  {
    "text": "What is your goal?",
    "difficulty": "easy",
    "category": "Personal",
    "subCategory": "Goals"
  }
]
```

**Usage**:
```bash
pnpm tsx packages/db/scripts/seed-from-excel.ts --file=questions.csv
pnpm tsx packages/db/scripts/seed-from-excel.ts --file=questions.json
```

---

## Safety

⚠️ **All scripts are local-only**
- Run manually on local database
- No automatic production deployment
- Preview with `--dry-run` when available

## Prerequisites

- PostgreSQL running
- Valid `DATABASE_URL` in `.env`
- Prisma client generated (`pnpm prisma:generate`)


