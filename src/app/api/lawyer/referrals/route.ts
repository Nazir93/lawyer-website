import { NextResponse } from "next/server";
import { requireLawyer } from "@/lib/auth/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const user = await requireLawyer();

    const [level1, level2] = await Promise.all([
      prisma.user.findMany({
        where: { referredById: user.id },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          referralCode: true,
          lawyerProfile: {
            select: { status: true, displayName: true, slug: true },
          },
          _count: { select: { referrals: true } },
        },
      }),
      prisma.user.findMany({
        where: { referredBy: { referredById: user.id } },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          referredBy: { select: { id: true, name: true } },
        },
        take: 100,
      }),
    ]);

    return NextResponse.json({
      level1,
      level2,
      totals: { level1: level1.length, level2: level2.length },
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
