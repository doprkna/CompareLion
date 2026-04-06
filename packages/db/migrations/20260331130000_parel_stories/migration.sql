-- Parel Stories + rating request/result tables (v0.49.x, @parel/story alignment)

CREATE TABLE "stories" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "panelCount" INTEGER NOT NULL DEFAULT 1,
    "coverImageUrl" TEXT,
    "exportId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "visibility" TEXT NOT NULL DEFAULT 'private',
    "title" TEXT,
    "publishedAt" TIMESTAMP(3),
    "parentStoryId" TEXT,
    "remixType" TEXT,
    "panelMetadata" JSONB,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "reachScore" INTEGER NOT NULL DEFAULT 0,
    "audioType" TEXT DEFAULT 'none',
    "audioTagId" TEXT,
    "audioUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stories_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "stories_exportId_key" ON "stories"("exportId");
CREATE INDEX "stories_userId_idx" ON "stories"("userId");
CREATE INDEX "stories_status_visibility_createdAt_idx" ON "stories"("status", "visibility", "createdAt");
CREATE INDEX "stories_parentStoryId_idx" ON "stories"("parentStoryId");

ALTER TABLE "stories" ADD CONSTRAINT "stories_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "stories" ADD CONSTRAINT "stories_parentStoryId_fkey" FOREIGN KEY ("parentStoryId") REFERENCES "stories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "story_reactions" (
    "id" TEXT NOT NULL,
    "storyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "story_reactions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "story_reactions_storyId_userId_type_key" ON "story_reactions"("storyId", "userId", "type");
CREATE INDEX "story_reactions_storyId_idx" ON "story_reactions"("storyId");
CREATE INDEX "story_reactions_userId_idx" ON "story_reactions"("userId");

ALTER TABLE "story_reactions" ADD CONSTRAINT "story_reactions_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "stories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "story_reactions" ADD CONSTRAINT "story_reactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "story_views" (
    "id" TEXT NOT NULL,
    "storyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "story_views_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "story_views_storyId_idx" ON "story_views"("storyId");

ALTER TABLE "story_views" ADD CONSTRAINT "story_views_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "stories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "story_challenges" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "promptType" TEXT NOT NULL,
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "story_challenges_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "story_challenge_entries" (
    "id" TEXT NOT NULL,
    "challengeId" TEXT NOT NULL,
    "storyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "story_challenge_entries_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "story_challenge_entries_challengeId_storyId_key" ON "story_challenge_entries"("challengeId", "storyId");
CREATE INDEX "story_challenge_entries_challengeId_idx" ON "story_challenge_entries"("challengeId");
CREATE INDEX "story_challenge_entries_storyId_idx" ON "story_challenge_entries"("storyId");

ALTER TABLE "story_challenge_entries" ADD CONSTRAINT "story_challenge_entries_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "story_challenges"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "story_challenge_entries" ADD CONSTRAINT "story_challenge_entries_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "stories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "story_challenge_entries" ADD CONSTRAINT "story_challenge_entries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "story_collections" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "story_collections_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "story_collections_userId_idx" ON "story_collections"("userId");

ALTER TABLE "story_collections" ADD CONSTRAINT "story_collections_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "story_collection_items" (
    "id" TEXT NOT NULL,
    "collectionId" TEXT NOT NULL,
    "storyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "story_collection_items_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "story_collection_items_collectionId_storyId_key" ON "story_collection_items"("collectionId", "storyId");
CREATE INDEX "story_collection_items_collectionId_idx" ON "story_collection_items"("collectionId");

ALTER TABLE "story_collection_items" ADD CONSTRAINT "story_collection_items_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "story_collections"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "story_collection_items" ADD CONSTRAINT "story_collection_items_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "stories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "story_templates" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "panelCount" INTEGER NOT NULL,
    "layoutMode" TEXT NOT NULL,
    "panelLabels" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "panelHelpTexts" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "story_templates_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "story_templates_userId_idx" ON "story_templates"("userId");
CREATE INDEX "story_templates_isPublic_idx" ON "story_templates"("isPublic");

ALTER TABLE "story_templates" ADD CONSTRAINT "story_templates_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "rating_requests" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rating_requests_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "rating_requests_userId_createdAt_idx" ON "rating_requests"("userId", "createdAt");

ALTER TABLE "rating_requests" ADD CONSTRAINT "rating_requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "rating_results" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "metrics" JSONB NOT NULL DEFAULT '{}',
    "summaryText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rating_results_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "rating_results_requestId_key" ON "rating_results"("requestId");

ALTER TABLE "rating_results" ADD CONSTRAINT "rating_results_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "rating_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;
