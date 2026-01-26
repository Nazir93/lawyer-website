import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth/auth";

// Защищённые маршруты
const protectedRoutes = ["/dashboard", "/gasanov"];
const adminRoutes = ["/gasanov"];
const authRoutes = ["/login", "/register"];

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Получаем сессию
  const session = await auth();

  // Проверка защищённых маршрутов
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // Если пользователь не авторизован и пытается зайти на защищённый маршрут
  if (isProtectedRoute && !session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Если пользователь авторизован и пытается зайти на страницу входа/регистрации
  if (isAuthRoute && session) {
    // Перенаправляем админов на /gasanov, остальных на /dashboard
    const redirectUrl =
      session.user.role === "ADMIN" || session.user.role === "LAWYER"
        ? "/gasanov"
        : "/dashboard";
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }

  // Проверка доступа к админ-маршрутам
  if (isAdminRoute && session) {
    if (session.user.role !== "ADMIN" && session.user.role !== "LAWYER") {
      // Пользователь авторизован, но не имеет прав админа
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // Добавляем заголовки безопасности
  const response = NextResponse.next();

  // Защита от clickjacking
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  
  // CSP для дополнительной защиты
  response.headers.set(
    "Content-Security-Policy",
    "frame-ancestors 'none';"
  );

  return response;
}

// Указываем, на какие маршруты применять middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

