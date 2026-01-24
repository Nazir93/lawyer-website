import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET - Получить активные разделы для публичного сайта
export async function GET() {
  try {
    const sections = await prisma.section.findMany({
      where: { 
        isActive: true,
        parentId: null, // Только корневые разделы
      },
      include: {
        children: {
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
        },
      },
      orderBy: { sortOrder: "asc" },
    });

    // Преобразуем в формат для фронтенда
    const data = sections.map((section) => ({
      id: section.id,
      title: section.name, // title для совместимости с текущим кодом
      name: section.name,
      slug: section.slug,
      description: section.description,
      image_url: section.imageUrl,
      icon: section.icon,
      href: `/services/${section.slug}`,
      children: section.children.map((child) => ({
        id: child.id,
        title: child.name,
        name: child.name,
        slug: child.slug,
        href: `/services/${section.slug}/${child.slug}`,
      })),
    }));

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error fetching public sections:", error);
    // Возвращаем пустой массив при ошибке - фронтенд использует дефолтные значения
    return NextResponse.json({ data: [] });
  }
}

