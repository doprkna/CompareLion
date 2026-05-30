import type { PrismaClient } from '@prisma/client';
import type { NormalizedSourceRow } from './types';

export type TaxonomyPlanAction = 'create' | 'update' | 'unchanged';

export interface TaxonomyPlanResult {
  categoryId: string;
  subCategoryId: string;
  subSubCategoryId: string;
  ssscId: string;
  wouldCreate: number;
  wouldUpdate: number;
  nodes: {
    level: 'category' | 'subCategory' | 'subSubCategory' | 'sssCategory';
    name: string;
    externalId?: string;
    action: TaxonomyPlanAction;
  }[];
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48);
}

export async function planTaxonomyFromRow(
  prisma: PrismaClient,
  row: NormalizedSourceRow
): Promise<TaxonomyPlanResult> {
  let wouldCreate = 0;
  let wouldUpdate = 0;
  const nodes: TaxonomyPlanResult['nodes'] = [];

  const categoryName = row.categoryName?.trim() || 'General';
  let category = row.externalCId
    ? await prisma.category.findFirst({ where: { externalCId: row.externalCId } })
    : null;
  if (!category) {
    category = await prisma.category.findFirst({ where: { name: categoryName } });
  }
  let categoryAction: TaxonomyPlanAction = 'unchanged';
  const plannedCategoryId = category?.id ?? (slugify(categoryName) || 'cat-plan');
  if (!category) {
    categoryAction = 'create';
    wouldCreate++;
  } else if (row.externalCId && category.externalCId !== row.externalCId) {
    categoryAction = 'update';
    wouldUpdate++;
  }
  nodes.push({
    level: 'category',
    name: categoryName,
    externalId: row.externalCId,
    action: categoryAction,
  });

  const categoryId = category?.id ?? plannedCategoryId;
  const subCategoryName = row.subCategoryName?.trim() || categoryName;
  let subCategory = row.externalScId
    ? await prisma.subCategory.findFirst({
        where: { categoryId, externalScId: row.externalScId },
      })
    : null;
  if (!subCategory) {
    subCategory = await prisma.subCategory.findFirst({
      where: { categoryId, name: subCategoryName },
    });
  }
  let subCategoryAction: TaxonomyPlanAction = 'unchanged';
  const plannedSubCategoryId = subCategory?.id ?? `${categoryId}-${slugify(subCategoryName)}`;
  if (!subCategory) {
    subCategoryAction = 'create';
    wouldCreate++;
  } else if (row.externalScId && subCategory.externalScId !== row.externalScId) {
    subCategoryAction = 'update';
    wouldUpdate++;
  }
  nodes.push({
    level: 'subCategory',
    name: subCategoryName,
    externalId: row.externalScId,
    action: subCategoryAction,
  });

  const subCategoryId = subCategory?.id ?? plannedSubCategoryId;
  const subSubCategoryName = row.subSubCategoryName?.trim() || subCategoryName;
  let subSubCategory = row.externalSscId
    ? await prisma.subSubCategory.findFirst({
        where: { subCategoryId, externalSscId: row.externalSscId },
      })
    : null;
  if (!subSubCategory) {
    subSubCategory = await prisma.subSubCategory.findFirst({
      where: { subCategoryId, name: subSubCategoryName },
    });
  }
  let subSubAction: TaxonomyPlanAction = 'unchanged';
  const plannedSubSubId =
    subSubCategory?.id ?? `${subCategoryId}-${slugify(subSubCategoryName)}`;
  if (!subSubCategory) {
    subSubAction = 'create';
    wouldCreate++;
  } else if (row.externalSscId && subSubCategory.externalSscId !== row.externalSscId) {
    subSubAction = 'update';
    wouldUpdate++;
  }
  nodes.push({
    level: 'subSubCategory',
    name: subSubCategoryName,
    externalId: row.externalSscId,
    action: subSubAction,
  });

  const subSubCategoryId = subSubCategory?.id ?? plannedSubSubId;
  const sssName = row.sssCategoryName?.trim() || subSubCategoryName;
  let sssc = row.externalSssId
    ? await prisma.sssCategory.findFirst({
        where: { subSubCategoryId, externalSssId: row.externalSssId },
      })
    : null;
  if (!sssc) {
    sssc = await prisma.sssCategory.findFirst({
      where: { subSubCategoryId, name: sssName },
    });
  }
  let sssAction: TaxonomyPlanAction = 'unchanged';
  const plannedSsscId = sssc?.id ?? `${subSubCategoryId}-${slugify(sssName)}`;
  if (!sssc) {
    sssAction = 'create';
    wouldCreate++;
  } else if (row.externalSssId && sssc.externalSssId !== row.externalSssId) {
    sssAction = 'update';
    wouldUpdate++;
  }
  nodes.push({
    level: 'sssCategory',
    name: sssName,
    externalId: row.externalSssId,
    action: sssAction,
  });

  return {
    categoryId,
    subCategoryId,
    subSubCategoryId,
    ssscId: sssc?.id ?? plannedSsscId,
    wouldCreate,
    wouldUpdate,
    nodes,
  };
}
