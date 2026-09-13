import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword, validatePasswordStrength } from "@/lib/auth/auth";
import {
  createUniqueLawyerSlug,
  createUniqueReferralCode,
  findReferrerByCode,
} from "@/lib/platform/referral";
import { Prisma } from "@prisma/client";

type AccountType = "CLIENT" | "LAWYER";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      name,
      email,
      password,
      accountType = "CLIENT",
      referralCode,
      specialization,
      city,
      phone,
      barNumber,
    } = body;

    const role: AccountType =
      accountType === "LAWYER" || accountType === "lawyer" ? "LAWYER" : "CLIENT";

    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json(
        { error: "Имя должно содержать минимум 2 символа" },
        { status: 400 }
      );
    }

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email обязателен" }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return NextResponse.json(
        { error: "Некорректный формат email" },
        { status: 400 }
      );
    }

    if (!password || typeof password !== "string") {
      return NextResponse.json({ error: "Пароль обязателен" }, { status: 400 });
    }

    const passwordCheck = validatePasswordStrength(password);
    if (!passwordCheck.valid) {
      return NextResponse.json(
        { error: passwordCheck.errors[0] },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Пользователь с таким email уже существует" },
        { status: 400 }
      );
    }

    const referrer = await findReferrerByCode(referralCode);
    if (
      typeof referralCode === "string" &&
      referralCode.trim() &&
      !referrer
    ) {
      return NextResponse.json(
        { error: "Реферальный код не найден" },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(password);
    const ownCode = await createUniqueReferralCode(role);
    const displayName = name.trim();
    const slug =
      role === "LAWYER" ? await createUniqueLawyerSlug(displayName) : null;

    const user = await prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          name: displayName,
          email: normalizedEmail,
          password: hashedPassword,
          role,
          phone:
            typeof phone === "string" && phone.trim() ? phone.trim() : undefined,
          referralCode: ownCode,
          referredById: referrer?.id,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          referralCode: true,
          referredById: true,
          createdAt: true,
        },
      });

      if (role === "LAWYER" && slug) {
        await tx.lawyerProfile.create({
          data: {
            userId: created.id,
            displayName,
            slug,
            specialization:
              typeof specialization === "string" && specialization.trim()
                ? specialization.trim()
                : null,
            city: typeof city === "string" && city.trim() ? city.trim() : null,
            phone:
              typeof phone === "string" && phone.trim() ? phone.trim() : null,
            barNumber:
              typeof barNumber === "string" && barNumber.trim()
                ? barNumber.trim()
                : null,
            status: "PENDING",
          },
        });
      }

      return created;
    });

    return NextResponse.json({
      success: true,
      message:
        role === "LAWYER"
          ? "Заявка юриста отправлена. После модерации откроется полный доступ к кабинету."
          : "Регистрация успешна",
      user,
    });
  } catch (error) {
    console.error("Registration error:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json(
        { error: "Пользователь с таким email уже существует" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Ошибка регистрации. Попробуйте позже." },
      { status: 500 }
    );
  }
}
