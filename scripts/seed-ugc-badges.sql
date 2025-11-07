-- UGC & Events Milestone Badges
-- v0.17.0 - Add badges for user-generated content achievements

-- First Submission Badge
INSERT INTO "badges" (id, slug, title, description, icon, active, "createdAt")
VALUES (
  gen_random_uuid()::text,
  'ugc_first_submission',
  'First Contribution',
  'Submit your first piece of content to the community',
  '📝',
  true,
  NOW()
) ON CONFLICT (slug) DO NOTHING;

-- Approved Submission Badge
INSERT INTO "badges" (id, slug, title, description, icon, active, "createdAt")
VALUES (
  gen_random_uuid()::text,
  'ugc_first_approved',
  'Approved Creator',
  'Get your first submission approved by moderators',
  '✅',
  true,
  NOW()
) ON CONFLICT (slug) DO NOTHING;

-- Top Contributor Badge
INSERT INTO "badges" (id, slug, title, description, icon, active, "createdAt")
VALUES (
  gen_random_uuid()::text,
  'ugc_top_contributor',
  'Top Contributor',
  'Have 10 approved submissions',
  '⭐',
  true,
  NOW()
) ON CONFLICT (slug) DO NOTHING;

-- Upvote Champion Badge
INSERT INTO "badges" (id, slug, title, description, icon, active, "createdAt")
VALUES (
  gen_random_uuid()::text,
  'ugc_upvote_champion',
  'Upvote Champion',
  'Receive 100+ upvotes across all submissions',
  '🏆',
  true,
  NOW()
) ON CONFLICT (slug) DO NOTHING;

-- Community Favorite Badge
INSERT INTO "badges" (id, slug, title, description, icon, active, "createdAt")
VALUES (
  gen_random_uuid()::text,
  'ugc_community_favorite',
  'Community Favorite',
  'Have a submission reach 50+ score',
  '💎',
  true,
  NOW()
) ON CONFLICT (slug) DO NOTHING;

-- Event Participant Badge
INSERT INTO "badges" (id, slug, title, description, icon, active, "createdAt")
VALUES (
  gen_random_uuid()::text,
  'event_participant',
  'Event Participant',
  'Participate in your first community event',
  '🎉',
  true,
  NOW()
) ON CONFLICT (slug) DO NOTHING;

-- Event Champion Badge
INSERT INTO "badges" (id, slug, title, description, icon, active, "createdAt")
VALUES (
  gen_random_uuid()::text,
  'event_champion',
  'Event Champion',
  'Participate in 10 community events',
  '🌟',
  true,
  NOW()
) ON CONFLICT (slug) DO NOTHING;

