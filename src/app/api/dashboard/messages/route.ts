import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth/auth";
import { ConversationType } from "@prisma/client";

// GET - Получить сообщения пользователя
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    
    const conversationId = searchParams.get("conversation_id");
    const caseId = searchParams.get("case_id");
    
    // Определяем ID беседы
    let convId = conversationId;
    if (!convId) {
      if (caseId) {
        convId = `case_${caseId}`;
      } else {
        convId = `user_${user.id}`;
      }
    }
    
    // Получаем сообщения только по conversationId
    const data = await prisma.message.findMany({
      where: {
        conversationId: convId,
        // Убеждаемся что пользователь участник беседы
        OR: [
          { senderId: user.id },
          { receiverId: user.id },
        ],
      },
      orderBy: { createdAt: "asc" },
    });
    
    return NextResponse.json({ data, count: data.length });
  } catch (error) {
    console.error("Error fetching messages:", error);
    
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }
    
    return NextResponse.json({ error: "Ошибка получения сообщений" }, { status: 500 });
  }
}

// POST - Отправить сообщение
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    
    // Определяем ID беседы
    let conversationId = body.conversation_id;
    if (!conversationId) {
      if (body.case_id) {
        conversationId = `case_${body.case_id}`;
      } else {
        conversationId = `user_${user.id}`;
      }
    }

    // Доступ к делу: участник UserCase, юрист-владелец или ADMIN
    if (body.case_id) {
      const caseId = String(body.case_id);
      if (user.role !== "ADMIN") {
        const asClient = await prisma.userCase.findFirst({
          where: { userId: user.id, caseId },
          select: { id: true },
        });
        const asLawyer = await prisma.case.findFirst({
          where: { id: caseId, lawyer: { userId: user.id } },
          select: { id: true },
        });
        if (!asClient && !asLawyer) {
          return NextResponse.json(
            { error: "Нет доступа к этому делу" },
            { status: 403 }
          );
        }
      }
    }

    const data = await prisma.message.create({
      data: {
        conversationId,
        senderId: user.id,
        receiverId: body.receiver_id || null,
        conversationType: body.conversation_type
          ? (body.conversation_type.toUpperCase() as ConversationType)
          : "GENERAL",
        caseId: body.case_id || null,
        messageText: body.message_text,
        attachments: body.attachments || [],
        isRead: false,
      },
    });
    
    return NextResponse.json({ data, success: true });
  } catch (error) {
    console.error("Error sending message:", error);
    
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }
    
    return NextResponse.json({ error: "Ошибка отправки сообщения" }, { status: 500 });
  }
}

// PUT - Отметить сообщения как прочитанные
export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    
    const { messageIds, conversationId } = body;
    
    const where: { receiverId: string; isRead: boolean; id?: { in: string[] }; conversationId?: string } = {
      receiverId: user.id,
      isRead: false,
    };
    
    if (messageIds && messageIds.length > 0) {
      where.id = { in: messageIds };
    } else if (conversationId) {
      where.conversationId = conversationId;
    }
    
    const data = await prisma.message.updateMany({
      where,
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
    
    return NextResponse.json({ success: true, updated: data.count });
  } catch (error) {
    console.error("Error updating messages:", error);
    
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }
    
    return NextResponse.json({ error: "Ошибка обновления сообщений" }, { status: 500 });
  }
}
