import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth/auth";
import { randomUUID } from "crypto";

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

// POST - Создать новую беседу с адвокатом
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { conversation_type = "GENERAL", case_id = null } = body;
    
    // Преобразуем тип в верхний регистр для enum
    const convType = conversation_type.toUpperCase() as "GENERAL" | "CASE" | "SUPPORT";
    
    // Находим адвоката/админа
    const lawyer = await prisma.user.findFirst({
      where: {
        role: { in: ["ADMIN", "LAWYER"] },
      },
      orderBy: { createdAt: "asc" },
    });
    
    if (!lawyer) {
      return NextResponse.json({ error: "Адвокат не найден" }, { status: 404 });
    }
    
    // Проверяем, есть ли уже активная беседа
    const existingConversation = await prisma.message.findFirst({
      where: {
        OR: [
          { senderId: user.id, receiverId: lawyer.id },
          { senderId: lawyer.id, receiverId: user.id },
        ],
        conversationType: convType,
        ...(case_id ? { caseId: case_id } : {}),
      },
      orderBy: { createdAt: "desc" },
    });
    
    if (existingConversation) {
      // Возвращаем существующую беседу
      return NextResponse.json({
        data: {
          conversation_id: existingConversation.conversationId,
          conversation_type: existingConversation.conversationType,
          case_id: existingConversation.caseId,
          last_message: existingConversation.messageText,
          last_message_time: existingConversation.createdAt,
          unread_count: 0,
          participant: {
            id: lawyer.id,
            name: lawyer.name || "Адвокат",
            email: lawyer.email,
          },
        },
      });
    }
    
    // Создаем новую беседу (через первое сообщение)
    const conversationId = randomUUID();
    
    // Создаем приветственное сообщение от системы
    const welcomeMessage = await prisma.message.create({
      data: {
        conversationId,
        senderId: lawyer.id,
        receiverId: user.id,
        messageText: "Здравствуйте! Чем могу помочь?",
        conversationType: convType,
        caseId: case_id,
        isRead: false,
      },
    });
    
    return NextResponse.json({
      data: {
        conversation_id: conversationId,
        conversation_type: convType,
        case_id: case_id,
        last_message: welcomeMessage.messageText,
        last_message_time: welcomeMessage.createdAt,
        unread_count: 1,
        participant: {
          id: lawyer.id,
          name: lawyer.name || "Адвокат",
          email: lawyer.email,
        },
      },
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating conversation:", error);
    
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }
    
    return NextResponse.json({ error: "Ошибка создания беседы" }, { status: 500 });
  }
}
