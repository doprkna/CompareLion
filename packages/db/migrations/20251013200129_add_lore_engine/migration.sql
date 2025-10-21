-- CreateTable
CREATE TABLE "lore_eras" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL,
    "startYear" INTEGER,
    "endYear" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "icon" TEXT,
    "color" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lore_eras_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lore_entries" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "eraId" TEXT,
    "author" TEXT,
    "publishedAt" TIMESTAMP(3),
    "category" TEXT,
    "importance" INTEGER NOT NULL DEFAULT 1,
    "relatedFactions" TEXT[],
    "relatedEvents" TEXT[],
    "relatedCharacters" TEXT[],
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "isSecret" BOOLEAN NOT NULL DEFAULT false,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lore_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lore_tags" (
    "id" TEXT NOT NULL,
    "entryId" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lore_tags_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "lore_eras_name_key" ON "lore_eras"("name");

-- CreateIndex
CREATE UNIQUE INDEX "lore_eras_order_key" ON "lore_eras"("order");

-- CreateIndex
CREATE INDEX "lore_eras_order_idx" ON "lore_eras"("order");

-- CreateIndex
CREATE UNIQUE INDEX "lore_entries_slug_key" ON "lore_entries"("slug");

-- CreateIndex
CREATE INDEX "lore_entries_slug_idx" ON "lore_entries"("slug");

-- CreateIndex
CREATE INDEX "lore_entries_eraId_idx" ON "lore_entries"("eraId");

-- CreateIndex
CREATE INDEX "lore_entries_category_idx" ON "lore_entries"("category");

-- CreateIndex
CREATE INDEX "lore_entries_isPublished_idx" ON "lore_entries"("isPublished");

-- CreateIndex
CREATE INDEX "lore_tags_tag_idx" ON "lore_tags"("tag");

-- CreateIndex
CREATE UNIQUE INDEX "lore_tags_entryId_tag_key" ON "lore_tags"("entryId", "tag");

-- AddForeignKey
ALTER TABLE "lore_entries" ADD CONSTRAINT "lore_entries_eraId_fkey" FOREIGN KEY ("eraId") REFERENCES "lore_eras"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lore_tags" ADD CONSTRAINT "lore_tags_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "lore_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;
