import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/auth";

// GET - Получить список пользователей (для админа)
export async function GET() {
  try {
    await requireAdmin();
    
    const data = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
      },
    });

    return NextResponse.json({
      data: data.map((user) => ({
        id: user.id,
        name: user.name || user.email || "Без имени",
        email: user.email || "",
        phone: user.phone || "",
        role: user.role,
      })),
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
    }
    
    return NextResponse.json({ error: "Ошибка получения пользователей" }, { status: 500 });
  }
}
