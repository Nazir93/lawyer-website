import { NextRequest, NextResponse } from "next/server";
import { requireLawyer } from "@/lib/auth/auth";
import { prisma } from "@/lib/db";
import {
  accrueCommissionsForContract,
  formatRubFromKopecks,
} from "@/lib/platform/commission";

export async function GET() {
  try {
    const user = await requireLawyer();

    const profile = await prisma.lawyerProfile.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });

    if (!profile) {
      return NextResponse.json({ items: [] });
    }

    const contracts = await prisma.contract.findMany({
      where: { lawyerId: profile.id },
      orderBy: { createdAt: "desc" },
      include: {
        client: { select: { id: true, name: true, email: true } },
        commissions: {
          select: { id: true, type: true, amount: true, status: true },
        },
      },
      take: 100,
    });

    return NextResponse.json({
      items: contracts.map((c) => ({
        ...c,
        amountLabel: formatRubFromKopecks(c.amount),
      })),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error";
    if (message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

/** POST { title, amountRub, clientId, caseId?, description? } */
export async function POST(request: NextRequest) {
  try {
    const user = await requireLawyer();
    const body = await request.json();

    const profile = await prisma.lawyerProfile.findUnique({
      where: { userId: user.id },
    });

    if (!profile) {
      return NextResponse.json(
        { error: "Профиль юриста не найден" },
        { status: 404 }
      );
    }

    if (profile.status !== "ACTIVE" && user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Профиль ещё не активирован модератором" },
        { status: 403 }
      );
    }

    const { title, amountRub, clientId, caseId, description } = body;

    if (!title || typeof title !== "string" || !title.trim()) {
      return NextResponse.json(
        { error: "Укажите название договора" },
        { status: 400 }
      );
    }

    const amount = Math.round(Number(amountRub) * 100);
    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: "Некорректная сумма" }, { status: 400 });
    }

    if (!clientId || typeof clientId !== "string") {
      return NextResponse.json({ error: "Укажите клиента" }, { status: 400 });
    }

    const client = await prisma.user.findUnique({
      where: { id: clientId },
      select: { id: true, referredById: true },
    });

    if (!client) {
      return NextResponse.json({ error: "Клиент не найден" }, { status: 404 });
    }

    const contract = await prisma.contract.create({
      data: {
        title: title.trim(),
        description:
          typeof description === "string" ? description.trim() || null : null,
        amount,
        clientId: client.id,
        lawyerId: profile.id,
        caseId: typeof caseId === "string" ? caseId : null,
        referredById: client.referredById,
        status: "DRAFT",
      },
    });

    return NextResponse.json({ contract }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error";
    if (message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    console.error("create contract error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

/** PATCH { id, action: "mark_paid" } */
export async function PATCH(request: NextRequest) {
  try {
    const user = await requireLawyer();
    const body = await request.json();
    const { id, action } = body;

    if (!id || action !== "mark_paid") {
      return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
    }

    const profile = await prisma.lawyerProfile.findUnique({
      where: { userId: user.id },
    });

    const contract = await prisma.contract.findUnique({ where: { id } });
    if (!contract) {
      return NextResponse.json({ error: "Договор не найден" }, { status: 404 });
    }

    if (
      user.role !== "ADMIN" &&
      (!profile || contract.lawyerId !== profile.id)
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updated = await prisma.contract.update({
      where: { id },
      data: {
        status: "PAID",
        paidAt: new Date(),
        signedAt: contract.signedAt ?? new Date(),
      },
    });

    await prisma.payment.create({
      data: {
        contractId: id,
        amount: contract.amount,
        status: "SUCCEEDED",
        provider: "manual",
        paidAt: new Date(),
      },
    });

    const commissions = await accrueCommissionsForContract(id);

    return NextResponse.json({ contract: updated, commissions });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error";
    if (message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    console.error("patch contract error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
