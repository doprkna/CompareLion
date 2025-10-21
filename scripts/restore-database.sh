#!/bin/bash
# Database Restore Script (v0.11.6)
# 
# Restores database from compressed backup.

set -e

# Configuration
BACKUP_FILE="${1}"
DATABASE_URL="${DATABASE_URL}"

# Validate inputs
if [ -z "$BACKUP_FILE" ]; then
  echo "❌ ERROR: No backup file specified"
  echo "Usage: ./restore-database.sh <backup-file.sql.gz>"
  exit 1
fi

if [ ! -f "$BACKUP_FILE" ]; then
  echo "❌ ERROR: Backup file not found: $BACKUP_FILE"
  exit 1
fi

if [ -z "$DATABASE_URL" ]; then
  echo "❌ ERROR: DATABASE_URL not set"
  exit 1
fi

echo "⚠️  WARNING: This will RESTORE the database from backup"
echo "Database: $DATABASE_URL"
echo "Backup: $BACKUP_FILE"
echo ""
read -p "Are you sure? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
  echo "❌ Restore cancelled"
  exit 0
fi

echo ""
echo "🗄️  Starting database restore..."

# Decompress backup
echo "Decompressing backup..."
TEMP_FILE=$(mktemp)
gunzip -c "$BACKUP_FILE" > "$TEMP_FILE"

if [ $? -eq 0 ]; then
  echo "✅ Backup decompressed"
else
  echo "❌ Decompression failed"
  rm -f "$TEMP_FILE"
  exit 1
fi

# Restore database
echo "Restoring database..."
psql "$DATABASE_URL" < "$TEMP_FILE"

if [ $? -eq 0 ]; then
  echo "✅ Database restored successfully"
else
  echo "❌ Restore failed"
  rm -f "$TEMP_FILE"
  exit 1
fi

# Clean up
rm -f "$TEMP_FILE"

echo ""
echo "✅ Restore completed successfully!"
echo ""
echo "⚠️  Next steps:"
echo "  1. Run migrations: pnpm prisma migrate deploy"
echo "  2. Restart application"
echo "  3. Verify data integrity"

exit 0











