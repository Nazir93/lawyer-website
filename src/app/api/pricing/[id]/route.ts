import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET - Получить тариф по ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const data = await prisma.pricing.findUnique({
      where: { id },
    });

    if (!data) {
      return NextResponse.json(
        { error: "Тариф не найден" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error fetching pricing:", error);
    return (
      authErrorResponse(error) ||
      NextResponse.json({ error: "Ошибка получения тарифа" }, { status: 500 })
    );
  }
}

// PUT - Обновить тариф
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requirePlatformAdmin();
    const { id } = await params;
    const body = await request.json();

    const updateData: Record<string, unknown> = {};

    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.price !== undefined) updateData.price = body.price;
    if (body.price_note !== undefined) updateData.priceNote = body.price_note;
    if (body.features !== undefined) updateData.features = body.features;
    if (body.is_popular !== undefined) updateData.isPopular = body.is_popular;
    if (body.sort_order !== undefined) updateData.sortOrder = body.sort_order;
    if (body.is_active !== undefined) updateData.isActive = body.is_active;

    const data = await prisma.pricing.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ data, success: true });
  } catch (error) {
    console.error("Error updating pricing:", error);
    return (
      authErrorResponse(error) ||
      NextResponse.json({ error: "Ошибка обновления тарифа" }, { status: 500 })
    );
  }
}

// DELETE - Удалить тариф
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requirePlatformAdmin();
    const { id } = await params;

    await prisma.pricing.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting pricing:", error);
    return (
      authErrorResponse(error) ||
      NextResponse.json({ error: "Ошибка удаления тарифа" }, { status: 500 })
    );
  }
}

