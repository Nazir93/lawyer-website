import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET - Получить один отзыв
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const data = await prisma.review.findUnique({
      where: { id },
    });
    
    if (!data) {
      return NextResponse.json({ error: "Отзыв не найден" }, { status: 404 });
    }
    
    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error fetching review:", error);
    return NextResponse.json({ error: "Ошибка получения данных" }, { status: 500 });
  }
}

// PUT - Обновить отзыв
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const data = await prisma.review.update({
      where: { id },
      data: {
        authorName: body.author_name,
        authorPosition: body.author_position,
        authorCompany: body.author_company,
        authorPhotoUrl: body.author_photo_url,
        content: body.content,
        rating: body.rating,
        serviceId: body.service_id,
        isVerified: body.is_verified,
        isActive: body.is_active,
      },
    });
    
    return NextResponse.json({ data, success: true });
  } catch (error) {
    console.error("Error updating review:", error);
    return NextResponse.json({ error: "Ошибка обновления" }, { status: 500 });
  }
}

// DELETE - Удалить отзыв
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    await prisma.review.delete({
      where: { id },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting review:", error);
    return NextResponse.json({ error: "Ошибка удаления" }, { status: 500 });
  }
}
