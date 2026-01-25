import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth/auth";

// GET - Получить детали дела
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    
    // Проверяем, что пользователь имеет доступ к этому делу
    const userCase = await prisma.userCase.findFirst({
      where: {
        userId: user.id,
        caseId: id,
        status: "ACTIVE",
      },
      include: {
        case: {
          include: {
            documents: {
              where: { userId: user.id },
              orderBy: { createdAt: "desc" },
              take: 10,
            },
            messages: {
              where: {
                OR: [
                  { senderId: user.id },
                  { receiverId: user.id },
                ],
              },
              orderBy: { createdAt: "desc" },
              take: 5,
            },
            appointments: {
              where: { userId: user.id },
              orderBy: { appointmentDate: "desc" },
              take: 5,
            },
          },
        },
      },
    });
    
    if (!userCase) {
      return NextResponse.json({ error: "Дело не найдено" }, { status: 404 });
    }
    
    const c = userCase.case;
    
    const data = {
      id: c.id,
      title: c.title,
      slug: c.slug,
      description: c.description,
      content: c.content,
      category: c.category,
      status: c.caseStatus.toLowerCase(),
      status_label: getStatusLabel(c.caseStatus),
      progress: c.progress,
      next_action: c.nextAction,
      next_action_date: c.nextActionDate?.toISOString() || null,
      start_date: c.startDate.toISOString(),
      client_name: c.clientName,
      image_url: c.imageUrl,
      result: c.result,
      duration: c.duration,
      created_at: c.createdAt.toISOString(),
      updated_at: c.updatedAt.toISOString(),
      // Связанные данные
      documents: c.documents.map(doc => ({
        id: doc.id,
        title: doc.title,
        filename: doc.originalFilename,
        file_url: doc.fileUrl,
        category: doc.category,
        created_at: doc.createdAt.toISOString(),
      })),
      messages: c.messages.map(msg => ({
        id: msg.id,
        text: msg.messageText,
        sender_id: msg.senderId,
        is_me: msg.senderId === user.id,
        created_at: msg.createdAt.toISOString(),
      })),
      appointments: c.appointments.map(apt => ({
        id: apt.id,
        title: apt.title,
        date: apt.appointmentDate.toISOString(),
        status: apt.status,
        type: apt.type,
      })),
    };
    
    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error fetching case details:", error);
    
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }
    
    return NextResponse.json({ error: "Ошибка получения дела" }, { status: 500 });
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

