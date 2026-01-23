import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/auth";

// GET - Получить сообщения для беседы
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get("conversation_id");

    if (!conversationId) {
      return NextResponse.json(
        { error: "conversation_id обязателен" },
        { status: 400 }
      );
    }

    const data = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
      include: {
        sender: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error fetching messages:", error);
    
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
    }
    
    return NextResponse.json({ error: "Ошибка получения сообщений" }, { status: 500 });
  }
}

// POST - Отправить сообщение от админа
export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    const body = await request.json();

    const { conversation_id, message_text, receiver_id } = body;

    if (!conversation_id || !message_text) {
      return NextResponse.json(
        { error: "conversation_id и message_text обязательны" },
        { status: 400 }
      );
    }

    // Создаем сообщение от имени админа
    const data = await prisma.message.create({
      data: {
        conversationId: conversation_id,
        senderId: admin.id,
        receiverId: receiver_id || null,
        messageText: message_text.trim(),
        conversationType: "GENERAL",
        isRead: false,
      },
    });

    return NextResponse.json({ data, success: true });
  } catch (error) {
    console.error("Error sending message:", error);
    
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
    }
    
    return NextResponse.json({ error: "Ошибка отправки сообщения" }, { status: 500 });
  }
}
