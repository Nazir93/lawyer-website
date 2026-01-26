"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowRight, Loader2, Check, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    consent: false,
  });

  const passwordRequirements = [
    { text: "Минимум 8 символов", met: formData.password.length >= 8 },
    { text: "Одна заглавная буква", met: /[A-ZА-Я]/.test(formData.password) },
    { text: "Одна цифра", met: /\d/.test(formData.password) },
    { text: "Один спецсимвол (!@#$%^&*)", met: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password) },
  ];

  const isPasswordValid = passwordRequirements.every(req => req.met);
  const isFormValid = formData.name && formData.email && formData.password && 
                      formData.confirmPassword && formData.consent && isPasswordValid &&
                      formData.password === formData.confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Введите ваше имя");
      return;
    }

    if (!formData.email.trim()) {
      toast.error("Введите email");
      return;
    }

    // Валидация email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Введите корректный email");
      return;
    }

    if (!formData.password) {
      toast.error("Введите пароль");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Пароли не совпадают");
      return;
    }

    if (!formData.consent) {
      toast.error("Необходимо согласие на обработку данных");
      return;
    }

    if (!isPasswordValid) {
      toast.error("Пароль не соответствует требованиям безопасности");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Ошибка регистрации");
        return;
      }

      toast.success("Регистрация успешна! Теперь вы можете войти.");
      router.push("/login");
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Ошибка соединения с сервером");
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
              Создать <span className="font-serif italic">аккаунт</span>
            </h1>
            <p className="text-muted-foreground">
              Заполните форму для регистрации
            </p>
          </div>

          {/* Form */}
          <div className="p-6 rounded-2xl border border-border">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email indicator */}
              <div className="flex items-center justify-center gap-2 mb-4 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>Регистрация по Email</span>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm text-muted-foreground">
                  Имя *
                </Label>
                <Input
                  id="name"
                  placeholder="Иван Иванов"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="h-11 rounded-xl"
                  autoComplete="name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm text-muted-foreground">
                  Email *
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
                  autoComplete="email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm text-muted-foreground">
                  Пароль *
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
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>

                {/* Password requirements */}
                <div className="space-y-1 pt-2">
                  {passwordRequirements.map((req) => (
                    <div
                      key={req.text}
                      className={`flex items-center gap-2 text-xs transition-colors ${
                        req.met ? "text-green-600" : "text-muted-foreground"
                      }`}
                    >
                      <Check className={`h-3 w-3 ${req.met ? "" : "opacity-30"}`} />
                      {req.text}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm text-muted-foreground">
                  Подтвердите пароль *
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, confirmPassword: e.target.value })
                  }
                  className="h-11 rounded-xl"
                  autoComplete="new-password"
                />
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="text-xs text-destructive">Пароли не совпадают</p>
                )}
              </div>

              <div className="flex items-start gap-2 pt-2">
                <Checkbox
                  id="consent"
                  checked={formData.consent}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, consent: checked as boolean })
                  }
                  className="mt-0.5"
                />
                <Label
                  htmlFor="consent"
                  className="text-sm text-muted-foreground cursor-pointer leading-relaxed"
                >
                  Я согласен на{" "}
                  <Link href="/privacy" className="underline hover:text-foreground">
                    обработку персональных данных
                  </Link>
                </Label>
              </div>

              <Button
                type="submit"
                className="w-full h-11 rounded-full"
                disabled={isLoading || !isFormValid}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Регистрация...
                  </>
                ) : (
                  <>
                    Зарегистрироваться
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-border text-center">
              <p className="text-sm text-muted-foreground">
                Уже есть аккаунт?{" "}
                <Link href="/login" className="text-foreground hover:underline font-medium">
                  Войти
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
