-- CreateTable
CREATE TABLE "roadmap_items" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "shortDescription" TEXT NOT NULL,
    "longDescription" TEXT,
    "pillar" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "votesCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "roadmap_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roadmap_votes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roadmapItemId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "roadmap_votes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "roadmap_items_slug_key" ON "roadmap_items"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "roadmap_votes_userId_roadmapItemId_key" ON "roadmap_votes"("userId", "roadmapItemId");

-- AddForeignKey
ALTER TABLE "roadmap_votes" ADD CONSTRAINT "roadmap_votes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roadmap_votes" ADD CONSTRAINT "roadmap_votes_roadmapItemId_fkey" FOREIGN KEY ("roadmapItemId") REFERENCES "roadmap_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
