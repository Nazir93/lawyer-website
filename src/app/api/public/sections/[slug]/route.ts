import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET - Получить раздел по slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const section = await prisma.section.findFirst({
      where: { 
        slug,
        isActive: true,
      },
      include: {
        children: {
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
        },
        services: {
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
          select: {
            id: true,
            title: true,
            slug: true,
            description: true,
            imageUrl: true,
            priceFrom: true,
            priceTo: true,
            priceText: true,
          },
        },
      },
    });

    if (!section) {
      return NextResponse.json(
        { error: "Раздел не найден" },
        { status: 404 }
      );
    }

    // Преобразуем в формат для фронтенда
    const data = {
      id: section.id,
      name: section.name,
      slug: section.slug,
      description: section.description,
      image_url: section.imageUrl,
      icon: section.icon,
      children: section.children.map((child) => ({
        id: child.id,
        name: child.name,
        slug: child.slug,
        description: child.description,
        image_url: child.imageUrl,
        icon: child.icon,
        href: `/services/${section.slug}/${child.slug}`,
      })),
      services: section.services.map((service) => ({
        id: service.id,
        title: service.title,
        slug: service.slug,
        description: service.description,
        image_url: service.imageUrl,
        price_from: service.priceFrom,
        price_to: service.priceTo,
        price_text: service.priceText,
        href: `/services/${service.slug}`,
      })),
    };

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error fetching section:", error);
    return NextResponse.json(
      { error: "Ошибка получения раздела" },
      { status: 500 }
    );
  }
}

