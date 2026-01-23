"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Save, Eye, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/admin/image-upload";
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
import { toast } from "sonner";

const serviceGroups = [
  { id: "individual", name: "Физическим лицам" },
  { id: "business", name: "Юридическим лицам" },
  { id: "special", name: "Спецпредложения" },
];

export default function NewServicePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    service_group: "individual",
    description: "",
    content: "",
    price_text: "",
    price_from: "",
    meta_title: "",
    meta_description: "",
    image_url: null as string | null,
    is_active: true,
  });

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[а-яё]/g, (char) => {
        const map: Record<string, string> = {
          а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "yo",
          ж: "zh", з: "z", и: "i", й: "y", к: "k", л: "l", м: "m",
          н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u",
          ф: "f", х: "h", ц: "ts", ч: "ch", ш: "sh", щ: "sch",
          ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
        };
        return map[char] || char;
      })
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  };

  const handleTitleChange = (value: string) => {
    setFormData({
      ...formData,
      title: value,
      slug: generateSlug(value),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.slug) {
      toast.error("Заполните название услуги");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          slug: formData.slug,
          service_group: formData.service_group,
          description: formData.description,
          content: formData.content,
          price_text: formData.price_text,
          price_from: formData.price_from ? parseInt(formData.price_from) : null,
          meta_title: formData.meta_title,
          meta_description: formData.meta_description,
          image_url: formData.image_url,
          is_active: formData.is_active,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error);
      }

      toast.success("Услуга успешно создана");
      router.push("/admin/services");
    } catch (error: any) {
      toast.error(error.message || "Ошибка при создании услуги");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/services">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Новая услуга</h1>
          <p className="text-muted-foreground">
            Создание новой услуги на сайте
          </p>
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
                  <CardTitle>Основная информация</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Название *</Label>
                    <Input
                      id="title"
                      placeholder="Например: Семейное право"
                      value={formData.title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="slug">URL (slug)</Label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        /services/
                      </span>
                      <Input
                        id="slug"
                        placeholder="family-law"
                        value={formData.slug}
                        onChange={(e) =>
                          setFormData({ ...formData, slug: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="service_group">Группа *</Label>
                      <Select
                        value={formData.service_group}
                        onValueChange={(value) =>
                          setFormData({ ...formData, service_group: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите группу" />
                        </SelectTrigger>
                        <SelectContent>
                          {serviceGroups.map((group) => (
                            <SelectItem key={group.id} value={group.id}>
                              {group.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="price_text">Цена (текст)</Label>
                      <Input
                        id="price_text"
                        placeholder="От 5 000 ₽ или Бесплатно"
                        value={formData.price_text}
                        onChange={(e) =>
                          setFormData({ ...formData, price_text: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Краткое описание</Label>
                    <Textarea
                      id="description"
                      placeholder="Краткое описание услуги для карточек..."
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="content">Полное описание</Label>
                    <Textarea
                      id="content"
                      placeholder="Подробное описание услуги..."
                      value={formData.content}
                      onChange={(e) =>
                        setFormData({ ...formData, content: e.target.value })
                      }
                      rows={8}
                    />
                    <p className="text-xs text-muted-foreground">
                      Поддерживается Markdown форматирование
                    </p>
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
                  <CardTitle>SEO настройки</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="metaTitle">Meta Title</Label>
                    <Input
                      id="metaTitle"
                      placeholder="Заголовок для поисковиков"
                      value={formData.meta_title}
                      onChange={(e) =>
                        setFormData({ ...formData, meta_title: e.target.value })
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      {formData.meta_title.length}/60 символов
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="metaDescription">Meta Description</Label>
                    <Textarea
                      id="metaDescription"
                      placeholder="Описание для поисковиков"
                      value={formData.meta_description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          meta_description: e.target.value,
                        })
                      }
                      rows={3}
                    />
                    <p className="text-xs text-muted-foreground">
                      {formData.meta_description.length}/160 символов
                    </p>
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
                      <Label>Активна</Label>
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
                          Создать услугу
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      disabled={!formData.slug}
                      asChild
                    >
                      <Link href={`/services/${formData.slug}`} target="_blank">
                        <Eye className="mr-2 h-4 w-4" />
                        Предпросмотр
                      </Link>
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
                  <CardTitle>Изображение</CardTitle>
                </CardHeader>
                <CardContent>
                  <ImageUpload
                    value={formData.image_url}
                    onChange={(url) => setFormData({ ...formData, image_url: url })}
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
