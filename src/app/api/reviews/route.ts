import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

// Защита от XSS - санитизация HTML
function sanitizeHtml(text: string): string {
  if (!text) return "";
  // Удаляем все HTML теги
  return text
    .replace(/<[^>]*>/g, "")
    .replace(/&[^;]+;/g, "")
    .trim();
}

// Валидация данных отзыва
function validateReview(body: Record<string, unknown>): { valid: boolean; error?: string } {
  // Проверка обязательных полей
  if (!body.author_name || typeof body.author_name !== "string") {
    return { valid: false, error: "Имя обязательно" };
  }
  if ((body.author_name as string).trim().length < 2 || (body.author_name as string).trim().length > 100) {
    return { valid: false, error: "Имя должно быть от 2 до 100 символов" };
  }
  
  if (!body.content || typeof body.content !== "string") {
    return { valid: false, error: "Текст отзыва обязателен" };
  }
  if ((body.content as string).trim().length < 10 || (body.content as string).trim().length > 2000) {
    return { valid: false, error: "Отзыв должен быть от 10 до 2000 символов" };
  }
  
  if (!body.rating || typeof body.rating !== "number") {
    return { valid: false, error: "Оценка обязательна" };
  }
  if ((body.rating as number) < 1 || (body.rating as number) > 5 || !Number.isInteger(body.rating)) {
    return { valid: false, error: "Оценка должна быть от 1 до 5" };
  }
  
  // Проверка опциональных полей
  if (body.author_position && ((body.author_position as string).length > 100)) {
    return { valid: false, error: "Должность слишком длинная" };
  }
  if (body.author_company && ((body.author_company as string).length > 100)) {
    return { valid: false, error: "Название компании слишком длинное" };
  }
  
  return { valid: true };
}

// Простой rate limiting (в продакшене использовать Redis или специализированный сервис)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 минута
const RATE_LIMIT_MAX_REQUESTS = 5; // максимум 5 отзывов в минуту

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  
  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }
  
  record.count++;
  return true;
}

// GET - Получить все отзывы
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const active = searchParams.get("active");
    const rating = searchParams.get("rating");
    
    const where: Prisma.ReviewWhereInput = {};
    
    if (active === "true") {
      where.isActive = true;
    }
    
    if (rating) {
      const ratingNum = parseInt(rating);
      if (!isNaN(ratingNum) && ratingNum >= 1 && ratingNum <= 5) {
        where.rating = ratingNum;
      }
    }
    
    const data = await prisma.review.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
    
    return NextResponse.json({ data, count: data.length });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json({ error: "Ошибка получения данных" }, { status: 500 });
  }
}

// POST - Создать отзыв (с защитой от атак)
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get("x-forwarded-for") || 
               request.headers.get("x-real-ip") || 
               "unknown";
    
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Слишком много запросов. Попробуйте позже." },
        { status: 429 }
      );
    }
    
    const body = await request.json();
    
    // Валидация
    const validation = validateReview(body);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }
    
    // Санитизация данных (защита от XSS)
    const data = await prisma.review.create({
      data: {
        authorName: sanitizeHtml(body.author_name),
        authorPosition: body.author_position ? sanitizeHtml(body.author_position) : null,
        authorCompany: body.author_company ? sanitizeHtml(body.author_company) : null,
        content: sanitizeHtml(body.content),
        rating: body.rating,
        serviceId: body.service_id || null,
        isVerified: false, // Всегда false для новых отзывов (требует модерации)
        isActive: false, // Всегда false для новых отзывов (требует модерации)
      },
    });
    
    return NextResponse.json({ 
      data, 
      success: true,
      message: "Отзыв отправлен на модерацию"
    });
  } catch (error) {
    console.error("Error creating review:", error);
    return NextResponse.json(
      { error: "Ошибка создания отзыва" },
      { status: 500 }
    );
  }
}
