-- Economy & Season Seed Data
-- v0.18.0 - Initial cosmetics and first season

-- Create First Season
INSERT INTO "seasons" (id, name, "displayName", number, "startDate", "endDate", status, metadata, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid()::text,
  'season-1',
  'Foundation Season',
  1,
  NOW(),
  NOW() + INTERVAL '90 days',
  'ACTIVE',
  '{"durationDays": 90, "theme": "foundation", "rewards": ["exclusive_cosmetics", "season_1_badge"]}',
  NOW(),
  NOW()
) ON CONFLICT (number) DO NOTHING;

-- Cosmetic Items: TITLES
INSERT INTO "cosmetic_items" (id, slug, name, description, type, rarity, price, "imageUrl", active, "seasonOnly", "createdAt")
VALUES
  (gen_random_uuid()::text, 'title_newbie', 'Newbie', 'Just starting out', 'TITLE', 'COMMON', 10, NULL, true, false, NOW()),
  (gen_random_uuid()::text, 'title_explorer', 'Explorer', 'Curious wanderer', 'TITLE', 'COMMON', 25, NULL, true, false, NOW()),
  (gen_random_uuid()::text, 'title_scholar', 'Scholar', 'Knowledge seeker', 'TITLE', 'UNCOMMON', 50, NULL, true, false, NOW()),
  (gen_random_uuid()::text, 'title_sage', 'Sage', 'Wise one', 'TITLE', 'RARE', 100, NULL, true, false, NOW()),
  (gen_random_uuid()::text, 'title_master', 'Master', 'Top performer', 'TITLE', 'EPIC', 250, NULL, true, false, NOW()),
  (gen_random_uuid()::text, 'title_legend', 'Legend', 'Legendary status', 'TITLE', 'LEGENDARY', 500, NULL, true, false, NOW()),
  (gen_random_uuid()::text, 'title_founder', 'Founder', 'Season 1 exclusive', 'TITLE', 'LEGENDARY', 1000, NULL, true, true, NOW())
ON CONFLICT (slug) DO NOTHING;

-- Cosmetic Items: ICONS
INSERT INTO "cosmetic_items" (id, slug, name, description, type, rarity, price, "imageUrl", active, "seasonOnly", "createdAt")
VALUES
  (gen_random_uuid()::text, 'icon_star', '⭐ Star', 'Classic star icon', 'ICON', 'COMMON', 15, NULL, true, false, NOW()),
  (gen_random_uuid()::text, 'icon_heart', '❤️ Heart', 'Show some love', 'ICON', 'COMMON', 15, NULL, true, false, NOW()),
  (gen_random_uuid()::text, 'icon_fire', '🔥 Fire', 'You''re on fire!', 'ICON', 'UNCOMMON', 50, NULL, true, false, NOW()),
  (gen_random_uuid()::text, 'icon_crown', '👑 Crown', 'Royal icon', 'ICON', 'RARE', 100, NULL, true, false, NOW()),
  (gen_random_uuid()::text, 'icon_diamond', '💎 Diamond', 'Precious gem', 'ICON', 'EPIC', 200, NULL, true, false, NOW()),
  (gen_random_uuid()::text, 'icon_trophy', '🏆 Trophy', 'Winner icon', 'ICON', 'EPIC', 250, NULL, true, false, NOW()),
  (gen_random_uuid()::text, 'icon_rocket', '🚀 Rocket', 'To the moon!', 'ICON', 'LEGENDARY', 500, NULL, true, false, NOW())
ON CONFLICT (slug) DO NOTHING;

