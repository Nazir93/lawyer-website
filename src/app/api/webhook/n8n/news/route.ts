import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Секретный ключ для защиты webhook (добавь в .env.local)
const WEBHOOK_SECRET = process.env.N8N_WEBHOOK_SECRET || "your-secret-key";

// POST - Создать новость из n8n
export async function POST(request: NextRequest) {
  try {
    // Проверяем секретный ключ
    const authHeader = request.headers.get("x-webhook-secret");
    if (authHeader !== WEBHOOK_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Валидация обязательных полей
    if (!body.title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    // Генерируем slug из заголовка
    const slug = body.slug || generateSlug(body.title);

    // Создаём новость
    const news = await prisma.news.create({
      data: {
        title: body.title,
        slug: slug,
        excerpt: body.excerpt || body.description || "",
        content: body.content || body.description || "",
        imageUrl: body.image_url || body.imageUrl || null,
        isPublished: body.is_published ?? body.isPublished ?? true,
        category: body.category || "Новости",
        readTime: body.read_time || estimateReadTime(body.content || ""),
      },
    });

    return NextResponse.json({
      success: true,
      message: "News created successfully",
      data: {
        id: news.id,
        title: news.title,
        slug: news.slug,
        url: `/news/${news.slug}`,
      },
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Генерация slug из заголовка
function generateSlug(title: string): string {
  const timestamp = Date.now();
  const baseSlug = title
    .toLowerCase()
    .replace(/[^a-zа-яё0-9\s]/gi, "")
    .replace(/\s+/g, "-")
    .substring(0, 50);
  
  return `${baseSlug}-${timestamp}`;
}

// Оценка времени чтения
function estimateReadTime(content: string): string {
  const words = content.split(/\s+/).length;
  const minutes = Math.ceil(words / 200);
  return `${minutes} мин`;
}

