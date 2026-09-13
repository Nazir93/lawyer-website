import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { toPublicLawyer } from "@/lib/platform/fees";

/** Публичный профиль юриста по slug */
export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;
    if (!slug) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const profile = await prisma.lawyerProfile.findUnique({
      where: { slug },
    });

    const lawyer = profile ? toPublicLawyer(profile) : null;
    if (!lawyer) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ lawyer });
  } catch (error) {
    console.error("public lawyer detail error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
