import { NextRequest, NextResponse } from "next/server";

/**
 * Обработчик callback для OAuth авторизации
 * NextAuth автоматически обрабатывает OAuth callbacks через /api/auth/callback/[provider]
 * Этот route оставлен для совместимости и редиректов
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const confirmed = requestUrl.searchParams.get("confirmed");
  const error = requestUrl.searchParams.get("error");

  if (confirmed === "true") {
    // Email подтвержден
    return NextResponse.redirect(
      new URL("/login?confirmed=true", requestUrl.origin)
    );
  }

  if (error) {
    // Ошибка авторизации
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error)}`, requestUrl.origin)
    );
  }

  // По умолчанию редиректим на dashboard
  return NextResponse.redirect(new URL("/dashboard", requestUrl.origin));
}
