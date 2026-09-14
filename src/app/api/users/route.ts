import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requirePlatformAdmin, hashPassword, validatePasswordStrength } from "@/lib/auth/auth";
import { authErrorResponse } from "@/lib/auth/api-guard";
import { Prisma, UserRole } from "@prisma/client";

const ALLOWED_CREATE_ROLES: UserRole[] = ["CLIENT", "LAWYER", "ADMIN"];

// GET - Получить всех пользователей (только ADMIN)
export async function GET(request: NextRequest) {
  try {
    await requirePlatformAdmin();

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
    return (
      authErrorResponse(error) ||
      NextResponse.json({ error: "Ошибка получения пользователей" }, { status: 500 })
    );
  }
}

// POST - Создать пользователя (только ADMIN)
export async function POST(request: NextRequest) {
  try {
    await requirePlatformAdmin();

    const body = await request.json();

    if (!body.email && !body.phone) {
      return NextResponse.json(
        { error: "Email или телефон обязательны" },
        { status: 400 }
      );
    }

    const roleRaw = body.role ? String(body.role).toUpperCase() : "CLIENT";
    if (!ALLOWED_CREATE_ROLES.includes(roleRaw as UserRole)) {
      return NextResponse.json({ error: "Некорректная роль" }, { status: 400 });
    }

    let hashedPassword: string | undefined;
    if (body.password) {
      const strength = validatePasswordStrength(String(body.password));
      if (!strength.valid) {
        return NextResponse.json(
          { error: strength.errors.join("; ") },
          { status: 400 }
        );
      }
      hashedPassword = await hashPassword(body.password);
    }

    const data = await prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone,
        password: hashedPassword,
        role: roleRaw as UserRole,
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

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Пользователь с таким email/телефоном уже существует" },
        { status: 400 }
      );
    }

    return (
      authErrorResponse(error) ||
      NextResponse.json({ error: "Ошибка создания пользователя" }, { status: 500 })
    );
  }
}
