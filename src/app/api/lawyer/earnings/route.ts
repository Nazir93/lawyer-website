import { NextResponse } from "next/server";
import { requireLawyer } from "@/lib/auth/auth";
import { prisma } from "@/lib/db";
import { formatRubFromKopecks } from "@/lib/platform/commission";

export async function GET() {
  try {
    const user = await requireLawyer();

    const items = await prisma.commission.findMany({
      where: { beneficiaryId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        contract: {
          select: {
            id: true,
            title: true,
            amount: true,
            status: true,
            paidAt: true,
          },
        },
      },
      take: 100,
    });

    const summary = await prisma.commission.groupBy({
      by: ["status"],
      where: { beneficiaryId: user.id },
      _sum: { amount: true },
      _count: true,
    });

    return NextResponse.json({
      items: items.map((c) => ({
        ...c,
        amountLabel: formatRubFromKopecks(c.amount),
        contractAmountLabel: formatRubFromKopecks(c.contract.amount),
      })),
      summary: summary.map((row) => ({
        status: row.status,
        count: row._count,
        amount: row._sum.amount || 0,
        amountLabel: formatRubFromKopecks(row._sum.amount || 0),
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
