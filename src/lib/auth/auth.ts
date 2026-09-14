import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import type { UserRole } from "@prisma/client";

// Расширяем типы NextAuth
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
      phone?: string | null;
      role: UserRole;
    };
  }
  
  interface User {
    role: UserRole;
    phone?: string | null;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    role: UserRole;
    phone?: string | null;
    roleCheckedAt?: number;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  adapter: PrismaAdapter(prisma) as any,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 дней
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    // Вход по email/паролю
    Credentials({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Пароль", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email и пароль обязательны");
        }

        const email = (credentials.email as string).trim().toLowerCase();

        const { checkRateLimit } = await import("@/lib/security/rate-limit");
        const limited = checkRateLimit({
          key: `login:email:${email}`,
          limit: 10,
          windowMs: 15 * 60 * 1000,
        });
        if (!limited.allowed) {
          throw new Error("Слишком много попыток входа. Попробуйте позже");
        }

        // Валидация email формата
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          throw new Error("Некорректный формат email");
        }

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user || !user.password) {
          throw new Error("Неверный email или пароль");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Неверный email или пароль");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          phone: user.phone,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.phone = user.phone;
        token.roleCheckedAt = Date.now();
        return token;
      }

      // Периодически подтягиваем роль из БД (бан/демоут не ждут 30 дней)
      const checkedAt = token.roleCheckedAt ?? 0;
      const stale = Date.now() - checkedAt > 5 * 60 * 1000;
      if (token.sub && stale) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { role: true, phone: true },
        });
        if (!dbUser) {
          return { ...token, role: undefined, phone: undefined };
        }
        token.role = dbUser.role;
        token.phone = dbUser.phone;
        token.roleCheckedAt = Date.now();
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
        session.user.role = token.role as UserRole;
        session.user.phone = token.phone as string | null | undefined;
      }
      return session;
    },
  },
});

// Хелпер для получения текущего пользователя
export async function getCurrentUser() {
  const session = await auth();
  return session?.user;
}

// Хелпер для проверки авторизации
export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

// Хелпер для проверки роли админа платформы / CMS
// ВАЖНО: LAWYER больше не считается админом (иначе эскалация привилегий)
export async function requireAdmin() {
  return requirePlatformAdmin();
}

// Только админ платформы (CMS сайта)
export async function requirePlatformAdmin() {
  const user = await requireAuth();
  if (user.role !== "ADMIN") {
    throw new Error("Forbidden");
  }
  return user;
}

// Кабинет юриста
export async function requireLawyer() {
  const user = await requireAuth();
  if (user.role !== "LAWYER" && user.role !== "ADMIN") {
    throw new Error("Forbidden");
  }
  return user;
}

// Хелпер для хеширования пароля (усиленное хеширование)
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

// Хелпер для проверки пароля
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// Валидация силы пароля
export function validatePasswordStrength(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push("Пароль должен содержать минимум 8 символов");
  }
  if (!/[A-ZА-Я]/.test(password)) {
    errors.push("Пароль должен содержать заглавную букву");
  }
  if (!/\d/.test(password)) {
    errors.push("Пароль должен содержать цифру");
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push("Пароль должен содержать спецсимвол (!@#$%^&*)");
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}
