import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ServiceGroup } from "@prisma/client";

// GET - Получить одну услугу
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const data = await prisma.service.findUnique({
      where: { id },
    });
    
    if (!data) {
      return NextResponse.json({ error: "Услуга не найдена" }, { status: 404 });
    }
    
    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error fetching service:", error);
    return (
      authErrorResponse(error) ||
      NextResponse.json({ error: "Ошибка получения данных" }, { status: 500 })
    );
  }
}

// PUT - Обновить услугу
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requirePlatformAdmin();
    const { id } = await params;
    const body = await request.json();
    
    const data = await prisma.service.update({
      where: { id },
      data: {
        title: body.title,
        slug: body.slug,
        description: body.description,
        content: body.content,
        imageUrl: body.image_url,
        icon: body.icon,
        categoryId: body.category_id,
        serviceGroup: body.service_group ? (body.service_group.toUpperCase() as ServiceGroup) : undefined,
        priceFrom: body.price_from,
        priceTo: body.price_to,
        priceText: body.price_text,
        metaTitle: body.meta_title,
        metaDescription: body.meta_description,
        sortOrder: body.sort_order,
        isActive: body.is_active,
      },
    });
    
    return NextResponse.json({ data, success: true });
  } catch (error) {
    console.error("Error updating service:", error);
    return (
      authErrorResponse(error) ||
      NextResponse.json({ error: "Ошибка обновления" }, { status: 500 })
    );
  }
}

// DELETE - Удалить услугу
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requirePlatformAdmin();
    const { id } = await params;
    
    await prisma.service.delete({
      where: { id },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting service:", error);
    return (
      authErrorResponse(error) ||
      NextResponse.json({ error: "Ошибка удаления" }, { status: 500 })
    );
  }
}
