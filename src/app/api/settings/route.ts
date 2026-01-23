import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET - Получить настройки
export async function GET() {
  try {
    let data = await prisma.siteSettings.findFirst();
    
    // Если настроек нет, создаём дефолтные
    if (!data) {
      data = await prisma.siteSettings.create({
        data: {},
      });
    }
    
    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json({ error: "Ошибка получения настроек" }, { status: 500 });
  }
}

// PUT - Обновить настройки
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Получаем текущие настройки
    const existing = await prisma.siteSettings.findFirst();
    
    let data;
    
    if (existing) {
      // Обновляем
      data = await prisma.siteSettings.update({
        where: { id: existing.id },
        data: {
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
        },
      });
    } else {
      // Создаём
      data = await prisma.siteSettings.create({
        data: {
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
        },
      });
    }
    
    return NextResponse.json({ data, success: true });
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json({ error: "Ошибка сохранения настроек" }, { status: 500 });
  }
}
