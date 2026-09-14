import { NextRequest, NextResponse } from "next/server";
import { requirePlatformAdmin } from "@/lib/auth/auth";
import { prisma } from "@/lib/db";
import { formatRubFromKopecks } from "@/lib/platform/commission";

/** Список начислений платформы */
export async function GET(request: NextRequest) {
  try {
    await requirePlatformAdmin();
    const status = request.nextUrl.searchParams.get("status");

    const items = await prisma.commission.findMany({
      where:
        status && ["PENDING", "APPROVED", "PAID", "CANCELLED"].includes(status)
          ? { status: status as "PENDING" | "APPROVED" | "PAID" | "CANCELLED" }
          : undefined,
      orderBy: { createdAt: "desc" },
      include: {
        beneficiary: {
          select: { id: true, name: true, email: true, role: true },
        },
        contract: {
          select: {
            id: true,
            title: true,
            amount: true,
            status: true,
            lawyer: { select: { displayName: true } },
            client: { select: { name: true, email: true } },
          },
        },
      },
      take: 200,
    });

    return NextResponse.json({
      items: items.map((c) => ({
        ...c,
        amountLabel: formatRubFromKopecks(c.amount),
        contractAmountLabel: formatRubFromKopecks(c.contract.amount),
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

/** PATCH { id, action: "approve" | "mark_paid" | "cancel" } */
export async function PATCH(request: NextRequest) {
  try {
    await requirePlatformAdmin();
    const body = await request.json();
    const { id, action } = body;

    if (
      !id ||
      !["approve", "mark_paid", "cancel"].includes(action)
    ) {
      return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
    }

    const commission = await prisma.commission.findUnique({ where: { id } });
    if (!commission) {
      return NextResponse.json({ error: "Начисление не найдено" }, { status: 404 });
    }

    if (action === "cancel") {
      if (commission.status === "PAID") {
        return NextResponse.json(
          { error: "Нельзя отменить уже выплаченное" },
          { status: 400 }
        );
      }
      const updated = await prisma.commission.update({
        where: { id },
        data: { status: "CANCELLED" },
      });
      return NextResponse.json({ commission: updated });
    }

    if (action === "approve") {
      if (commission.status !== "PENDING") {
        return NextResponse.json(
          { error: "Одобрить можно только PENDING" },
          { status: 400 }
        );
      }
      const updated = await prisma.commission.update({
        where: { id },
        data: { status: "APPROVED" },
      });
      return NextResponse.json({ commission: updated });
    }

    // mark_paid
    if (commission.status !== "PENDING" && commission.status !== "APPROVED") {
      return NextResponse.json(
        { error: "Выплатить можно PENDING или APPROVED" },
        { status: 400 }
      );
    }

    const updated = await prisma.commission.update({
      where: { id },
      data: {
        status: "PAID",
        paidAt: new Date(),
      },
    });

    return NextResponse.json({ commission: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error";
    if (message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    console.error("admin commissions patch error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
