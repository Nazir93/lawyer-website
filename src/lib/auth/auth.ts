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
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma) as any,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    // Вход по Яндекс ID (опционально, раскомментируйте если нужно)
    // YandexProvider({
    //   clientId: process.env.YANDEX_CLIENT_ID!,
    //   clientSecret: process.env.YANDEX_CLIENT_SECRET!,
    // }),
    
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

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
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
    
    // Вход по телефону
    Credentials({
      id: "phone",
      name: "Phone",
      credentials: {
        phone: { label: "Телефон", type: "tel" },
        password: { label: "Пароль", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.password) {
          throw new Error("Телефон и пароль обязательны");
        }

        // Нормализуем номер телефона
        const normalizedPhone = (credentials.phone as string).replace(/\D/g, "");
        
        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { phone: normalizedPhone },
              { phone: `+${normalizedPhone}` },
              { phone: `+7${normalizedPhone.slice(-10)}` },
            ],
          },
        });

        if (!user || !user.password) {
          throw new Error("Неверный телефон или пароль");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Неверный телефон или пароль");
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

// Хелпер для проверки роли админа
export async function requireAdmin() {
  const user = await requireAuth();
  if (user.role !== "ADMIN" && user.role !== "LAWYER") {
    throw new Error("Forbidden");
  }
  return user;
}

// Хелпер для хеширования пароля
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

// Хелпер для проверки пароля
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}
