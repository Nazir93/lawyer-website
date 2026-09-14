import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// POST - Изменить порядок разделов
export async function POST(request: NextRequest) {
  try {
    await requirePlatformAdmin();
    const body = await request.json();
    const { sections } = body;

    if (!Array.isArray(sections)) {
      return NextResponse.json(
        { error: "Неверный формат данных" },
        { status: 400 }
      );
    }

    // Обновляем порядок сортировки для каждого раздела
    const updates = sections.map((item: { id: string; sort_order: number }, index: number) =>
      prisma.section.update({
        where: { id: item.id },
        data: { sortOrder: item.sort_order ?? index },
      })
    );

    await prisma.$transaction(updates);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error reordering sections:", error);
    return (
      authErrorResponse(error) ||
      NextResponse.json({ error: "Ошибка изменения порядка" }, { status: 500 })
    );
  }
}

