import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST() {
  try {
    // Get first category or create demo one
    let category = await prisma.sssCategory.findFirst();
    
    if (!category) {
      // Create minimal category structure
      const cat = await prisma.category.create({ data: { name: "Auto Category" } });
      const subCat = await prisma.subCategory.create({ data: { name: "Auto SubCat", categoryId: cat.id } });
      const subSubCat = await prisma.subSubCategory.create({ data: { name: "Auto SubSub", subCategoryId: subCat.id } });
      category = await prisma.sssCategory.create({ data: { name: "Auto Leaf", subSubCategoryId: subSubCat.id } });
    }

    const questions = [
      { text: "Do you prefer coffee or tea?", options: ["Coffee", "Tea", "Neither", "Both"] },
      { text: "Are you a morning person?", options: ["Yes, definitely", "Sort of", "Not really", "Absolutely not"] },
      { text: "How do you relax after work?", options: ["Exercise", "Watch TV", "Read", "Sleep"] },
    ];

    for (const q of questions) {
      await prisma.flowQuestion.upsert({
        where: { text: q.text },
        update: {},
        create: {
          text: q.text,
          locale: "en",
          categoryId: category.id,
          type: "SINGLE_CHOICE",
          isActive: true,
          options: {
            create: q.options.map((label, index) => ({
              label,
              value: label.toLowerCase().replace(/\s+/g, '-'),
              order: index,
            })),
          },
        },
      });
    }

    return NextResponse.json({ ok: true, created: questions.length });
  } catch (err: any) {
    console.error('[Admin] generate-questions error:', err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}













