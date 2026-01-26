"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Save,
  Image as ImageIcon,
  Video,
  Type,
  Link as LinkIcon,
  Eye,
  Loader2,
  Plus,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { ImageUpload } from "@/components/gasanov/image-upload";

interface HeroData {
  content_type: 'image' | 'video';
  image_url?: string | null;
  video_url?: string | null;
  video_type?: 'youtube' | 'vimeo' | 'file' | null;
  title?: string | null;
  subtitle?: string | null;
  description?: string | null;
  primary_button_text?: string | null;
  primary_button_link?: string | null;
  secondary_button_text?: string | null;
  secondary_button_link?: string | null;
  badge_text?: string | null;
  show_badge?: boolean;
  stats?: Array<{ value: string; label: string }>;
  overlay_opacity?: number;
  text_position?: 'left' | 'center' | 'right';
  is_active?: boolean;
  sort_order?: number;
}

export default function AdminHeroPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [heroData, setHeroData] = useState<HeroData>({
    content_type: 'image',
    title: '',
    subtitle: '',
    description: '',
    primary_button_text: 'Получить консультацию',
    primary_button_link: '/contacts',
    secondary_button_text: 'Смотреть кейсы',
    secondary_button_link: '/cases',
    badge_text: 'Бесплатная консультация',
    show_badge: true,
    stats: [
      { value: "500+", label: "Выигранных дел" },
      { value: "15", label: "Лет опыта" },
      { value: "98%", label: "Довольных клиентов" },
      { value: "24/7", label: "Поддержка" },
    ],
    overlay_opacity: 0.3,
    text_position: 'center',
    is_active: true,
    sort_order: 0,
  });

  useEffect(() => {
    async function fetchHero() {
      try {
        const res = await fetch("/api/hero");
        const data = await res.json();
        if (data.data) {
          setHeroData({
            ...data.data,
            stats: data.data.stats || heroData.stats,
          });
        }
      } catch (error) {
        console.error("Error fetching hero:", error);
      } finally {
        setIsFetching(false);
      }
    }
    fetchHero();
  }, []);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Подготавливаем данные для отправки
      const dataToSend = {
        ...heroData,
        // Убеждаемся, что overlay_opacity - число
        overlay_opacity: typeof heroData.overlay_opacity === 'string' 
          ? parseFloat(heroData.overlay_opacity) 
          : heroData.overlay_opacity,
        // Убеждаемся, что stats - массив
        stats: Array.isArray(heroData.stats) ? heroData.stats : [],
        // Убеждаемся, что sort_order - число
        sort_order: typeof heroData.sort_order === 'string' 
          ? parseInt(heroData.sort_order) 
          : heroData.sort_order,
      };

      const res = await fetch("/api/hero", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });

      const result = await res.json();

      if (!res.ok) {
        // Показываем детальную ошибку
        let errorMsg = result.error || "Ошибка сохранения";
        
        if (result.code === "TABLE_NOT_FOUND") {
          errorMsg = `Таблица hero_section не найдена. ${result.hint || "Выполните npx prisma db push для создания таблиц"}`;
        } else if (result.details) {
          errorMsg = `${result.error}: ${result.details}`;
        } else if (result.error) {
          errorMsg = result.error;
        }
        
        throw new Error(errorMsg);
      }

      toast.success("Hero контент успешно сохранён!");
    } catch (error: any) {
      console.error("Save error:", error);
      toast.error(error.message || "Ошибка сохранения hero контента");
    } finally {
      setIsLoading(false);
    }
  };

  const addStat = () => {
    setHeroData({
      ...heroData,
      stats: [...(heroData.stats || []), { value: "", label: "" }],
    });
  };

  const removeStat = (index: number) => {
    setHeroData({
      ...heroData,
      stats: heroData.stats?.filter((_, i) => i !== index) || [],
    });
  };

  const updateStat = (index: number, field: 'value' | 'label', value: string) => {
    const newStats = [...(heroData.stats || [])];
    newStats[index] = { ...newStats[index], [field]: value };
    setHeroData({ ...heroData, stats: newStats });
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8 max-w-6xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Управление Hero</h1>
            <p className="text-muted-foreground mt-1">
              Настройте главный экран сайта: добавьте видео, изображения и текст
            </p>
          </div>
          <Button onClick={handleSave} disabled={isLoading} size="lg">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Сохранение...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Сохранить
              </>
            )}
          </Button>
        </div>

        <Tabs defaultValue="media" className="space-y-6">
          <TabsList>
            <TabsTrigger value="media">Медиа</TabsTrigger>
            <TabsTrigger value="content">Контент</TabsTrigger>
            <TabsTrigger value="buttons">Кнопки</TabsTrigger>
            <TabsTrigger value="stats">Статистика</TabsTrigger>
            <TabsTrigger value="settings">Настройки</TabsTrigger>
          </TabsList>

          {/* Медиа */}
          <TabsContent value="media" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Тип контента</CardTitle>
                <CardDescription>Выберите изображение или видео для фона</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Тип контента</Label>
                  <Select
                    value={heroData.content_type}
                    onValueChange={(value: 'image' | 'video') =>
                      setHeroData({ ...heroData, content_type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="image">Изображение</SelectItem>
                      <SelectItem value="video">Видео</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {heroData.content_type === 'image' ? (
                  <div className="space-y-2">
                    <Label>Изображение</Label>
                    <ImageUpload
                      value={heroData.image_url || ""}
                      onChange={(url) => setHeroData({ ...heroData, image_url: url })}
                    />
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label>Тип видео</Label>
                      <Select
                        value={heroData.video_type || 'youtube'}
                        onValueChange={(value: 'youtube' | 'vimeo' | 'file') =>
                          setHeroData({ ...heroData, video_type: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="youtube">YouTube</SelectItem>
                          <SelectItem value="vimeo">Vimeo</SelectItem>
                          <SelectItem value="file">Прямая ссылка на файл</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>URL видео</Label>
                      <Input
                        value={heroData.video_url || ""}
                        onChange={(e) => setHeroData({ ...heroData, video_url: e.target.value })}
                        placeholder={
                          heroData.video_type === 'youtube'
                            ? "https://www.youtube.com/watch?v=..."
                            : heroData.video_type === 'vimeo'
                            ? "https://vimeo.com/..."
                            : "https://example.com/video.mp4"
                        }
                      />
                      <p className="text-xs text-muted-foreground">
                        {heroData.video_type === 'youtube' &&
                          "Вставьте полную ссылку на YouTube видео"}
                        {heroData.video_type === 'vimeo' &&
                          "Вставьте полную ссылку на Vimeo видео"}
                        {heroData.video_type === 'file' &&
                          "Вставьте прямую ссылку на видео файл (MP4, WebM и т.д.)"}
                      </p>
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label>Прозрачность затемнения (0-1)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="1"
                    value={heroData.overlay_opacity || 0.3}
                    onChange={(e) =>
                      setHeroData({
                        ...heroData,
                        overlay_opacity: parseFloat(e.target.value) || 0.3,
                      })
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Контент */}
          <TabsContent value="content" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Текстовый контент</CardTitle>
                <CardDescription>Заголовки и описание для главного экрана</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Подзаголовок</Label>
                  <Input
                    value={heroData.subtitle || ""}
                    onChange={(e) => setHeroData({ ...heroData, subtitle: e.target.value })}
                    placeholder="Гасанов А. Адвокат"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Заголовок</Label>
                  <Input
                    value={heroData.title || ""}
                    onChange={(e) => setHeroData({ ...heroData, title: e.target.value })}
                    placeholder="Юридическая защита высшего класса"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Описание</Label>
                  <Textarea
                    value={heroData.description || ""}
                    onChange={(e) => setHeroData({ ...heroData, description: e.target.value })}
                    placeholder="15 лет опыта. 500+ выигранных дел..."
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Позиция текста</Label>
                  <Select
                    value={heroData.text_position || 'center'}
                    onValueChange={(value: 'left' | 'center' | 'right') =>
                      setHeroData({ ...heroData, text_position: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="left">Слева</SelectItem>
                      <SelectItem value="center">По центру</SelectItem>
                      <SelectItem value="right">Справа</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Кнопки */}
          <TabsContent value="buttons" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Кнопки призыва к действию</CardTitle>
                <CardDescription>Настройте кнопки и ссылки</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-medium">Основная кнопка</h3>
                    <div className="space-y-2">
                      <Label>Текст</Label>
                      <Input
                        value={heroData.primary_button_text || ""}
                        onChange={(e) =>
                          setHeroData({ ...heroData, primary_button_text: e.target.value })
                        }
                        placeholder="Получить консультацию"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Ссылка</Label>
                      <Input
                        value={heroData.primary_button_link || ""}
                        onChange={(e) =>
                          setHeroData({ ...heroData, primary_button_link: e.target.value })
                        }
                        placeholder="/contacts"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-medium">Вторичная кнопка</h3>
                    <div className="space-y-2">
                      <Label>Текст</Label>
                      <Input
                        value={heroData.secondary_button_text || ""}
                        onChange={(e) =>
                          setHeroData({ ...heroData, secondary_button_text: e.target.value })
                        }
                        placeholder="Смотреть кейсы"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Ссылка</Label>
                      <Input
                        value={heroData.secondary_button_link || ""}
                        onChange={(e) =>
                          setHeroData({ ...heroData, secondary_button_link: e.target.value })
                        }
                        placeholder="/cases"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Бейдж</Label>
                      <p className="text-sm text-muted-foreground">
                        Показывать бейдж с текстом над заголовком
                      </p>
                    </div>
                    <Switch
                      checked={heroData.show_badge}
                      onCheckedChange={(checked) =>
                        setHeroData({ ...heroData, show_badge: checked })
                      }
                    />
                  </div>
                  {heroData.show_badge && (
                    <div className="space-y-2">
                      <Label>Текст бейджа</Label>
                      <Input
                        value={heroData.badge_text || ""}
                        onChange={(e) => setHeroData({ ...heroData, badge_text: e.target.value })}
                        placeholder="Бесплатная консультация"
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Статистика */}
          <TabsContent value="stats" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Статистика</CardTitle>
                <CardDescription>Добавьте статистические данные для отображения</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {heroData.stats?.map((stat, index) => (
                  <div key={index} className="flex gap-4 items-end">
                    <div className="flex-1 space-y-2">
                      <Label>Значение</Label>
                      <Input
                        value={stat.value}
                        onChange={(e) => updateStat(index, 'value', e.target.value)}
                        placeholder="500+"
                      />
                    </div>
                    <div className="flex-1 space-y-2">
                      <Label>Подпись</Label>
                      <Input
                        value={stat.label}
                        onChange={(e) => updateStat(index, 'label', e.target.value)}
                        placeholder="Выигранных дел"
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => removeStat(index)}
                      disabled={heroData.stats?.length === 1}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" onClick={addStat} className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Добавить статистику
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Настройки */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Дополнительные настройки</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Активен</Label>
                    <p className="text-sm text-muted-foreground">
                      Показывать этот hero на главной странице
                    </p>
                  </div>
                  <Switch
                    checked={heroData.is_active}
                    onCheckedChange={(checked) =>
                      setHeroData({ ...heroData, is_active: checked })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Порядок сортировки</Label>
                  <Input
                    type="number"
                    value={heroData.sort_order || 0}
                    onChange={(e) =>
                      setHeroData({ ...heroData, sort_order: parseInt(e.target.value) || 0 })
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}

