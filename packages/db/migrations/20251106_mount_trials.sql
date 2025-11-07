-- v0.34.4 - Mount Trials: Short mount-specific micro-challenges

-- Create MountTrial table
CREATE TABLE IF NOT EXISTS mount_trials (
  id VARCHAR(255) PRIMARY KEY,
  "mountId" VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  "rewardType" VARCHAR(50) NOT NULL, -- 'badge', 'speed', 'karma', 'xp', 'gold'
  "rewardValue" INTEGER NOT NULL DEFAULT 0,
  "maxAttempts" INTEGER, -- NULL = unlimited
  "expiresAt" TIMESTAMP, -- NULL = no expiry
  "isActive" BOOLEAN DEFAULT TRUE,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Create UserMountTrial table
CREATE TABLE IF NOT EXISTS user_mount_trials (
  id VARCHAR(255) PRIMARY KEY,
  "userId" VARCHAR(255) NOT NULL,
  "trialId" VARCHAR(255) NOT NULL REFERENCES mount_trials(id) ON DELETE CASCADE,
  progress INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  "lastAttemptAt" TIMESTAMP,
  "completedAt" TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT unique_user_trial UNIQUE ("userId", "trialId")
);

-- Create indexes
CREATE INDEX IF NOT EXISTS mount_trials_mountId_idx ON mount_trials("mountId");
CREATE INDEX IF NOT EXISTS mount_trials_isActive_idx ON mount_trials("isActive");
CREATE INDEX IF NOT EXISTS user_mount_trials_userId_idx ON user_mount_trials("userId");
CREATE INDEX IF NOT EXISTS user_mount_trials_trialId_idx ON user_mount_trials("trialId");
CREATE INDEX IF NOT EXISTS user_mount_trials_completed_idx ON user_mount_trials(completed);

-- Seed basic mount trials (example - adjust mountId based on your data)
INSERT INTO mount_trials (id, "mountId", name, description, "rewardType", "rewardValue", "maxAttempts", "expiresAt", "isActive")
VALUES
  (gen_random_uuid()::text, 'mount-basic-1', 'Daily Dedication', 'Complete 3 daily missions while mounted', 'xp', 100, NULL, NULL, TRUE),
  (gen_random_uuid()::text, 'mount-basic-1', 'Karma Collector', 'Earn 50 karma points with this mount', 'speed', 1, 1, NULL, TRUE),
  (gen_random_uuid()::text, 'mount-rare-1', 'Epic Journey', 'Complete 5 challenges in a single day', 'badge', 1, NULL, DATE_TRUNC('day', NOW() + INTERVAL '7 days'), TRUE)
ON CONFLICT DO NOTHING;
