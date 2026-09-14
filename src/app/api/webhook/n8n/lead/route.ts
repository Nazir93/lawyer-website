import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import type { LeadStatus } from "@prisma/client";

function requireWebhookSecret(request: NextRequest): NextResponse | null {
  const secret = process.env.N8N_WEBHOOK_SECRET;
  if (!secret || secret.length < 16) {
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 503 }
    );
  }
  const authHeader = request.headers.get("x-webhook-secret");
  if (authHeader !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

const ALLOWED_LEAD_STATUS: LeadStatus[] = [
  "NEW",
  "CONTACTED",
  "CONSULTATION",
  "DONE",
  "REJECTED",
];

export async function GET(request: NextRequest) {
  const denied = requireWebhookSecret(request);
  if (denied) return denied;

  return NextResponse.json({
    status: "ok",
    message: "Lead webhook is ready",
    timestamp: new Date().toISOString(),
  });
}

export async function POST(request: NextRequest) {
  try {
    const denied = requireWebhookSecret(request);
    if (denied) return denied;

    const body = await request.json();

    if (body.action === "get_new_leads") {
      const leads = await prisma.lead.findMany({
        where: { status: "NEW" },
        orderBy: { createdAt: "desc" },
        take: Math.min(Number(body.limit) || 10, 50),
      });

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

    if (body.action === "update_status" && body.lead_id) {
      const status = String(body.status || "CONTACTED").toUpperCase();
      if (!ALLOWED_LEAD_STATUS.includes(status as LeadStatus)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      }

      const updated = await prisma.lead.update({
        where: { id: body.lead_id },
        data: { status: status as LeadStatus },
      });

      return NextResponse.json({
        success: true,
        message: "Lead status updated",
        lead: updated,
      });
    }

    return NextResponse.json(
      { error: "Unknown action. Use: get_new_leads, update_status" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Lead webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function formatLeadForTelegram(lead: {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  message: string | null;
  service: string | null;
  status: string;
  createdAt: Date;
}): string {
  return `
📋 *Новая заявка!*

👤 *Имя:* ${lead.name || "Не указано"}
📧 *Email:* ${lead.email || "Не указано"}
📱 *Телефон:* ${lead.phone || "Не указано"}
📝 *Услуга:* ${lead.service || "—"}

💬 *Сообщение:*
${lead.message || "Без сообщения"}

📅 *Дата:* ${new Date(lead.createdAt).toLocaleString("ru-RU")}
🔗 *ID:* \`${lead.id}\`
`.trim();
}
