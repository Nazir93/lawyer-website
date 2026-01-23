import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth/auth";

// DELETE - Удалить документ
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    
    // Проверяем, что документ принадлежит пользователю
    const doc = await prisma.clientDocument.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });
    
    if (!doc) {
      return NextResponse.json({ error: "Документ не найден" }, { status: 404 });
    }
    
    // Удаляем документ
    await prisma.clientDocument.delete({
      where: { id },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting document:", error);
    
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }
    
    return NextResponse.json({ error: "Ошибка удаления документа" }, { status: 500 });
  }
}
