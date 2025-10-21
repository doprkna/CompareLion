# @parel/db - Database Package

This package contains the Prisma schema, migrations, and seeding utilities for the Parel MVP.

## 📦 What's Inside

- `schema.prisma` - Complete database schema (199 models)
- `seed.ts` - Intelligent mega seeder
- `migrations/` - Database migration history

## 🚀 Quick Start

### Generate Prisma Client

```bash
pnpm prisma generate
```

### Push Schema to Database

```bash
pnpm db:push
```

### Seed Database

```bash
pnpm db:seed
```

### Reset & Seed (Fresh Start)

```bash
pnpm db:reset-seed
```

### Open Prisma Studio

```bash
pnpm db:studio
```

## 🌱 Mega Seeder

The `seed.ts` script intelligently seeds your database with test data:

### Features

- **20 Users** created (Admin, Demo, + 18 random users)
- **~10 rows per model** with realistic data
- **Topological sorting** to handle foreign key dependencies
- **Smart field detection**:
  - Emails: `user1@example.com`
  - Names: Generated with Faker
  - URLs: `https://example.com`
  - Images: `/avatar/default.png`
  - Dates: Spread over past year
  - Enums: Auto-cycling through values
  - JSON: Structured seed metadata
- **Safe error handling** for constraint violations
- **Comprehensive logging** with success/skip counts

### What Gets Seeded

```
✅ 199 Prisma models analyzed
✅ Topological sort for dependencies
✅ Admin user: admin@example.com (password: 1AmTheArchitect)
✅ Demo user: demo@example.com (password: demo)
✅ 18 random users with realistic data (password: password0-17)
✅ ~10 records per model
```

### Output Example

```
🌱 Starting mega seed...

📊 Found 199 models to seed

👥 Seeding Users...
   ✅ Created 20 users

📋 Seed order: User → Presence → Notification → ...

🔨 Seeding Presence...
   ✅ Created 10 Presence records

🔨 Seeding Question...
   ✅ Created 10 Question records

...

✅ Seed complete!
   Models seeded: 150
   Models skipped: 49
```

### Excluded Models

- `_prisma_migrations` (internal)
- `VerificationToken` (NextAuth meta)
- Any model starting with `_`

## 📝 Schema Management

### Create Migration

```bash
cd packages/db
pnpm prisma migrate dev --name your_migration_name
```

### Apply Migrations

```bash
cd packages/db
pnpm prisma migrate deploy
```

### Reset Database

```bash
cd packages/db
pnpm prisma migrate reset
```

## 🔧 Troubleshooting

### "Prisma client not generated"

Run `pnpm prisma generate` from the `packages/db` directory.

### "Connection refused"

Check your `DATABASE_URL` in `.env` file.

### "Foreign key constraint failed"

The seeder uses topological sorting, but some complex constraints may fail. This is expected and logged as warnings.

## 📚 Documentation

- [Prisma Docs](https://www.prisma.io/docs)
- [Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [Seeding Guide](https://www.prisma.io/docs/guides/database/seed-database)

