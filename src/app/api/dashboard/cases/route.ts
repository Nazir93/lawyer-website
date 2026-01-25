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
      orderBy: {
        case: {
          updatedAt: "desc",
        },
      },
    });
    
    // Преобразуем в формат для фронтенда
    const cases = userCases
      .filter(uc => uc.case.isActive)
      .map(uc => {
        const c = uc.case;
        return {
          id: c.id,
          title: c.title,
          slug: c.slug,
          description: c.description,
          category: c.category,
          status: c.caseStatus.toLowerCase(),
          status_label: getStatusLabel(c.caseStatus),
          progress: c.progress,
          next_action: c.nextAction,
          next_action_date: c.nextActionDate?.toISOString() || null,
          start_date: c.startDate.toISOString(),
          client_name: c.clientName,
          image_url: c.imageUrl,
          created_at: c.createdAt.toISOString(),
          updated_at: c.updatedAt.toISOString(),
        };
      });
    
    return NextResponse.json({ data: cases, count: cases.length });
  } catch (error) {
    console.error("Error fetching user cases:", error);
    
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }
    
    return NextResponse.json({ error: "Ошибка получения дел" }, { status: 500 });
  }
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    CONSULTATION: "Консультация",
    IN_PROGRESS: "В работе",
    PENDING: "Ожидание",
    COURT: "В суде",
    APPEAL: "Апелляция",
    COMPLETED: "Завершено",
    CANCELLED: "Отменено",
  };
  return labels[status] || status;
}
