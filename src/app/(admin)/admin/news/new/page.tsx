"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Save,
  Eye,
  Bold,
  Italic,
  List,
  ListOrdered,
  Link as LinkIcon,
  Image as ImageIcon,
  Heading1,
  Heading2,
  Quote,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { ImageUpload } from "@/components/admin/image-upload";

const categories = [
  { value: "blog", label: "Блог" },
  { value: "cases", label: "Кейсы" },
  { value: "media", label: "СМИ о нас" },
  { value: "opinion", label: "Личное мнение" },
];

export default function NewNewsPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    category: "",
    cover_image: "",
    is_published: false,
    meta_title: "",
    meta_description: "",
  });

  // Автогенерация slug
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-zа-яё0-9\s]/gi, "")
      .replace(/\s+/g, "-")
      .replace(/[а-яё]/gi, (char) => {
        const translitMap: Record<string, string> = {
          а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "yo",
          ж: "zh", з: "z", и: "i", й: "y", к: "k", л: "l", м: "m",
          н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u",
          ф: "f", х: "h", ц: "ts", ч: "ch", ш: "sh", щ: "sch",
          ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
        };
        return translitMap[char.toLowerCase()] || char;
      });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.content) {
      toast.error("Заполните обязательные поля");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          slug: formData.slug,
          description: formData.excerpt,
          content: formData.content,
          image_url: formData.cover_image,
          is_published: formData.is_published,
          meta_title: formData.meta_title,
          meta_description: formData.meta_description,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Ошибка при создании новости");
      }

      toast.success("Новость создана!");
      router.push("/admin/news");
    } catch (error: any) {
      toast.error(error.message || "Ошибка при создании новости");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/news">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Новая новость
            </h1>
            <p className="text-muted-foreground">
              Создание новой публикации
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            disabled={isSubmitting || !formData.slug}
            asChild
          >
            <Link href={`/news/${formData.slug}`} target="_blank">
              <Eye className="mr-2 h-4 w-4" />
              Предпросмотр
            </Link>
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            <Save className="mr-2 h-4 w-4" />
            {isSubmitting ? "Сохранение..." : "Сохранить"}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Основное</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Заголовок *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        title: e.target.value,
                        slug: generateSlug(e.target.value),
                      })
                    }
                    placeholder="Введите заголовок новости"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">URL (slug)</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData({ ...formData, slug: e.target.value })
                    }
                    placeholder="url-novosti"
                  />
                  <p className="text-xs text-muted-foreground">
                    /news/{formData.slug || "..."}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="excerpt">Краткое описание</Label>
                  <Textarea
                    id="excerpt"
                    value={formData.excerpt}
                    onChange={(e) =>
                      setFormData({ ...formData, excerpt: e.target.value })
                    }
                    placeholder="Краткое описание для списка новостей..."
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Content Editor */}
            <Card>
              <CardHeader>
                <CardTitle>Содержимое *</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Toolbar */}
                <div className="flex flex-wrap gap-1 p-2 border rounded-t-lg bg-muted/50">
                  <Button type="button" variant="ghost" size="icon" title="Заголовок 1">
                    <Heading1 className="h-4 w-4" />
                  </Button>
                  <Button type="button" variant="ghost" size="icon" title="Заголовок 2">
                    <Heading2 className="h-4 w-4" />
                  </Button>
                  <Separator orientation="vertical" className="h-8" />
                  <Button type="button" variant="ghost" size="icon" title="Жирный">
                    <Bold className="h-4 w-4" />
                  </Button>
                  <Button type="button" variant="ghost" size="icon" title="Курсив">
                    <Italic className="h-4 w-4" />
                  </Button>
                  <Separator orientation="vertical" className="h-8" />
                  <Button type="button" variant="ghost" size="icon" title="Список">
                    <List className="h-4 w-4" />
                  </Button>
                  <Button type="button" variant="ghost" size="icon" title="Нумерованный список">
                    <ListOrdered className="h-4 w-4" />
                  </Button>
                  <Button type="button" variant="ghost" size="icon" title="Цитата">
                    <Quote className="h-4 w-4" />
                  </Button>
                  <Separator orientation="vertical" className="h-8" />
                  <Button type="button" variant="ghost" size="icon" title="Ссылка">
                    <LinkIcon className="h-4 w-4" />
                  </Button>
                  <Button type="button" variant="ghost" size="icon" title="Изображение">
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                </div>

                {/* Editor */}
                <Textarea
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  placeholder="Напишите содержимое новости...

Поддерживается Markdown:
# Заголовок
**жирный текст**
*курсив*
- список
1. нумерованный список
[ссылка](url)"
                  className="min-h-[400px] rounded-t-none font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Поддерживается Markdown разметка
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Publish Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Публикация</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Опубликовать</Label>
                    <p className="text-xs text-muted-foreground">
                      Сделать видимой на сайте
                    </p>
                  </div>
                  <Switch
                    checked={formData.is_published}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, is_published: checked })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Категория</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      setFormData({ ...formData, category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите категорию" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Cover Image */}
            <Card>
              <CardHeader>
                <CardTitle>Обложка</CardTitle>
              </CardHeader>
              <CardContent>
                <ImageUpload
                  value={formData.cover_image}
                  onChange={(url) =>
                    setFormData({ ...formData, cover_image: url || "" })
                  }
                  disabled={isSubmitting}
                />
              </CardContent>
            </Card>

            {/* SEO */}
            <Card>
              <CardHeader>
                <CardTitle>SEO</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="meta_title">Meta Title</Label>
                  <Input
                    id="meta_title"
                    value={formData.meta_title}
                    onChange={(e) =>
                      setFormData({ ...formData, meta_title: e.target.value })
                    }
                    placeholder={formData.title || "Заголовок для поисковиков"}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="meta_description">Meta Description</Label>
                  <Textarea
                    id="meta_description"
                    value={formData.meta_description}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        meta_description: e.target.value,
                      })
                    }
                    placeholder={formData.excerpt || "Описание для поисковиков"}
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}

