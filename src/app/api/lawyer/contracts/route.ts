import { NextRequest, NextResponse } from "next/server";
import { requireLawyer } from "@/lib/auth/auth";
import { prisma } from "@/lib/db";
import { formatRubFromKopecks } from "@/lib/platform/commission";
import {
  canLawyerTransition,
  isLawyerContractAction,
  markContractPaid,
  nextStatusForLawyerAction,
} from "@/lib/platform/contracts";
import {
  buildContractSentNotification,
  deliverContractSentNotification,
} from "@/lib/platform/contract-notify";

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
      select: { id: true, referredById: true, role: true, email: true },
    });

    if (!client || client.role !== "CLIENT") {
      return NextResponse.json({ error: "Клиент не найден" }, { status: 404 });
    }

    // Юрист — только свои рефералы / прошлые договоры / лиды; ADMIN — любой CLIENT
    if (user.role !== "ADMIN") {
      const isReferral = client.referredById === user.id;
      const priorContract = await prisma.contract.findFirst({
        where: { clientId: client.id, lawyerId: profile.id },
        select: { id: true },
      });
      const priorLead = client.email
        ? await prisma.lead.findFirst({
            where: { lawyerId: profile.id, email: client.email },
            select: { id: true },
          })
        : null;

      if (!isReferral && !priorContract && !priorLead) {
        return NextResponse.json(
          {
            error:
              "Клиент не связан с вами. Доступны рефералы, прошлые договоры или ваши лиды.",
          },
          { status: 403 }
        );
      }
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

/** PATCH { id, action: "send" | "mark_paid" | "cancel" } */
export async function PATCH(request: NextRequest) {
  try {
    const user = await requireLawyer();
    const body = await request.json();
    const { id, action } = body;

    if (!id || typeof action !== "string" || !isLawyerContractAction(action)) {
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

    if (!canLawyerTransition(contract.status, action)) {
      return NextResponse.json(
        {
          error: `Действие «${action}» недоступно для статуса ${contract.status}`,
        },
        { status: 400 }
      );
    }

    if (action === "mark_paid") {
      const result = await markContractPaid({
        contractId: id,
        provider: "manual",
        accrueCommissions: false,
      });
      return NextResponse.json({
        contract: result.contract,
        commissions: result.commissions,
      });
    }

    const nextStatus = nextStatusForLawyerAction(action);
    const updated = await prisma.contract.update({
      where: { id },
      data: { status: nextStatus },
    });

    if (action === "send") {
      const [client, lawyer] = await Promise.all([
        prisma.user.findUnique({
          where: { id: contract.clientId },
          select: { name: true, email: true },
        }),
        prisma.lawyerProfile.findUnique({
          where: { id: contract.lawyerId },
          select: { displayName: true },
        }),
      ]);

      const notification = buildContractSentNotification({
        clientName: client?.name ?? null,
        clientEmail: client?.email ?? null,
        lawyerDisplayName: lawyer?.displayName || "Юрист",
        contract: {
          id: updated.id,
          title: updated.title,
          amountKopecks: updated.amount,
        },
      });

      await deliverContractSentNotification(notification);
    }

    return NextResponse.json({ contract: updated });
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
