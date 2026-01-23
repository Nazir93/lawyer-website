import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ServiceGroup, Prisma } from "@prisma/client";

// GET - Получить все услуги
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const group = searchParams.get("group"); // individual, business, special
    const active = searchParams.get("active"); // true/false
    const search = searchParams.get("search"); // поисковый запрос
    const limit = searchParams.get("limit"); // лимит результатов
    
    const where: Prisma.ServiceWhereInput = {};
    
    if (group) {
      where.serviceGroup = group.toUpperCase() as ServiceGroup;
    }
    
    if (active === "true") {
      where.isActive = true;
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }
    
    const data = await prisma.service.findMany({
      where,
      orderBy: { sortOrder: "asc" },
      take: limit ? parseInt(limit) : undefined,
    });
    
    return NextResponse.json({ data, count: data.length });
  } catch (error) {
    console.error("Error fetching services:", error);
    return NextResponse.json({ error: "Ошибка получения данных" }, { status: 500 });
  }
}

// POST - Создать услугу
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Валидация
    if (!body.title || !body.slug) {
      return NextResponse.json(
        { error: "Название и slug обязательны" },
        { status: 400 }
      );
    }
    
    const data = await prisma.service.create({
      data: {
        title: body.title,
        slug: body.slug,
        description: body.description,
        content: body.content,
        imageUrl: body.image_url,
        icon: body.icon,
        categoryId: body.category_id,
        serviceGroup: (body.service_group?.toUpperCase() || "INDIVIDUAL") as ServiceGroup,
        priceFrom: body.price_from,
        priceTo: body.price_to,
        priceText: body.price_text,
        metaTitle: body.meta_title,
        metaDescription: body.meta_description,
        sortOrder: body.sort_order || 0,
        isActive: body.is_active ?? true,
      },
    });
    
    return NextResponse.json({ data, success: true });
  } catch (error: unknown) {
    console.error("Error creating service:", error);
    
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "Услуга с таким URL уже существует" }, { status: 400 });
    }
    
    return NextResponse.json({ error: "Ошибка создания услуги" }, { status: 500 });
  }
}
