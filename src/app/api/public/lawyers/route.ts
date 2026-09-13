import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { toPublicLawyer } from "@/lib/platform/fees";

/** Публичный список активных юристов */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get("q") || "").trim();
    const city = (searchParams.get("city") || "").trim();

    const profiles = await prisma.lawyerProfile.findMany({
      where: {
        status: "ACTIVE",
        ...(q
          ? {
              OR: [
                { displayName: { contains: q, mode: "insensitive" } },
                { specialization: { contains: q, mode: "insensitive" } },
                { bio: { contains: q, mode: "insensitive" } },
              ],
            }
          : {}),
        ...(city
          ? { city: { contains: city, mode: "insensitive" } }
          : {}),
      },
      orderBy: [{ verifiedAt: "desc" }, { createdAt: "desc" }],
      take: 100,
    });

    const items = profiles
      .map((p) => toPublicLawyer(p))
      .filter((p): p is NonNullable<typeof p> => p !== null);

    return NextResponse.json({ items });
  } catch (error) {
    console.error("public lawyers list error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
