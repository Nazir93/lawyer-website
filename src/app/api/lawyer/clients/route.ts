import { NextRequest, NextResponse } from "next/server";
import { requireLawyer } from "@/lib/auth/auth";
import { prisma } from "@/lib/db";

/**
 * Список клиентов для выбора в договоре.
 * По умолчанию — только связанные (рефералы / прошлые договоры / лиды).
 * ?all=1 доступен только ADMIN.
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireLawyer();
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get("q") || "").trim();
    const wantAll = searchParams.get("all") === "1" && user.role === "ADMIN";

    let clientIds: string[] | null = null;

    if (!wantAll) {
      const profile = await prisma.lawyerProfile.findUnique({
        where: { userId: user.id },
        select: { id: true },
      });

      const [referrals, priorContracts, leads] = await Promise.all([
        prisma.user.findMany({
          where: { role: "CLIENT", referredById: user.id },
          select: { id: true },
        }),
        profile
          ? prisma.contract.findMany({
              where: { lawyerId: profile.id },
              select: { clientId: true },
              distinct: ["clientId"],
            })
          : Promise.resolve([]),
        profile
          ? prisma.lead.findMany({
              where: {
                lawyerId: profile.id,
                email: { not: null },
              },
              select: { email: true },
              take: 200,
            })
          : Promise.resolve([]),
      ]);

      const emails = [
        ...new Set(
          leads
            .map((l) => l.email)
            .filter((e): e is string => Boolean(e))
        ),
      ];

      const byLeadEmail =
        emails.length > 0
          ? await prisma.user.findMany({
              where: { role: "CLIENT", email: { in: emails } },
              select: { id: true },
            })
          : [];

      clientIds = [
        ...new Set([
          ...referrals.map((r) => r.id),
          ...priorContracts.map((c) => c.clientId),
          ...byLeadEmail.map((u) => u.id),
        ]),
      ];

      if (clientIds.length === 0) {
        return NextResponse.json({ items: [] });
      }
    }

    const clients = await prisma.user.findMany({
      where: {
        role: "CLIENT",
        ...(clientIds ? { id: { in: clientIds } } : {}),
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
