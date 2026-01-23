import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, hashPassword } from "@/lib/auth/auth";
import { Prisma, UserRole } from "@prisma/client";

// GET - Получить всех пользователей (только для админа)
export async function GET(request: NextRequest) {
  try {
    // Проверяем права доступа
    await requireAdmin();
    
    const { searchParams } = new URL(request.url);
    
    const search = searchParams.get("search");
    const role = searchParams.get("role");
    const limit = searchParams.get("limit");
    
    const where: Prisma.UserWhereInput = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
      ];
    }
    
    if (role) {
      where.role = role.toUpperCase() as UserRole;
    }
    
    const data = await prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit ? parseInt(limit) : undefined,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        image: true,
        emailVerified: true,
        phoneVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    
    return NextResponse.json({ data, count: data.length });
  } catch (error) {
    console.error("Error fetching users:", error);
    
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
    }
    
    return NextResponse.json({ error: "Ошибка получения пользователей" }, { status: 500 });
  }
}

// POST - Создать пользователя (для админа)
export async function POST(request: NextRequest) {
  try {
    // Проверяем права доступа
    await requireAdmin();
    
    const body = await request.json();
    
    if (!body.email && !body.phone) {
      return NextResponse.json(
        { error: "Email или телефон обязательны" },
        { status: 400 }
      );
    }
    
    // Хешируем пароль если он указан
    let hashedPassword: string | undefined;
    if (body.password) {
      hashedPassword = await hashPassword(body.password);
    }
    
    const data = await prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone,
        password: hashedPassword,
        role: body.role ? (body.role.toUpperCase() as UserRole) : "CLIENT",
        image: body.image,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        image: true,
        createdAt: true,
      },
    });
    
    return NextResponse.json({ data, success: true });
  } catch (error) {
    console.error("Error creating user:", error);
    
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "Пользователь с таким email/телефоном уже существует" }, { status: 400 });
    }
    
    return NextResponse.json({ error: "Ошибка создания пользователя" }, { status: 500 });
  }
}
