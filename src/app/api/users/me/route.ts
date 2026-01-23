import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/auth";

// GET - Получить текущего пользователя
export async function GET() {
  try {
    const sessionUser = await getCurrentUser();
    
    if (!sessionUser) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }
    
    // Получаем полный профиль пользователя из БД
    const user = await prisma.user.findUnique({
      where: { id: sessionUser.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        image: true,
        emailVerified: true,
        phoneVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    
    if (!user) {
      return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 });
    }
    
    return NextResponse.json({ user });
  } catch (error) {
    console.error("Error fetching current user:", error);
    return NextResponse.json({ error: "Ошибка получения пользователя" }, { status: 500 });
  }
}
