import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

// GET - Получить все новости
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const published = searchParams.get("published");
    const limit = searchParams.get("limit");
    const search = searchParams.get("search");
    
    const where: Prisma.NewsWhereInput = {};
    
    if (published === "true") {
      where.isPublished = true;
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
      ];
    }
    
    const data = await prisma.news.findMany({
      where,
      orderBy: [
        { publishedAt: { sort: "desc", nulls: "last" } },
        { createdAt: "desc" },
      ],
      take: limit ? parseInt(limit) : undefined,
    });
    
    return NextResponse.json({ data, count: data.length });
  } catch (error) {
    console.error("Error fetching news:", error);
    return NextResponse.json({ error: "Ошибка получения данных" }, { status: 500 });
  }
}

// POST - Создать новость
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.title || !body.slug) {
      return NextResponse.json(
        { error: "Название и slug обязательны" },
        { status: 400 }
      );
    }
    
    const data = await prisma.news.create({
      data: {
        title: body.title,
        slug: body.slug,
        description: body.description,
        content: body.content,
        imageUrl: body.image_url,
        categoryId: body.category_id,
        metaTitle: body.meta_title,
        metaDescription: body.meta_description,
        isPublished: body.is_published ?? false,
        publishedAt: body.is_published ? new Date() : null,
      },
    });
    
    return NextResponse.json({ data, success: true });
  } catch (error: unknown) {
    console.error("Error creating news:", error);
    
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "Новость с таким URL уже существует" }, { status: 400 });
    }
    
    return NextResponse.json({ error: "Ошибка создания новости" }, { status: 500 });
  }
}
