-- CreateEnum
CREATE TYPE "NewsCategory" AS ENUM ('FEATURE', 'UPDATE', 'NEWS', 'PROMO', 'ALERT');

-- CreateEnum
CREATE TYPE "NewsStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'PUBLISHED', 'ARCHIVED');

-- AlterTable
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "lastNewsSeenAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "news_posts" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT,
    "content" JSONB NOT NULL,
    "coverImageUrl" TEXT,
    "media" JSONB,
    "category" "NewsCategory" NOT NULL,
    "status" "NewsStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "scheduledAt" TIMESTAMP(3),
    "authorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "news_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "news_reactions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "news_reactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "news_seen" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "seenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "news_seen_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "news_posts_slug_key" ON "news_posts"("slug");

-- CreateIndex
CREATE INDEX "news_posts_status_publishedAt_idx" ON "news_posts"("status", "publishedAt");

-- CreateIndex
CREATE INDEX "news_posts_category_publishedAt_idx" ON "news_posts"("category", "publishedAt");

-- CreateIndex
CREATE UNIQUE INDEX "news_reactions_userId_postId_type_key" ON "news_reactions"("userId", "postId", "type");

-- CreateIndex
CREATE INDEX "news_reactions_postId_createdAt_idx" ON "news_reactions"("postId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "news_seen_userId_postId_key" ON "news_seen"("userId", "postId");

-- CreateIndex
CREATE INDEX "news_seen_userId_seenAt_idx" ON "news_seen"("userId", "seenAt");

-- AddForeignKey
ALTER TABLE "news_posts" ADD CONSTRAINT "news_posts_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "news_reactions" ADD CONSTRAINT "news_reactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "news_reactions" ADD CONSTRAINT "news_reactions_postId_fkey" FOREIGN KEY ("postId") REFERENCES "news_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "news_seen" ADD CONSTRAINT "news_seen_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "news_seen" ADD CONSTRAINT "news_seen_postId_fkey" FOREIGN KEY ("postId") REFERENCES "news_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
