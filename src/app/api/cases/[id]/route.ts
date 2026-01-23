import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET - Получить один кейс
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const data = await prisma.case.findUnique({
      where: { id },
    });
    
    if (!data) {
      return NextResponse.json({ error: "Кейс не найден" }, { status: 404 });
    }
    
    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error fetching case:", error);
    return NextResponse.json({ error: "Ошибка получения данных" }, { status: 500 });
  }
}

// PUT - Обновить кейс
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const data = await prisma.case.update({
      where: { id },
      data: {
        title: body.title,
        slug: body.slug,
        description: body.description,
        content: body.content,
        imageUrl: body.image_url,
        category: body.category,
        result: body.result,
        year: body.year,
        clientName: body.client_name,
        duration: body.duration,
        metaTitle: body.meta_title,
        metaDescription: body.meta_description,
        isFeatured: body.is_featured,
        isActive: body.is_active,
      },
    });
    
    return NextResponse.json({ data, success: true });
  } catch (error) {
    console.error("Error updating case:", error);
    return NextResponse.json({ error: "Ошибка обновления" }, { status: 500 });
  }
}

// DELETE - Удалить кейс
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    await prisma.case.delete({
      where: { id },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting case:", error);
    return NextResponse.json({ error: "Ошибка удаления" }, { status: 500 });
  }
}
