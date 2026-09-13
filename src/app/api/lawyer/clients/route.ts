import { NextRequest, NextResponse } from "next/server";
import { requireLawyer } from "@/lib/auth/auth";
import { prisma } from "@/lib/db";

/**
 * Список клиентов для выбора в договоре.
 * ?q= поиск · ?mine=1 только свои рефералы
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireLawyer();
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get("q") || "").trim();
    const mineOnly = searchParams.get("mine") === "1";

    const clients = await prisma.user.findMany({
      where: {
        role: "CLIENT",
        ...(mineOnly ? { referredById: user.id } : {}),
        ...(q
          ? {
              OR: [
                { name: { contains: q, mode: "insensitive" } },
                { email: { contains: q, mode: "insensitive" } },
                { phone: { contains: q, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        referredById: true,
        createdAt: true,
      },
      take: 50,
    });

    return NextResponse.json({
      items: clients.map((c) => ({
        ...c,
        isReferral: c.referredById === user.id,
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
