import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { LeadStatus, Prisma } from "@prisma/client";
import {
  buildLeadCreateData,
  normalizeLawyerQueryParam,
} from "@/lib/platform/leads";
import {
  buildLeadAssignedNotification,
  deliverLeadAssignedNotification,
} from "@/lib/platform/lead-notify";
import { requirePlatformAdmin } from "@/lib/auth/auth";
import { authErrorResponse } from "@/lib/auth/api-guard";
import {
  checkRateLimit,
  clientIpFromRequest,
} from "@/lib/security/rate-limit";

const N8N_LEAD_WEBHOOK = process.env.N8N_LEAD_WEBHOOK_URL;

async function sendTelegramNotification(
  lead: {
    name: string;
    phone: string;
    email?: string | null;
    service?: string | null;
    message?: string | null;
    lawyerId?: string | null;
  },
  settings: { telegramBotToken?: string | null; telegramChatId?: string | null } | null,
  lawyerName?: string | null
) {
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
${lawyerName ? `⚖️ <b>Юрист:</b> ${lawyerName}` : ""}
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

async function sendToN8n(lead: {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  service: string | null;
  message: string | null;
  source: string;
  createdAt: Date;
  lawyerId: string | null;
}) {
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
          lawyer_id: lead.lawyerId,
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

export async function GET(request: NextRequest) {
  try {
    await requirePlatformAdmin();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const limit = searchParams.get("limit");
    const lawyerId = searchParams.get("lawyerId");

    const where: Prisma.LeadWhereInput = {};

    if (status && status !== "all") {
      where.status = status.toUpperCase() as LeadStatus;
    }
    if (lawyerId) {
      where.lawyerId = lawyerId;
    }

    const data = await prisma.lead.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit ? parseInt(limit) : undefined,
      include: {
        lawyer: { select: { id: true, displayName: true, slug: true } },
      },
    });

    return NextResponse.json({ data, count: data.length });
  } catch (error) {
    console.error("Error fetching leads:", error);
    return (
      authErrorResponse(error) ||
      NextResponse.json({ error: "Ошибка получения данных" }, { status: 500 })
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const ip = clientIpFromRequest(request);
    const limited = checkRateLimit({
      key: `leads:ip:${ip}`,
      limit: 10,
      windowMs: 15 * 60 * 1000,
    });
    if (!limited.allowed) {
      return NextResponse.json(
        { error: "Слишком много заявок. Попробуйте позже" },
        { status: 429 }
      );
    }

    const body = await request.json();

    if (!body.name || !body.phone) {
      return NextResponse.json(
        { error: "Имя и телефон обязательны" },
        { status: 400 }
      );
    }

    let lawyerId: string | null = null;
    let lawyerName: string | null = null;
    let lawyerEmail: string | null = null;
    const slug = normalizeLawyerQueryParam(body.lawyerSlug || body.lawyer);

    if (slug) {
      const lawyer = await prisma.lawyerProfile.findFirst({
        where: { slug, status: "ACTIVE" },
        select: { id: true, displayName: true, user: { select: { email: true } } },
      });
      if (lawyer) {
        lawyerId = lawyer.id;
        lawyerName = lawyer.displayName;
        lawyerEmail = lawyer.user?.email ?? null;
      }
    } else if (typeof body.lawyerId === "string" && body.lawyerId) {
      const lawyer = await prisma.lawyerProfile.findFirst({
        where: { id: body.lawyerId, status: "ACTIVE" },
        select: { id: true, displayName: true, user: { select: { email: true } } },
      });
      if (lawyer) {
        lawyerId = lawyer.id;
        lawyerName = lawyer.displayName;
        lawyerEmail = lawyer.user?.email ?? null;
      }
    }

    const createData = buildLeadCreateData({
      name: body.name,
      phone: body.phone,
      email: body.email,
      service: body.service,
      message: body.message,
      consent: body.consent,
      lawyerId,
      source: body.source,
      utmSource: body.utm_source,
      utmMedium: body.utm_medium,
      utmCampaign: body.utm_campaign,
    });

    const data = await prisma.lead.create({ data: createData });

    const settings = await prisma.siteSettings.findFirst({
      select: {
        telegramBotToken: true,
        telegramChatId: true,
      },
    });


    if (lawyerId) {
      const note = buildLeadAssignedNotification({
        lawyerDisplayName: lawyerName || "Юрист",
        lawyerEmail,
        lead: {
          id: data.id,
          name: data.name,
          phone: data.phone,
          email: data.email,
          service: data.service,
          message: data.message,
        },
      });
      await deliverLeadAssignedNotification(note);
    }

    await sendTelegramNotification(data, settings, lawyerName);
    await sendToN8n(data);

    return NextResponse.json({
      success: true,
      id: data.id,
      lawyerId: data.lawyerId,
    });
  } catch (error) {
    console.error("Error creating lead:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
