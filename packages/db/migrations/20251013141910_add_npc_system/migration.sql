-- CreateTable
CREATE TABLE "npc_profiles" (
    "id" TEXT NOT NULL,
    "npcId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT,
    "avatar" TEXT NOT NULL,
    "archetype" TEXT NOT NULL,
    "personality" JSONB NOT NULL,
    "alignment" TEXT NOT NULL,
    "karmaAffinity" INTEGER NOT NULL DEFAULT 0,
    "archetypeMatch" TEXT[],
    "greetings" JSONB NOT NULL,
    "farewells" JSONB NOT NULL,
    "quirks" TEXT[],
    "canGiveQuests" BOOLEAN NOT NULL DEFAULT true,
    "canGiveRewards" BOOLEAN NOT NULL DEFAULT true,
    "canGiveAdvice" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "appearanceRate" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "minLevel" INTEGER NOT NULL DEFAULT 1,
    "backstory" TEXT,
    "voice" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "npc_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "npc_interactions" (
    "id" TEXT NOT NULL,
    "npcId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "interactionType" TEXT NOT NULL,
    "userArchetype" TEXT,
    "userKarma" INTEGER,
    "userPrestige" INTEGER,
    "npcMessage" TEXT NOT NULL,
    "userResponse" TEXT,
    "sentiment" TEXT,
    "questOffered" TEXT,
    "rewardGiven" JSONB,
    "adviceGiven" TEXT,
    "duration" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "npc_interactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "npc_memories" (
    "id" TEXT NOT NULL,
    "npcId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "memoryType" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "importance" INTEGER NOT NULL DEFAULT 1,
    "lastAccessed" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accessCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "npc_memories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "npc_dialogue_trees" (
    "id" TEXT NOT NULL,
    "npcId" TEXT NOT NULL,
    "treeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "triggerType" TEXT NOT NULL,
    "conditions" JSONB NOT NULL,
    "nodes" JSONB NOT NULL,
    "category" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 5,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "npc_dialogue_trees_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "npc_profiles_npcId_key" ON "npc_profiles"("npcId");

-- CreateIndex
CREATE INDEX "npc_profiles_archetype_isActive_idx" ON "npc_profiles"("archetype", "isActive");

-- CreateIndex
CREATE INDEX "npc_profiles_isActive_appearanceRate_idx" ON "npc_profiles"("isActive", "appearanceRate");

-- CreateIndex
CREATE INDEX "npc_interactions_userId_createdAt_idx" ON "npc_interactions"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "npc_interactions_npcId_createdAt_idx" ON "npc_interactions"("npcId", "createdAt");

-- CreateIndex
CREATE INDEX "npc_memories_npcId_userId_idx" ON "npc_memories"("npcId", "userId");

-- CreateIndex
CREATE INDEX "npc_memories_expiresAt_idx" ON "npc_memories"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "npc_memories_npcId_userId_key_key" ON "npc_memories"("npcId", "userId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "npc_dialogue_trees_treeId_key" ON "npc_dialogue_trees"("treeId");

-- CreateIndex
CREATE INDEX "npc_dialogue_trees_npcId_isActive_idx" ON "npc_dialogue_trees"("npcId", "isActive");

-- AddForeignKey
ALTER TABLE "npc_interactions" ADD CONSTRAINT "npc_interactions_npcId_fkey" FOREIGN KEY ("npcId") REFERENCES "npc_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "npc_interactions" ADD CONSTRAINT "npc_interactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "npc_memories" ADD CONSTRAINT "npc_memories_npcId_fkey" FOREIGN KEY ("npcId") REFERENCES "npc_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
