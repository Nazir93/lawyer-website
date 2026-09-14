import { NextRequest, NextResponse } from "next/server";
import { requirePlatformAdmin } from "@/lib/auth/auth";
import { prisma } from "@/lib/db";
import {
  DEFAULT_PLATFORM_FEES,
  validatePlatformFeeInput,
} from "@/lib/platform/fees";
import { getPlatformSettings } from "@/lib/platform/commission";

/** Настройки комиссий платформы */
export async function GET() {
  try {
    await requirePlatformAdmin();
    const settings = await getPlatformSettings();
    return NextResponse.json({ settings });
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

/** Обновление % платформы и рефералов */
export async function PATCH(request: NextRequest) {
  try {
    await requirePlatformAdmin();
    const body = await request.json();
    const current = await getPlatformSettings();
    const parsed = validatePlatformFeeInput(body, current);

    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const existing = await prisma.platformSettings.findFirst({
      orderBy: { createdAt: "asc" },
    });

    const settings = existing
      ? await prisma.platformSettings.update({
          where: { id: existing.id },
          data: parsed.value,
        })
      : await prisma.platformSettings.create({
          data: parsed.value ?? DEFAULT_PLATFORM_FEES,
        });

    return NextResponse.json({
      settings: {
        platformFeePercent: settings.platformFeePercent,
        referralLevel1Percent: settings.referralLevel1Percent,
        referralLevel2Percent: settings.referralLevel2Percent,
        maxReferralDepth: settings.maxReferralDepth,
        minContractAmount: settings.minContractAmount,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error";
    if (message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    console.error("platform settings patch error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
