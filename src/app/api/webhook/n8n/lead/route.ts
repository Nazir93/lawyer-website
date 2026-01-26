import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Секретный ключ для защиты webhook
const WEBHOOK_SECRET = process.env.N8N_WEBHOOK_SECRET || "your-secret-key";

// GET - n8n может проверить что webhook работает
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("x-webhook-secret");
  if (authHeader !== WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  return NextResponse.json({ 
    status: "ok", 
    message: "Lead webhook is ready",
    timestamp: new Date().toISOString()
  });
}

// POST - Получить заявку и вернуть данные для отправки в Telegram
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("x-webhook-secret");
    if (authHeader !== WEBHOOK_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Если это запрос на получение новых заявок
    if (body.action === "get_new_leads") {
      const leads = await prisma.lead.findMany({
        where: {
          status: "NEW",
        },
        orderBy: { createdAt: "desc" },
        take: body.limit || 10,
      });

      // Форматируем для Telegram
      const formattedLeads = leads.map((lead) => ({
        id: lead.id,
        telegram_message: formatLeadForTelegram(lead),
        raw: lead,
      }));

      return NextResponse.json({
        success: true,
        count: leads.length,
        leads: formattedLeads,
      });
    }

    // Если это обновление статуса заявки
    if (body.action === "update_status" && body.lead_id) {
      const updated = await prisma.lead.update({
        where: { id: body.lead_id },
        data: { 
          status: body.status || "PROCESSING",
          notes: body.notes,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Lead status updated",
        lead: updated,
      });
    }

    return NextResponse.json({ 
      error: "Unknown action. Use: get_new_leads, update_status" 
    }, { status: 400 });

  } catch (error) {
    console.error("Lead webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Форматирование заявки для Telegram
function formatLeadForTelegram(lead: any): string {
  const statusEmoji = {
    NEW: "🆕",
    PROCESSING: "⏳",
    COMPLETED: "✅",
    CANCELLED: "❌",
  };

  return `
${statusEmoji[lead.status as keyof typeof statusEmoji] || "📋"} *Новая заявка!*

👤 *Имя:* ${lead.name || "Не указано"}
📧 *Email:* ${lead.email || "Не указано"}
📱 *Телефон:* ${lead.phone || "Не указано"}
📝 *Тема:* ${lead.subject || "Общий вопрос"}

💬 *Сообщение:*
${lead.message || "Без сообщения"}

📅 *Дата:* ${new Date(lead.createdAt).toLocaleString("ru-RU")}
🔗 *ID:* \`${lead.id}\`
`.trim();
}

