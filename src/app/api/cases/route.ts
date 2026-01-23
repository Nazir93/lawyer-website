import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

// GET - Получить все кейсы
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const active = searchParams.get("active");
    const featured = searchParams.get("featured");
    const limit = searchParams.get("limit");
    const search = searchParams.get("search");
    
    const where: Prisma.CaseWhereInput = {};
    
    if (active === "true") {
      where.isActive = true;
    }
    
    if (featured === "true") {
      where.isFeatured = true;
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
      ];
    }
    
    const data = await prisma.case.findMany({
      where,
      orderBy: [
        { year: "desc" },
        { createdAt: "desc" },
      ],
      take: limit ? parseInt(limit) : undefined,
    });
    
    return NextResponse.json({ data, count: data.length });
  } catch (error) {
    console.error("Error fetching cases:", error);
    return NextResponse.json({ error: "Ошибка получения данных" }, { status: 500 });
  }
}

// POST - Создать кейс
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.title || !body.slug || !body.result) {
      return NextResponse.json(
        { error: "Название, slug и результат обязательны" },
        { status: 400 }
      );
    }
    
    const data = await prisma.case.create({
      data: {
        title: body.title,
        slug: body.slug,
        description: body.description,
        content: body.content,
        imageUrl: body.image_url,
        category: body.category,
        result: body.result,
        year: body.year || new Date().getFullYear(),
        clientName: body.client_name,
        duration: body.duration,
        metaTitle: body.meta_title,
        metaDescription: body.meta_description,
        isFeatured: body.is_featured ?? false,
        isActive: body.is_active ?? true,
      },
    });
    
    return NextResponse.json({ data, success: true });
  } catch (error: unknown) {
    console.error("Error creating case:", error);
    
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "Кейс с таким URL уже существует" }, { status: 400 });
    }
    
    return NextResponse.json({ error: "Ошибка создания кейса" }, { status: 500 });
  }
}
