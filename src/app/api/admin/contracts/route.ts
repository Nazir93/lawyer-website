import { NextRequest, NextResponse } from "next/server";
import { requirePlatformAdmin } from "@/lib/auth/auth";
import { authErrorResponse } from "@/lib/auth/api-guard";
import { prisma } from "@/lib/db";
import { accrueCommissionsForContract } from "@/lib/platform/commission";
import { formatRubFromKopecks } from "@/lib/platform/money";

/** Список оплаченных договоров без начисленных комиссий */
export async function GET() {
  try {
    await requirePlatformAdmin();

    const items = await prisma.contract.findMany({
      where: {
        status: "PAID",
        commissions: { none: {} },
      },
      orderBy: { paidAt: "desc" },
      include: {
        client: { select: { id: true, name: true, email: true } },
        lawyer: { select: { id: true, displayName: true } },
        payments: {
          select: { provider: true, status: true, paidAt: true },
          take: 3,
          orderBy: { createdAt: "desc" },
        },
      },
      take: 100,
    });

    return NextResponse.json({
      items: items.map((c) => ({
        ...c,
        amountLabel: formatRubFromKopecks(c.amount),
      })),
    });
  } catch (error) {
    return (
      authErrorResponse(error) ||
      NextResponse.json({ error: "Server error" }, { status: 500 })
    );
  }
}

/** PATCH { id, action: "accrue" } — начислить комиссии после ручной оплаты */
export async function PATCH(request: NextRequest) {
  try {
    await requirePlatformAdmin();
    const body = await request.json();
    const { id, action } = body;

    if (!id || action !== "accrue") {
      return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
    }

    const contract = await prisma.contract.findUnique({ where: { id } });
    if (!contract) {
      return NextResponse.json({ error: "Договор не найден" }, { status: 404 });
    }
    if (contract.status !== "PAID") {
      return NextResponse.json(
        { error: "Комиссии только для оплаченных договоров" },
        { status: 400 }
      );
    }

    const commissions = await accrueCommissionsForContract(id);
    return NextResponse.json({ commissions });
  } catch (error) {
    console.error("admin contract accrue error:", error);
    return (
      authErrorResponse(error) ||
      NextResponse.json({ error: "Server error" }, { status: 500 })
    );
  }
}