-- Cosmetic Items: BACKGROUNDS
INSERT INTO "cosmetic_items" (id, slug, name, description, type, rarity, price, "imageUrl", active, "seasonOnly", "createdAt")
VALUES
  (gen_random_uuid()::text, 'bg_blue', 'Ocean Blue', 'Calm blue background', 'BACKGROUND', 'COMMON', 20, NULL, true, false, NOW()),
  (gen_random_uuid()::text, 'bg_green', 'Forest Green', 'Natural green background', 'BACKGROUND', 'COMMON', 20, NULL, true, false, NOW()),
  (gen_random_uuid()::text, 'bg_purple', 'Royal Purple', 'Majestic purple', 'BACKGROUND', 'UNCOMMON', 60, NULL, true, false, NOW()),
  (gen_random_uuid()::text, 'bg_gold', 'Golden Glow', 'Luxurious gold', 'BACKGROUND', 'RARE', 150, NULL, true, false, NOW()),
  (gen_random_uuid()::text, 'bg_galaxy', 'Galaxy', 'Cosmic background', 'BACKGROUND', 'EPIC', 300, NULL, true, false, NOW()),
  (gen_random_uuid()::text, 'bg_aurora', 'Aurora', 'Northern lights', 'BACKGROUND', 'LEGENDARY', 600, NULL, true, false, NOW())
ON CONFLICT (slug) DO NOTHING;

-- Cosmetic Items: BADGES
INSERT INTO "cosmetic_items" (id, slug, name, description, type, rarity, price, "imageUrl", active, "seasonOnly", "createdAt")
VALUES
  (gen_random_uuid()::text, 'badge_bronze', 'Bronze Badge', 'Bronze tier badge', 'BADGE', 'COMMON', 30, NULL, true, false, NOW()),
  (gen_random_uuid()::text, 'badge_silver', 'Silver Badge', 'Silver tier badge', 'BADGE', 'UNCOMMON', 75, NULL, true, false, NOW()),
  (gen_random_uuid()::text, 'badge_gold', 'Gold Badge', 'Gold tier badge', 'BADGE', 'RARE', 180, NULL, true, false, NOW()),
  (gen_random_uuid()::text, 'badge_platinum', 'Platinum Badge', 'Platinum tier badge', 'BADGE', 'EPIC', 350, NULL, true, false, NOW()),
  (gen_random_uuid()::text, 'badge_diamond', 'Diamond Badge', 'Ultimate badge', 'BADGE', 'LEGENDARY', 750, NULL, true, false, NOW())
ON CONFLICT (slug) DO NOTHING;

-- Cosmetic Items: FRAMES
INSERT INTO "cosmetic_items" (id, slug, name, description, type, rarity, price, "imageUrl", active, "seasonOnly", "createdAt")
VALUES
  (gen_random_uuid()::text, 'frame_simple', 'Simple Frame', 'Clean border', 'FRAME', 'COMMON', 25, NULL, true, false, NOW()),
  (gen_random_uuid()::text, 'frame_elegant', 'Elegant Frame', 'Refined border', 'FRAME', 'UNCOMMON', 70, NULL, true, false, NOW()),
  (gen_random_uuid()::text, 'frame_ornate', 'Ornate Frame', 'Decorative border', 'FRAME', 'RARE', 160, NULL, true, false, NOW()),
  (gen_random_uuid()::text, 'frame_cosmic', 'Cosmic Frame', 'Space-themed border', 'FRAME', 'EPIC', 320, NULL, true, false, NOW()),
  (gen_random_uuid()::text, 'frame_legendary', 'Legendary Frame', 'Ultimate border', 'FRAME', 'LEGENDARY', 800, NULL, true, false, NOW())
ON CONFLICT (slug) DO NOTHING;

-- Verify data
DO $$
DECLARE
  season_count INT;
  cosmetic_count INT;
BEGIN
  SELECT COUNT(*) INTO season_count FROM seasons WHERE status = 'ACTIVE';
  SELECT COUNT(*) INTO cosmetic_count FROM cosmetic_items WHERE active = true;
  
  RAISE NOTICE 'Seed complete:';
  RAISE NOTICE '  Active seasons: %', season_count;
  RAISE NOTICE '  Active cosmetics: %', cosmetic_count;
END $$;

