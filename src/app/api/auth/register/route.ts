import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth/auth";
import { Prisma } from "@prisma/client";

// POST - Регистрация нового пользователя
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { name, email, phone, password } = body;

    // Валидация
    if (!name || !password) {
      return NextResponse.json(
        { error: "Имя и пароль обязательны" },
        { status: 400 }
      );
    }

    if (!email && !phone) {
      return NextResponse.json(
        { error: "Email или телефон обязательны" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Пароль должен быть минимум 8 символов" },
        { status: 400 }
      );
    }

    // Хешируем пароль
    const hashedPassword = await hashPassword(password);

    // Создаём пользователя
    const user = await prisma.user.create({
      data: {
        name,
        email: email || null,
        phone: phone || null,
        password: hashedPassword,
        role: "CLIENT",
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Registration error:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        const target = (error.meta?.target as string[]) || [];
        if (target.includes("email")) {
          return NextResponse.json(
            { error: "Пользователь с таким email уже существует" },
            { status: 400 }
          );
        }
        if (target.includes("phone")) {
          return NextResponse.json(
            { error: "Пользователь с таким телефоном уже существует" },
            { status: 400 }
          );
        }
        return NextResponse.json(
          { error: "Пользователь уже существует" },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: "Ошибка регистрации" },
      { status: 500 }
    );
  }
}

