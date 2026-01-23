import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { HeroContentType, VideoType, TextPosition } from "@prisma/client";

// GET - Получить hero контент
export async function GET() {
  try {
    const data = await prisma.heroSection.findFirst({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });
    
    return NextResponse.json({ data: data || null });
  } catch (error) {
    console.error("Error fetching hero:", error);
    // Возвращаем null вместо ошибки, чтобы компонент мог использовать дефолтные значения
    return NextResponse.json({ data: null });
  }
}

// PUT - Обновить hero контент
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log("Received hero data:", JSON.stringify(body, null, 2));
    
    // Получаем текущий hero
    const existing = await prisma.heroSection.findFirst();
    
    // Подготавливаем данные для сохранения
    const dataToSave = {
      contentType: (body.content_type?.toUpperCase() || "IMAGE") as HeroContentType,
      imageUrl: body.image_url || null,
      videoUrl: body.video_url || null,
      videoType: body.video_type ? (body.video_type.toUpperCase() as VideoType) : null,
      title: body.title || null,
      subtitle: body.subtitle || null,
      description: body.description || null,
      primaryButtonText: body.primary_button_text || null,
      primaryButtonLink: body.primary_button_link || null,
      secondaryButtonText: body.secondary_button_text || null,
      secondaryButtonLink: body.secondary_button_link || null,
      badgeText: body.badge_text || null,
      showBadge: body.show_badge ?? true,
      stats: body.stats || [],
      overlayOpacity: body.overlay_opacity ? parseFloat(String(body.overlay_opacity)) : 0.3,
      textPosition: (body.text_position?.toUpperCase() || "CENTER") as TextPosition,
      isActive: body.is_active ?? true,
      sortOrder: body.sort_order ? parseInt(String(body.sort_order)) : 0,
    };
    
    let data;
    
    if (existing) {
      // Обновляем
      data = await prisma.heroSection.update({
        where: { id: existing.id },
        data: dataToSave,
      });
    } else {
      // Создаём
      data = await prisma.heroSection.create({
        data: dataToSave,
      });
    }
    
    return NextResponse.json({ data, success: true });
  } catch (error) {
    console.error("Error updating hero:", error);
    const errorMessage = error instanceof Error ? error.message : "Ошибка сохранения hero контента";
    return NextResponse.json(
      { 
        error: errorMessage,
        code: "UNKNOWN",
      },
      { status: 500 }
    );
  }
}
