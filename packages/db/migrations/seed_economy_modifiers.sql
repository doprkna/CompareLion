-- v0.34.2 - Add economy gamification modifiers
-- Extends BalanceSetting with streak bonuses, social multipliers, and weekly modifiers

-- Insert new balance settings (upsert to avoid conflicts)
INSERT INTO balance_settings (id, key, value, "updatedAt")
VALUES 
  (gen_random_uuid(), 'streak_xp_bonus', 0.05, NOW()),
  (gen_random_uuid(), 'social_xp_multiplier', 1.1, NOW()),
  (gen_random_uuid(), 'weekly_modifier_name', 0, NOW()),
  (gen_random_uuid(), 'weekly_modifier_value', 0.1, NOW())
ON CONFLICT (key) DO UPDATE 
SET "updatedAt" = NOW();
