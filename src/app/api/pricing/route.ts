import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET - Получить все тарифы
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get("active") === "true";
    
    const data = await prisma.pricing.findMany({
      where: activeOnly ? { isActive: true } : {},
      orderBy: { sortOrder: "asc" },
    });
    
    return NextResponse.json({ data, count: data.length });
  } catch (error) {
    console.error("Error fetching pricing:", error);
    return NextResponse.json({ error: "Ошибка получения данных" }, { status: 500 });
  }
}

// POST - Создать тариф
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.name || !body.price) {
      return NextResponse.json(
        { error: "Название и цена обязательны" },
        { status: 400 }
      );
    }
    
    const data = await prisma.pricing.create({
      data: {
        name: body.name,
        description: body.description,
        price: body.price,
        priceNote: body.price_note,
        features: body.features || [],
        isPopular: body.is_popular ?? false,
        sortOrder: body.sort_order || 0,
        isActive: body.is_active ?? true,
      },
    });
    
    return NextResponse.json({ data, success: true });
  } catch (error) {
    console.error("Error creating pricing:", error);
    return NextResponse.json({ error: "Ошибка создания" }, { status: 500 });
  }
}
