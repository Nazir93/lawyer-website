import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth/auth";
import crypto from "crypto";

/**
 * Проверка данных Telegram через hash
 */
function verifyTelegramData(data: Record<string, string>, botToken: string): boolean {
  const { hash, ...userData } = data;
  
  const dataCheckString = Object.keys(userData)
    .sort()
    .map((key) => `${key}=${userData[key]}`)
    .join("\n");

  const secretKey = crypto
    .createHash("sha256")
    .update(botToken)
    .digest();

  const calculatedHash = crypto
    .createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");

  return calculatedHash === hash;
}

/**
 * POST - Обработка данных от Telegram Login Widget
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Проверка данных (опционально, если есть bot token)
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (botToken && !verifyTelegramData(body, botToken)) {
      return NextResponse.json(
        { error: "Неверные данные Telegram" },
        { status: 400 }
      );
    }

    const {
      id,
      first_name,
      last_name,
      username,
      photo_url,
    } = body;

    if (!id || !first_name) {
      return NextResponse.json(
        { error: "Недостаточно данных от Telegram" },
        { status: 400 }
      );
    }

    const fullName = `${first_name} ${last_name || ""}`.trim();
    const telegramPhone = `telegram_${id}`;
    const telegramEmail = `telegram_${id}@telegram.local`;

    // Проверяем, существует ли пользователь
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { phone: telegramPhone },
          { email: telegramEmail },
        ],
      },
    });

    if (user) {
      // Пользователь существует, возвращаем его ID
      return NextResponse.json({
        success: true,
        userId: user.id,
        isNew: false,
      });
    }

    // Создаём нового пользователя
    const tempPassword = await hashPassword(crypto.randomBytes(32).toString("hex"));
    
    user = await prisma.user.create({
      data: {
        email: telegramEmail,
        phone: telegramPhone,
        name: fullName,
        password: tempPassword,
        image: photo_url,
        role: "CLIENT",
        phoneVerified: new Date(), // Телеграм верифицирует пользователя
      },
    });

    return NextResponse.json({
      success: true,
      userId: user.id,
      isNew: true,
    });
  } catch (error) {
    console.error("Telegram auth error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Ошибка обработки данных Telegram" },
      { status: 500 }
    );
  }
}
