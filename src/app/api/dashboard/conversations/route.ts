import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth/auth";

// GET - Получить список бесед пользователя
export async function GET() {
  try {
    const user = await requireAuth();
    
    // Получаем последние сообщения для каждой беседы
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: user.id },
          { receiverId: user.id },
        ],
      },
      orderBy: { createdAt: "desc" },
      include: {
        sender: {
          select: { id: true, name: true, email: true },
        },
        receiver: {
          select: { id: true, name: true, email: true },
        },
      },
    });
    
    // Группируем по conversation_id и берем последнее сообщение
    const conversationsMap = new Map<string, {
      conversation_id: string;
      conversation_type: string;
      case_id: string | null;
      last_message: string;
      last_message_time: Date;
      unread_count: number;
      participant: {
        id: string | null;
        name: string;
        email: string | null;
      };
    }>();
    
    for (const msg of messages) {
      if (!conversationsMap.has(msg.conversationId)) {
        // Определяем собеседника
        const otherUser = msg.senderId === user.id ? msg.receiver : msg.sender;
        
        conversationsMap.set(msg.conversationId, {
          conversation_id: msg.conversationId,
          conversation_type: msg.conversationType,
          case_id: msg.caseId,
          last_message: msg.messageText,
          last_message_time: msg.createdAt,
          unread_count: 0,
          participant: {
            id: otherUser?.id || null,
            name: otherUser?.name || "Адвокат",
            email: otherUser?.email || null,
          },
        });
      }
      
      const conv = conversationsMap.get(msg.conversationId);
      if (conv && !msg.isRead && msg.receiverId === user.id) {
        conv.unread_count++;
      }
    }
    
    const conversations = Array.from(conversationsMap.values());
    
    return NextResponse.json({ data: conversations, count: conversations.length });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }
    
    return NextResponse.json({ error: "Ошибка получения бесед" }, { status: 500 });
  }
}
