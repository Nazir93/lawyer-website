"use client";

import { useState, useEffect, type FormEvent, Suspense } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { Eye, EyeOff, ArrowRight, Loader2, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [authMethod, setAuthMethod] = useState<"email" | "phone">("email");
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    password: "",
    remember: false,
  });

  // Получаем callbackUrl из параметров
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  // Если уже авторизован - перенаправляем
  useEffect(() => {
    if (session?.user) {
      const redirectUrl = session.user.role === "ADMIN" || session.user.role === "LAWYER" 
        ? (callbackUrl.includes("/admin") ? callbackUrl : "/admin")
        : "/dashboard";
      router.push(redirectUrl);
    }
  }, [session, router, callbackUrl]);

  // Проверяем параметры URL для сообщений
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("confirmed") === "true") {
        toast.success("Email подтвержден! Теперь вы можете войти.");
        window.history.replaceState({}, "", "/login");
      }
      if (params.get("error")) {
        const error = params.get("error");
        toast.error(error === "CredentialsSignin" 
          ? "Неверный email/телефон или пароль" 
          : "Ошибка авторизации");
        window.history.replaceState({}, "", "/login");
      }
    }
  }, []);

  const handleEmailSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error("Заполните все поля");
      return;
    }

    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Неверный email или пароль");
        setIsLoading(false);
        return;
      }

      toast.success("Вы успешно вошли!");
      // Перенаправление будет через useEffect после получения session
      router.refresh();
    } catch (error) {
      console.error("Login exception:", error);
      toast.error("Ошибка входа");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!formData.phone || !formData.password) {
      toast.error("Заполните все поля");
      return;
    }

    setIsLoading(true);

    try {
      const result = await signIn("phone", {
        phone: formData.phone,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Неверный телефон или пароль");
        setIsLoading(false);
        return;
      }

      toast.success("Вы успешно вошли!");
      // Перенаправление будет через useEffect после получения session
      router.refresh();
    } catch (error) {
      console.error("Login exception:", error);
      toast.error("Ошибка входа");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-14 flex items-center justify-center">
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-light tracking-tight mb-2">
              Вход в <span className="font-serif italic">кабинет</span>
            </h1>
            <p className="text-muted-foreground">
              Выберите способ входа
            </p>
          </div>

          {/* Form */}
          <div className="p-6 rounded-2xl border border-border">
            <Tabs value={authMethod} onValueChange={(v) => {
              setAuthMethod(v as "email" | "phone");
            }} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </TabsTrigger>
                <TabsTrigger value="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Телефон
                </TabsTrigger>
              </TabsList>

              {/* Email Login */}
              <TabsContent value="email" className="space-y-4 mt-0">
                <form onSubmit={handleEmailSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm text-muted-foreground">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="email@example.com"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="h-11 rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm text-muted-foreground">
                      Пароль
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                        className="h-11 rounded-xl pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="remember"
                        checked={formData.remember}
                        onCheckedChange={(checked) =>
                          setFormData({ ...formData, remember: checked as boolean })
                        }
                      />
                      <Label
                        htmlFor="remember"
                        className="text-sm text-muted-foreground cursor-pointer"
                      >
                        Запомнить меня
                      </Label>
                    </div>
                    <Link
                      href="/forgot-password"
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      Забыли пароль?
                    </Link>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-11 rounded-full"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Вход...
                      </>
                    ) : (
                      <>
                        Войти
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>

              {/* Phone Login */}
              <TabsContent value="phone" className="space-y-4 mt-0">
                <form onSubmit={handlePhoneSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone-login" className="text-sm text-muted-foreground">
                      Номер телефона
                    </Label>
                    <Input
                      id="phone-login"
                      type="tel"
                      placeholder="+7 (900) 123-45-67"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="h-11 rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone-password" className="text-sm text-muted-foreground">
                      Пароль
                    </Label>
                    <div className="relative">
                      <Input
                        id="phone-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                        className="h-11 rounded-xl pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-11 rounded-full"
                    disabled={isLoading || !formData.phone || !formData.password}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Вход...
                      </>
                    ) : (
                      <>
                        Войти
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-6 pt-6 border-t border-border text-center">
              <p className="text-sm text-muted-foreground">
                Нет аккаунта?{" "}
                <Link
                  href="/register"
                  className="text-foreground hover:underline"
                >
                  Зарегистрироваться
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen pt-14 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
