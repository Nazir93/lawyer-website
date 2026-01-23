"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Star, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function NewReviewPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rating, setRating] = useState<number>(5);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [formData, setFormData] = useState({
    author_name: "",
    author_position: "",
    author_company: "",
    content: "",
    service_id: "",
  });
  const [services, setServices] = useState<Array<{ id: string; title: string }>>([]);

  // Загружаем услуги
  useEffect(() => {
    fetch("/api/services?active=true")
      .then((res) => res.json())
      .then((data) => {
        if (data.data) {
          setServices(data.data);
        }
      })
      .catch(console.error);
  }, []);

  // Защита от XSS - санитизация текста
  const sanitizeInput = (text: string): string => {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  };

  // Валидация формы
  const validateForm = (): boolean => {
    if (!formData.author_name.trim() || formData.author_name.trim().length < 2) {
      toast.error("Имя должно содержать минимум 2 символа");
      return false;
    }
    if (formData.author_name.trim().length > 100) {
      toast.error("Имя слишком длинное (максимум 100 символов)");
      return false;
    }
    if (!formData.content.trim() || formData.content.trim().length < 10) {
      toast.error("Отзыв должен содержать минимум 10 символов");
      return false;
    }
    if (formData.content.trim().length > 2000) {
      toast.error("Отзыв слишком длинный (максимум 2000 символов)");
      return false;
    }
    if (rating < 1 || rating > 5) {
      toast.error("Выберите рейтинг от 1 до 5 звезд");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // Санитизация данных перед отправкой
      const sanitizedData = {
        author_name: sanitizeInput(formData.author_name.trim()),
        author_position: formData.author_position ? sanitizeInput(formData.author_position.trim()) : null,
        author_company: formData.author_company ? sanitizeInput(formData.author_company.trim()) : null,
        content: sanitizeInput(formData.content.trim()),
        rating: rating,
        service_id: formData.service_id || null,
      };

      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sanitizedData),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Ошибка отправки отзыва");
      }

      toast.success("Отзыв успешно отправлен! Спасибо за ваш отзыв.");
      router.push("/reviews");
    } catch (error: any) {
      toast.error(error.message || "Ошибка отправки отзыва");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-6 lg:px-8 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Header */}
          <div>
            <Button variant="ghost" size="sm" asChild className="mb-6">
              <Link href="/reviews">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Назад к отзывам
              </Link>
            </Button>
            <h1 className="text-4xl sm:text-5xl font-light tracking-tight mb-4">
              Оставить <span className="font-serif italic">отзыв</span>
            </h1>
            <p className="text-muted-foreground">
              Поделитесь своим опытом работы с нами
            </p>
          </div>

          {/* Form */}
          <Card>
            <CardHeader>
              <CardTitle>Ваш отзыв</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Rating */}
                <div>
                  <Label>Оценка</Label>
                  <div className="flex items-center gap-2 mt-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          className={`h-8 w-8 ${
                            star <= (hoveredRating || rating)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-muted-foreground"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Name */}
                <div>
                  <Label htmlFor="name">Ваше имя *</Label>
                  <Input
                    id="name"
                    value={formData.author_name}
                    onChange={(e) =>
                      setFormData({ ...formData, author_name: e.target.value })
                    }
                    placeholder="Иван Иванов"
                    maxLength={100}
                    required
                  />
                </div>

                {/* Position */}
                <div>
                  <Label htmlFor="position">Должность</Label>
                  <Input
                    id="position"
                    value={formData.author_position}
                    onChange={(e) =>
                      setFormData({ ...formData, author_position: e.target.value })
                    }
                    placeholder="Директор"
                    maxLength={100}
                  />
                </div>

                {/* Company */}
                <div>
                  <Label htmlFor="company">Компания</Label>
                  <Input
                    id="company"
                    value={formData.author_company}
                    onChange={(e) =>
                      setFormData({ ...formData, author_company: e.target.value })
                    }
                    placeholder="ООО Компания"
                    maxLength={100}
                  />
                </div>

                {/* Service */}
                {services.length > 0 && (
                  <div>
                    <Label htmlFor="service">Услуга (опционально)</Label>
                    <Select
                      value={formData.service_id}
                      onValueChange={(value) =>
                        setFormData({ ...formData, service_id: value })
                      }
                    >
                      <SelectTrigger id="service">
                        <SelectValue placeholder="Выберите услугу" />
                      </SelectTrigger>
                      <SelectContent>
                        {services.map((service) => (
                          <SelectItem key={service.id} value={service.id}>
                            {service.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Content */}
                <div>
                  <Label htmlFor="content">Ваш отзыв *</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) =>
                      setFormData({ ...formData, content: e.target.value })
                    }
                    placeholder="Расскажите о вашем опыте..."
                    rows={6}
                    maxLength={2000}
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {formData.content.length} / 2000 символов
                  </p>
                </div>

                {/* Security Notice */}
                <div className="flex items-start gap-2 p-3 rounded-lg bg-secondary/50">
                  <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <p className="text-xs text-muted-foreground">
                    Все отзывы проходят модерацию перед публикацией. Мы защищаем ваши данные и используем современные методы безопасности.
                  </p>
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  size="lg"
                  className="w-full rounded-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Отправка...
                    </>
                  ) : (
                    "Отправить отзыв"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

