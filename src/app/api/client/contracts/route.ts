import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db";
import { formatRubFromKopecks } from "@/lib/platform/commission";
import {
  canClientTransition,
  isClientContractAction,
  markContractPaid,
} from "@/lib/platform/contracts";

/** Договоры текущего клиента */
export async function GET() {
  try {
    const user = await requireAuth();

    const contracts = await prisma.contract.findMany({
      where: { clientId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        lawyer: {
          select: {
            id: true,
            displayName: true,
            slug: true,
            specialization: true,
          },
        },
        payments: {
          select: { id: true, status: true, provider: true, paidAt: true },
          orderBy: { createdAt: "desc" },
          take: 3,
        },
      },
      take: 100,
    });

    return NextResponse.json({
      items: contracts.map((c) => ({
        ...c,
        amountLabel: formatRubFromKopecks(c.amount),
        amountRub: c.amount / 100,
      })),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error";
    if (message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

/** PATCH { id, action: "sign" | "confirm_paid" } */
export async function PATCH(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { id, action } = body;

    if (!id || typeof action !== "string" || !isClientContractAction(action)) {
      return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
    }

    const contract = await prisma.contract.findUnique({ where: { id } });
    if (!contract || contract.clientId !== user.id) {
      return NextResponse.json({ error: "Договор не найден" }, { status: 404 });
    }

    if (!canClientTransition(contract.status, action)) {
      return NextResponse.json(
        {
          error: `Действие «${action}» недоступно для статуса ${contract.status}`,
        },
        { status: 400 }
      );
    }

    if (action === "sign") {
      const updated = await prisma.contract.update({
        where: { id },
        data: {
          status: "SIGNED",
          signedAt: new Date(),
        },
      });
      return NextResponse.json({ contract: updated });
    }

    const result = await markContractPaid({
      contractId: id,
      provider: "manual_client",
      accrueCommissions: false,
    });

    return NextResponse.json({
      contract: result.contract,
      commissions: result.commissions,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error";
    if (message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (message === "Cannot pay cancelled or refunded contract") {
      return NextResponse.json({ error: message }, { status: 400 });
    }
    console.error("client contract patch error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
