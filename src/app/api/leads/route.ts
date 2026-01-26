import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { LeadStatus, Prisma } from "@prisma/client";

// URL n8n webhook для обработки заявок
const N8N_LEAD_WEBHOOK = process.env.N8N_LEAD_WEBHOOK_URL;

// Функция отправки в Telegram
async function sendTelegramNotification(lead: {
  name: string;
  phone: string;
  email?: string | null;
  service?: string | null;
  message?: string | null;
}, settings: { telegramBotToken?: string | null; telegramChatId?: string | null } | null) {
  const botToken = settings?.telegramBotToken || process.env.TELEGRAM_BOT_TOKEN;
  const chatId = settings?.telegramChatId || process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.log("Telegram not configured, skipping notification");
    return;
  }

  const message = `
🔔 <b>Новая заявка с сайта!</b>

👤 <b>Имя:</b> ${lead.name}
📞 <b>Телефон:</b> ${lead.phone}
${lead.email ? `📧 <b>Email:</b> ${lead.email}` : ""}
${lead.service ? `📋 <b>Услуга:</b> ${lead.service}` : ""}
${lead.message ? `\n💬 <b>Сообщение:</b>\n${lead.message}` : ""}

📅 ${new Date().toLocaleString("ru-RU", { timeZone: "Europe/Moscow" })}
  `.trim();

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: "HTML",
        }),
      }
    );

    if (!response.ok) {
      console.error("Telegram API error:", await response.text());
    }
  } catch (error) {
    console.error("Error sending Telegram notification:", error);
  }
}

// Отправка заявки в n8n для дополнительной обработки
async function sendToN8n(lead: any) {
  if (!N8N_LEAD_WEBHOOK) {
    console.log("n8n webhook not configured, skipping");
    return;
  }

  try {
    const response = await fetch(N8N_LEAD_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "new_lead",
        timestamp: new Date().toISOString(),
        lead: {
          id: lead.id,
          name: lead.name,
          phone: lead.phone,
          email: lead.email,
          service: lead.service,
          message: lead.message,
          source: lead.source,
          created_at: lead.createdAt,
        },
      }),
    });

    if (!response.ok) {
      console.error("n8n webhook error:", await response.text());
    } else {
      console.log("Lead sent to n8n successfully");
    }
  } catch (error) {
    console.error("Error sending to n8n:", error);
  }
}

// GET - Получить все заявки (для админки)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const status = searchParams.get("status");
    const limit = searchParams.get("limit");
    
    const where: Prisma.LeadWhereInput = {};
    
    if (status && status !== "all") {
      where.status = status.toUpperCase() as LeadStatus;
    }
    
    const data = await prisma.lead.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit ? parseInt(limit) : undefined,
    });
    
    return NextResponse.json({ data, count: data.length });
  } catch (error) {
    console.error("Error fetching leads:", error);
    return NextResponse.json({ error: "Ошибка получения данных" }, { status: 500 });
  }
}

// POST - Создать заявку (публичный)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Валидация
    if (!body.name || !body.phone) {
      return NextResponse.json(
        { error: "Имя и телефон обязательны" },
        { status: 400 }
      );
    }

    // Создаём заявку
    const data = await prisma.lead.create({
      data: {
        name: body.name,
        phone: body.phone,
        email: body.email,
        service: body.service,
        message: body.message,
        status: "NEW",
        source: body.source || "website",
        utmSource: body.utm_source,
        utmMedium: body.utm_medium,
        utmCampaign: body.utm_campaign,
        consentGiven: body.consent || false,
        consentDate: new Date(),
      },
    });

    // Получаем настройки для Telegram
    const settings = await prisma.siteSettings.findFirst({
      select: {
        telegramBotToken: true,
        telegramChatId: true,
      },
    });

    // Отправляем уведомление в Telegram
    await sendTelegramNotification(data, settings);

    // Отправляем в n8n webhook для дополнительной обработки
    await sendToN8n(data);

    return NextResponse.json({ success: true, id: data.id });
  } catch (error) {
    console.error("Error creating lead:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
