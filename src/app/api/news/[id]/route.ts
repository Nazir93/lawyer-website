import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET - Получить одну новость
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const data = await prisma.news.findUnique({
      where: { id },
    });
    
    if (!data) {
      return NextResponse.json({ error: "Новость не найдена" }, { status: 404 });
    }
    
    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error fetching news:", error);
    return NextResponse.json({ error: "Ошибка получения данных" }, { status: 500 });
  }
}

// PUT - Обновить новость
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Если публикуем впервые, устанавливаем дату
    let publishedAt = body.published_at ? new Date(body.published_at) : undefined;
    if (body.is_published && !publishedAt) {
      publishedAt = new Date();
    }
    
    const data = await prisma.news.update({
      where: { id },
      data: {
        title: body.title,
        slug: body.slug,
        description: body.description,
        content: body.content,
        imageUrl: body.image_url,
        categoryId: body.category_id,
        metaTitle: body.meta_title,
        metaDescription: body.meta_description,
        isPublished: body.is_published,
        publishedAt,
      },
    });
    
    return NextResponse.json({ data, success: true });
  } catch (error) {
    console.error("Error updating news:", error);
    return NextResponse.json({ error: "Ошибка обновления" }, { status: 500 });
  }
}

// DELETE - Удалить новость
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    await prisma.news.delete({
      where: { id },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting news:", error);
    return NextResponse.json({ error: "Ошибка удаления" }, { status: 500 });
  }
}
