import { NextRequest, NextResponse } from "next/server";
import { requireLawyer } from "@/lib/auth/auth";
import { authErrorResponse } from "@/lib/auth/api-guard";
import { prisma } from "@/lib/db";

/** Записи клиентов к текущему юристу */
export async function GET(request: NextRequest) {
  try {
    const user = await requireLawyer();
    const profile = await prisma.lawyerProfile.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });

    if (!profile && user.role !== "ADMIN") {
      return NextResponse.json({ items: [] });
    }

    const { searchParams } = new URL(request.url);
    const start = searchParams.get("start");
    const end = searchParams.get("end");

    const items = await prisma.appointment.findMany({
      where: {
        ...(user.role === "ADMIN" && !profile
          ? {}
          : { lawyerId: profile!.id }),
        ...(start && end
          ? {
              appointmentDate: {
                gte: new Date(start),
                lte: new Date(end),
              },
            }
          : {}),
      },
      orderBy: { appointmentDate: "asc" },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
      },
      take: 200,
    });

    return NextResponse.json({ items });
  } catch (error) {
    return (
      authErrorResponse(error) ||
      NextResponse.json({ error: "Server error" }, { status: 500 })
    );
  }
}
