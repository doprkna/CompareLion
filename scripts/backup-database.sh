#!/bin/bash
# Database Backup Script (v0.11.6)
# 
# Creates compressed database backups with rotation.

set -e

# Configuration
BACKUP_DIR="${BACKUP_DIR:-./backups}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"
DATABASE_URL="${DATABASE_URL}"

# Validate DATABASE_URL
if [ -z "$DATABASE_URL" ]; then
  echo "❌ ERROR: DATABASE_URL not set"
  exit 1
fi

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Generate backup filename with timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="parel_backup_${TIMESTAMP}.sql"
BACKUP_PATH="${BACKUP_DIR}/${BACKUP_FILE}"

echo "🗄️  Starting database backup..."
echo "Timestamp: $TIMESTAMP"

# Create backup
echo "Dumping database..."
pg_dump "$DATABASE_URL" \
  --no-owner \
  --no-acl \
  --clean \
  --if-exists \
  > "$BACKUP_PATH"

if [ $? -eq 0 ]; then
  echo "✅ Database dumped successfully"
else
  echo "❌ Database dump failed"
  exit 1
fi

# Compress backup
echo "Compressing backup..."
gzip "$BACKUP_PATH"
BACKUP_PATH="${BACKUP_PATH}.gz"

if [ $? -eq 0 ]; then
  BACKUP_SIZE=$(du -h "$BACKUP_PATH" | cut -f1)
  echo "✅ Backup compressed: $BACKUP_SIZE"
else
  echo "❌ Compression failed"
  exit 1
fi

# Upload to S3 (if configured)
if [ ! -z "$AWS_ACCESS_KEY_ID" ] && [ ! -z "$S3_BACKUP_BUCKET" ]; then
  echo "Uploading to S3..."
  
  aws s3 cp "$BACKUP_PATH" \
    "s3://${S3_BACKUP_BUCKET}/backups/database/${BACKUP_FILE}.gz" \
    --storage-class STANDARD_IA
  
  if [ $? -eq 0 ]; then
    echo "✅ Uploaded to S3: s3://${S3_BACKUP_BUCKET}/backups/database/${BACKUP_FILE}.gz"
  else
    echo "⚠️  S3 upload failed, backup kept locally"
  fi
fi

# Upload to Supabase Storage (if configured)
if [ ! -z "$SUPABASE_URL" ] && [ ! -z "$SUPABASE_SERVICE_KEY" ]; then
  echo "Uploading to Supabase Storage..."
  
  curl -X POST "${SUPABASE_URL}/storage/v1/object/backups/database/${BACKUP_FILE}.gz" \
    -H "Authorization: Bearer ${SUPABASE_SERVICE_KEY}" \
    -H "Content-Type: application/gzip" \
    --data-binary "@${BACKUP_PATH}"
  
  if [ $? -eq 0 ]; then
    echo "✅ Uploaded to Supabase Storage"
  else
    echo "⚠️  Supabase upload failed, backup kept locally"
  fi
fi

# Clean up old backups
echo "Cleaning up old backups (older than $RETENTION_DAYS days)..."
find "$BACKUP_DIR" -name "parel_backup_*.sql.gz" -type f -mtime +$RETENTION_DAYS -delete

REMAINING=$(find "$BACKUP_DIR" -name "parel_backup_*.sql.gz" -type f | wc -l)
echo "✅ Cleanup complete. $REMAINING backups remaining."

# Summary
echo ""
echo "📊 Backup Summary:"
echo "  File: $BACKUP_PATH"
echo "  Size: $BACKUP_SIZE"
echo "  Timestamp: $TIMESTAMP"
echo "  Retention: $RETENTION_DAYS days"
echo ""
echo "✅ Backup completed successfully!"

exit 0










