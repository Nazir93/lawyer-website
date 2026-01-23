import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/auth";

// GET - Получить все беседы с информацией о пользователях
export async function GET() {
  try {
    await requireAdmin();

    // Получаем все сообщения с группировкой по conversation_id
    const messages = await prisma.message.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        sender: {
          select: { id: true, name: true, email: true, role: true },
        },
        receiver: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });

    // Группируем по conversation_id
    const conversationsMap = new Map<string, {
      conversation_id: string;
      conversation_type: string;
      case_id: string | null;
      user_id: string | null;
      user_name: string | null;
      user_email: string | null;
      last_message: {
        message_text: string;
        created_at: Date;
        sender_id: string;
        is_read: boolean;
      } | null;
      unread_count: number;
      updated_at: Date;
    }>();

    for (const msg of messages) {
      if (!conversationsMap.has(msg.conversationId)) {
        // Определяем пользователя (не админа)
        const clientUser = msg.sender?.role !== "ADMIN" && msg.sender?.role !== "LAWYER"
          ? msg.sender
          : msg.receiver;

        conversationsMap.set(msg.conversationId, {
          conversation_id: msg.conversationId,
          conversation_type: msg.conversationType,
          case_id: msg.caseId,
          user_id: clientUser?.id || null,
          user_name: clientUser?.name || null,
          user_email: clientUser?.email || null,
          last_message: {
            message_text: msg.messageText,
            created_at: msg.createdAt,
            sender_id: msg.senderId,
            is_read: msg.isRead,
          },
          unread_count: 0,
          updated_at: msg.createdAt,
        });
      }

      const conv = conversationsMap.get(msg.conversationId);
      if (conv && !msg.isRead) {
        conv.unread_count++;
      }
    }

    const conversations = Array.from(conversationsMap.values());

    return NextResponse.json({ data: conversations });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
    }
    
    return NextResponse.json({ error: "Ошибка получения бесед" }, { status: 500 });
  }
}
