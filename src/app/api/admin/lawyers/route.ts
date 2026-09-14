import { NextRequest, NextResponse } from "next/server";
import { requirePlatformAdmin } from "@/lib/auth/auth";
import { prisma } from "@/lib/db";
import {
  buildModerationNotification,
  deliverModerationNotification,
  type LawyerStatus,
} from "@/lib/platform/moderation";

/** Список юристов (модерация) */
export async function GET() {
  try {
    await requirePlatformAdmin();

    const items = await prisma.lawyerProfile.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            referralCode: true,
            referredById: true,
            createdAt: true,
          },
        },
      },
    });

    return NextResponse.json({ items });
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

/** Смена статуса + уведомление юристу */
export async function PATCH(request: NextRequest) {
  try {
    await requirePlatformAdmin();
    const body = await request.json();
    const { id, status } = body;

    if (
      !id ||
      !["PENDING", "ACTIVE", "SUSPENDED", "REJECTED"].includes(status)
    ) {
      return NextResponse.json({ error: "Некорректные данные" }, { status: 400 });
    }

    const existing = await prisma.lawyerProfile.findUnique({
      where: { id },
      include: { user: { select: { email: true, name: true } } },
    });

    if (!existing) {
      return NextResponse.json({ error: "Профиль не найден" }, { status: 404 });
    }

    const profile = await prisma.lawyerProfile.update({
      where: { id },
      data: {
        status,
        verifiedAt: status === "ACTIVE" ? new Date() : null,
      },
    });

    const notification = buildModerationNotification({
      lawyerId: profile.id,
      displayName: profile.displayName || existing.user.name || "Юрист",
      email: existing.user.email,
      previousStatus: existing.status as LawyerStatus,
      nextStatus: status as LawyerStatus,
    });

    const delivery = await deliverModerationNotification(notification);

    return NextResponse.json({ profile, notification, delivery });
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
