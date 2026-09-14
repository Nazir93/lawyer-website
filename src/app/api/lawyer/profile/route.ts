import { NextRequest, NextResponse } from "next/server";
import { requireLawyer } from "@/lib/auth/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const user = await requireLawyer();
    const profile = await prisma.lawyerProfile.findUnique({
      where: { userId: user.id },
    });
    return NextResponse.json({ profile });
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

export async function PATCH(request: NextRequest) {
  try {
    const user = await requireLawyer();
    const body = await request.json();

    const profile = await prisma.lawyerProfile.findUnique({
      where: { userId: user.id },
    });

    if (!profile) {
      return NextResponse.json({ error: "Профиль не найден" }, { status: 404 });
    }

    const updated = await prisma.lawyerProfile.update({
      where: { id: profile.id },
      data: {
        displayName:
          typeof body.displayName === "string" && body.displayName.trim()
            ? body.displayName.trim()
            : undefined,
        bio: typeof body.bio === "string" ? body.bio : undefined,
        specialization:
          typeof body.specialization === "string"
            ? body.specialization.trim() || null
            : undefined,
        city:
          typeof body.city === "string" ? body.city.trim() || null : undefined,
        phone:
          typeof body.phone === "string" ? body.phone.trim() || null : undefined,
        barNumber:
          typeof body.barNumber === "string"
            ? body.barNumber.trim() || null
            : undefined,
      },
    });

    if (typeof body.displayName === "string" && body.displayName.trim()) {
      await prisma.user.update({
        where: { id: user.id },
        data: { name: body.displayName.trim() },
      });
    }

    return NextResponse.json({ profile: updated });
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
