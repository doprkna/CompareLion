import type { PrismaClient } from '@prisma/client';
import type { NormalizedSourceRow } from './types';

export interface TaxonomyUpsertResult {
  ssscId: string;
  categoryId: string;
  subCategoryId: string;
  subSubCategoryId: string;
  created: number;
  updated: number;
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48);
}

export async function upsertTaxonomyFromRow(
  prisma: PrismaClient,
  row: NormalizedSourceRow
): Promise<TaxonomyUpsertResult> {
  let created = 0;
  let updated = 0;

  const categoryName = row.categoryName?.trim() || 'General';
  let category = row.externalCId
    ? await prisma.category.findFirst({ where: { externalCId: row.externalCId } })
    : null;
  if (!category) {
    category = await prisma.category.findFirst({ where: { name: categoryName } });
  }
  if (!category) {
    category = await prisma.category.create({
      data: {
        id: slugify(categoryName) || `cat-${Date.now()}`,
        name: categoryName,
        externalCId: row.externalCId ?? null,
      },
    });
    created++;
  } else if (row.externalCId && category.externalCId !== row.externalCId) {
    category = await prisma.category.update({
      where: { id: category.id },
      data: { externalCId: row.externalCId, name: categoryName },
    });
    updated++;
  }

  const subCategoryName = row.subCategoryName?.trim() || categoryName;
  let subCategory = row.externalScId
    ? await prisma.subCategory.findFirst({
        where: { categoryId: category.id, externalScId: row.externalScId },
      })
    : null;
  if (!subCategory) {
    subCategory = await prisma.subCategory.findFirst({
      where: { categoryId: category.id, name: subCategoryName },
    });
  }
  if (!subCategory) {
    subCategory = await prisma.subCategory.create({
      data: {
        id: `${category.id}-${slugify(subCategoryName)}`,
        name: subCategoryName,
        categoryId: category.id,
        externalScId: row.externalScId ?? null,
      },
    });
    created++;
  } else if (row.externalScId && subCategory.externalScId !== row.externalScId) {
    subCategory = await prisma.subCategory.update({
      where: { id: subCategory.id },
      data: { externalScId: row.externalScId, name: subCategoryName },
    });
    updated++;
  }

  const subSubCategoryName = row.subSubCategoryName?.trim() || subCategoryName;
  let subSubCategory = row.externalSscId
    ? await prisma.subSubCategory.findFirst({
        where: { subCategoryId: subCategory.id, externalSscId: row.externalSscId },
      })
    : null;
  if (!subSubCategory) {
    subSubCategory = await prisma.subSubCategory.findFirst({
      where: { subCategoryId: subCategory.id, name: subSubCategoryName },
    });
  }
  if (!subSubCategory) {
    subSubCategory = await prisma.subSubCategory.create({
      data: {
        id: `${subCategory.id}-${slugify(subSubCategoryName)}`,
        name: subSubCategoryName,
        subCategoryId: subCategory.id,
        externalSscId: row.externalSscId ?? null,
      },
    });
    created++;
  } else if (
    row.externalSscId &&
    subSubCategory.externalSscId !== row.externalSscId
  ) {
    subSubCategory = await prisma.subSubCategory.update({
      where: { id: subSubCategory.id },
      data: { externalSscId: row.externalSscId, name: subSubCategoryName },
    });
    updated++;
  }

  const sssName = row.sssCategoryName?.trim() || subSubCategoryName;
  let sssc = row.externalSssId
    ? await prisma.sssCategory.findFirst({
        where: {
          subSubCategoryId: subSubCategory.id,
          externalSssId: row.externalSssId,
        },
      })
    : null;
  if (!sssc) {
    sssc = await prisma.sssCategory.findFirst({
      where: { subSubCategoryId: subSubCategory.id, name: sssName },
    });
  }
  if (!sssc) {
    sssc = await prisma.sssCategory.create({
      data: {
        id: `${subSubCategory.id}-${slugify(sssName)}`,
        name: sssName,
        subSubCategoryId: subSubCategory.id,
        externalSssId: row.externalSssId ?? null,
      },
    });
    created++;
  } else if (row.externalSssId && sssc.externalSssId !== row.externalSssId) {
    sssc = await prisma.sssCategory.update({
      where: { id: sssc.id },
      data: { externalSssId: row.externalSssId, name: sssName },
    });
    updated++;
  }

  return {
    ssscId: sssc.id,
    categoryId: category.id,
    subCategoryId: subCategory.id,
    subSubCategoryId: subSubCategory.id,
    created,
    updated,
  };
}
