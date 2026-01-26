"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Save, Loader2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUpload } from "@/components/gasanov/image-upload";
import { toast } from "sonner";
import type { Service } from "@prisma/client";

export default function NewReviewPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [formData, setFormData] = useState({
    author_name: "",
    author_position: "",
    author_company: "",
    author_photo_url: null as string | null,
    content: "",
    rating: 5,
    service_id: "",
    is_verified: false,
    is_active: true,
  });

  useEffect(() => {
    async function loadServices() {
      try {
        const response = await fetch("/api/services?active=true");
        const data = await response.json();
        setServices(data.data || []);
      } catch (error) {
        console.error("Error loading services:", error);
      }
    }
    loadServices();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.author_name || !formData.content) {
      toast.error("Заполните имя автора и текст отзыва");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          service_id: formData.service_id && formData.service_id !== "none" ? formData.service_id : null,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error);
      }

      toast.success("Отзыв успешно создан");
      router.push("/gasanov/reviews");
    } catch (error: any) {
      toast.error(error.message || "Ошибка при создании отзыва");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/gasanov/reviews">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Новый отзыв</h1>
          <p className="text-muted-foreground">Добавление отзыва клиента</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Информация об авторе</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="author_name">Имя автора *</Label>
                      <Input
                        id="author_name"
                        placeholder="Иван Иванов"
                        value={formData.author_name}
                        onChange={(e) =>
                          setFormData({ ...formData, author_name: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="author_position">Должность</Label>
                      <Input
                        id="author_position"
                        placeholder="Генеральный директор"
                        value={formData.author_position}
                        onChange={(e) =>
                          setFormData({ ...formData, author_position: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="author_company">Компания</Label>
                    <Input
                      id="author_company"
                      placeholder="ООО Ромашка"
                      value={formData.author_company}
                      onChange={(e) =>
                        setFormData({ ...formData, author_company: e.target.value })
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Отзыв</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="rating">Оценка *</Label>
                    <div className="flex items-center gap-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setFormData({ ...formData, rating: i + 1 })}
                          className="focus:outline-none"
                        >
                          <Star
                            className={`h-8 w-8 transition-colors ${
                              i < formData.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-muted-foreground/30"
                            }`}
                          />
                        </button>
                      ))}
                      <span className="ml-2 text-sm text-muted-foreground">
                        {formData.rating} из 5
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="content">Текст отзыва *</Label>
                    <Textarea
                      id="content"
                      placeholder="Текст отзыва клиента..."
                      value={formData.content}
                      onChange={(e) =>
                        setFormData({ ...formData, content: e.target.value })
                      }
                      rows={6}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="service_id">Услуга (опционально)</Label>
                    <Select
                      value={formData.service_id}
                      onValueChange={(value) =>
                        setFormData({ ...formData, service_id: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите услугу" />
                      </SelectTrigger>
                      <SelectContent>
                        {services.length === 0 ? (
                          <SelectItem value="none" disabled>
                            Услуги не добавлены
                          </SelectItem>
                        ) : (
                          services.map((service) => (
                            <SelectItem key={service.id} value={service.id}>
                              {service.title}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Публикация</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Активен</Label>
                      <p className="text-sm text-muted-foreground">
                        Показывать на сайте
                      </p>
                    </div>
                    <Switch
                      checked={formData.is_active}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, is_active: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Проверен</Label>
                      <p className="text-sm text-muted-foreground">
                        Отметить как проверенный
                      </p>
                    </div>
                    <Switch
                      checked={formData.is_verified}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, is_verified: checked })
                      }
                    />
                  </div>

                  <div className="pt-4 border-t space-y-2">
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Сохранение...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Создать отзыв
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Фото автора</CardTitle>
                </CardHeader>
                <CardContent>
                  <ImageUpload
                    value={formData.author_photo_url}
                    onChange={(url) =>
                      setFormData({ ...formData, author_photo_url: url })
                    }
                    disabled={isLoading}
                  />
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </form>
    </div>
  );
}

