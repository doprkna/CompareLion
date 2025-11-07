-- v0.34.3 - Marketplace Revamp: Add category types, tags, and featured flag

-- Add new enum values to ItemCategory (if using PostgreSQL enum)
ALTER TYPE "ItemCategory" ADD VALUE IF NOT EXISTS 'utility';
ALTER TYPE "ItemCategory" ADD VALUE IF NOT EXISTS 'social';

-- Add tag and isFeatured columns to market_items
ALTER TABLE market_items 
ADD COLUMN IF NOT EXISTS tag VARCHAR(50),
ADD COLUMN IF NOT EXISTS "isFeatured" BOOLEAN DEFAULT FALSE;

-- Create index for featured items
CREATE INDEX IF NOT EXISTS "market_items_isFeatured_idx" ON market_items("isFeatured");
CREATE INDEX IF NOT EXISTS "market_items_tag_idx" ON market_items(tag);

-- Update existing items with default values (optional)
UPDATE market_items SET "isFeatured" = FALSE WHERE "isFeatured" IS NULL;

-- Seed some default tags for existing items (example)
-- UPDATE market_items SET tag = 'featured' WHERE rarity = 'epic' AND "isFeatured" = TRUE;
