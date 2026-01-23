import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth/auth";

// GET - Получить дела пользователя
export async function GET() {
  try {
    const user = await requireAuth();
    
    // Получаем дела пользователя через user_cases
    const userCases = await prisma.userCase.findMany({
      where: {
        userId: user.id,
        status: "ACTIVE",
      },
      include: {
        case: true,
      },
    });
    
    // Фильтруем только активные дела
    const cases = userCases
      .filter(uc => uc.case.isActive)
      .map(uc => uc.case);
    
    return NextResponse.json({ data: cases, count: cases.length });
  } catch (error) {
    console.error("Error fetching user cases:", error);
    
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }
    
    return NextResponse.json({ error: "Ошибка получения дел" }, { status: 500 });
  }
}
