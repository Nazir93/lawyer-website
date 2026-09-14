import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser, requirePlatformAdmin } from "@/lib/auth/auth";
import { authErrorResponse, publicSiteSettings } from "@/lib/auth/api-guard";

// GET - Публичные настройки; секреты только для ADMIN
export async function GET() {
  try {
    let data = await prisma.siteSettings.findFirst();

    if (!data) {
      data = await prisma.siteSettings.create({
        data: {},
      });
    }

    const user = await getCurrentUser();
    if (user?.role === "ADMIN") {
      return NextResponse.json({ data });
    }

    return NextResponse.json({
      data: publicSiteSettings(data as unknown as Record<string, unknown>),
    });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "Ошибка получения настроек" },
      { status: 500 }
    );
  }
}

// PUT - Только ADMIN
export async function PUT(request: NextRequest) {
  try {
    await requirePlatformAdmin();
    const body = await request.json();

    const existing = await prisma.siteSettings.findFirst();

    const payload = {
      lawyerName: body.lawyer_name,
      lawyerPosition: body.lawyer_position,
      lawyerBio: body.lawyer_bio,
      lawyerPhotoUrl: body.lawyer_photo_url,
      lawyerExperienceYears: body.lawyer_experience_years,
      phone: body.phone,
      email: body.email,
      address: body.address,
      whatsapp: body.whatsapp,
      telegram: body.telegram,
      vkUrl: body.vk_url,
      telegramChannelUrl: body.telegram_channel_url,
      siteTitle: body.site_title,
      siteDescription: body.site_description,
      telegramBotToken: body.telegram_bot_token,
      telegramChatId: body.telegram_chat_id,
      googleAnalyticsId: body.google_analytics_id,
      yandexMetrikaId: body.yandex_metrika_id,
    };

    const data = existing
      ? await prisma.siteSettings.update({
          where: { id: existing.id },
          data: payload,
        })
      : await prisma.siteSettings.create({ data: payload });

    return NextResponse.json({ data, success: true });
  } catch (error) {
    console.error("Error updating settings:", error);
    return (
      authErrorResponse(error) ||
      NextResponse.json({ error: "Ошибка сохранения настроек" }, { status: 500 })
    );
  }
}
