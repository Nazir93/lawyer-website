import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { requireLawyer } from "@/lib/auth/auth";
import { prisma } from "@/lib/db";
import {
  canLawyerAccessLead,
  parseLeadStatus,
  summarizeLeadStats,
} from "@/lib/platform/leads";

async function getOwnProfile(userId: string) {
  return prisma.lawyerProfile.findUnique({
    where: { userId },
    select: { id: true, status: true },
  });
}

/** Список заявок, привязанных к профилю юриста */
export async function GET(request: NextRequest) {
  try {
    const user = await requireLawyer();
    const profile = await getOwnProfile(user.id);
    if (!profile) {
      return NextResponse.json({ items: [], stats: summarizeLeadStats([]) });
    }

    const { searchParams } = new URL(request.url);
    const status = parseLeadStatus(searchParams.get("status"));
    const q = (searchParams.get("q") || "").trim();

    const where: Prisma.LeadWhereInput = {
      lawyerId: profile.id,
      ...(status ? { status } : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { phone: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const items = await prisma.lead.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    const allStatuses = await prisma.lead.findMany({
      where: { lawyerId: profile.id },
      select: { status: true },
    });

    return NextResponse.json({
      items,
      stats: summarizeLeadStats(allStatuses.map((l) => l.status)),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error";
    if (message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    console.error("lawyer leads GET error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

/** Смена статуса своей заявки */
export async function PATCH(request: NextRequest) {
  try {
    const user = await requireLawyer();
    const profile = await getOwnProfile(user.id);
    if (!profile) {
      return NextResponse.json(
        { error: "Профиль юриста не найден" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const id = typeof body.id === "string" ? body.id : null;
    const status = parseLeadStatus(body.status);

    if (!id || !status) {
      return NextResponse.json({ error: "Некорректные данные" }, { status: 400 });
    }

    const existing = await prisma.lead.findUnique({
      where: { id },
      select: { id: true, lawyerId: true },
    });

    if (!existing || !canLawyerAccessLead(existing.lawyerId, profile.id)) {
      return NextResponse.json({ error: "Заявка не найдена" }, { status: 404 });
    }

    const lead = await prisma.lead.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ lead });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error";
    if (message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    console.error("lawyer leads PATCH error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
