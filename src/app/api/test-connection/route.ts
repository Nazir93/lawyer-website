import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { storageType } from "@/lib/storage";

// Тестовый эндпоинт для проверки подключения к БД
export async function GET() {
  try {
    // Проверяем подключение к PostgreSQL через Prisma
    const settings = await prisma.siteSettings.findFirst({
      select: { id: true },
    });

    // Проверяем переменные окружения для S3
    const hasS3Config = !!(
      process.env.YANDEX_S3_ACCESS_KEY &&
      process.env.YANDEX_S3_SECRET_KEY &&
      process.env.YANDEX_S3_BUCKET
    );

    return NextResponse.json({
      success: true,
      message: "Подключение к базе данных работает!",
      database: "✅ PostgreSQL подключен",
      storage: storageType === "yandex-s3"
        ? "✅ Yandex Object Storage (S3)" 
        : "📁 Локальное хранилище",
      settings: settings ? "✅ Таблица настроек существует" : "⚠️ Таблица настроек пуста",
      hints: [
        !settings && "Выполните: npx prisma db push",
        !hasS3Config && "Используется локальное хранилище (для S3 настройте YANDEX_S3_* в .env.local)",
      ].filter(Boolean),
    });
  } catch (error) {
    console.error("Database connection error:", error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Ошибка подключения",
        hints: [
          "Проверьте DATABASE_URL в .env.local",
          "Выполните: npx prisma generate",
          "Выполните: npx prisma db push",
        ],
      },
      { status: 500 }
    );
  }
}
