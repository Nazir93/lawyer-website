"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowRight, Loader2, Check, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [authMethod, setAuthMethod] = useState<"email" | "phone">("email");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    consent: false,
  });

  const passwordRequirements = [
    { text: "Минимум 8 символов", met: formData.password.length >= 8 },
    { text: "Одна заглавная буква", met: /[A-ZА-Я]/.test(formData.password) },
    { text: "Одна цифра", met: /\d/.test(formData.password) },
  ];

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.password) {
      toast.error("Заполните все обязательные поля");
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

    if (!passwordRequirements.every(req => req.met)) {
      toast.error("Пароль не соответствует требованиям");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone || undefined,
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
      toast.error("Ошибка регистрации");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.phone || !formData.password) {
      toast.error("Заполните все обязательные поля");
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

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
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
      toast.error("Ошибка регистрации");
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
              Выберите способ регистрации
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

              {/* Email Registration */}
              <TabsContent value="email" className="space-y-4 mt-0">
                <form onSubmit={handleEmailSubmit} className="space-y-4">
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
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm text-muted-foreground">
                      Телефон (опционально)
                    </Label>
                    <Input
                      id="phone"
                      placeholder="+7 (900) 123-45-67"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="h-11 rounded-xl"
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

                    {/* Password requirements */}
                    <div className="space-y-1 pt-2">
                      {passwordRequirements.map((req) => (
                        <div
                          key={req.text}
                          className={`flex items-center gap-2 text-xs ${
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
                    />
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
                    disabled={isLoading}
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
              </TabsContent>

              {/* Phone Registration */}
              <TabsContent value="phone" className="space-y-4 mt-0">
                <form onSubmit={handlePhoneSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name-phone" className="text-sm text-muted-foreground">
                      Имя *
                    </Label>
                    <Input
                      id="name-phone"
                      placeholder="Иван Иванов"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="h-11 rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone-reg" className="text-sm text-muted-foreground">
                      Номер телефона *
                    </Label>
                    <Input
                      id="phone-reg"
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
                    <Label htmlFor="password-phone" className="text-sm text-muted-foreground">
                      Пароль *
                    </Label>
                    <div className="relative">
                      <Input
                        id="password-phone"
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

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword-phone" className="text-sm text-muted-foreground">
                      Подтвердите пароль *
                    </Label>
                    <Input
                      id="confirmPassword-phone"
                      type="password"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        setFormData({ ...formData, confirmPassword: e.target.value })
                      }
                      className="h-11 rounded-xl"
                    />
                  </div>

                  <div className="flex items-start gap-2 pt-2">
                    <Checkbox
                      id="consent-phone"
                      checked={formData.consent}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, consent: checked as boolean })
                      }
                      className="mt-0.5"
                    />
                    <Label
                      htmlFor="consent-phone"
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
                    disabled={isLoading || !formData.phone || !formData.consent}
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
              </TabsContent>
            </Tabs>

            <div className="mt-6 pt-6 border-t border-border text-center">
              <p className="text-sm text-muted-foreground">
                Уже есть аккаунт?{" "}
                <Link href="/login" className="text-foreground hover:underline">
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
