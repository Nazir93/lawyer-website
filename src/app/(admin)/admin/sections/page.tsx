"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Pencil,
  Trash2,
  GripVertical,
  Eye,
  EyeOff,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

// Временные данные
const initialSections = [
  {
    id: "1",
    title: "Юридическим лицам",
    slug: "business",
    description: "Юридическое сопровождение бизнеса, защита интересов компании",
    image_url: null,
    is_active: true,
    sort_order: 1,
    services_count: 12,
  },
  {
    id: "2",
    title: "Физическим лицам",
    slug: "individual",
    description: "Семейное право, наследственные споры, защита прав",
    image_url: null,
    is_active: true,
    sort_order: 2,
    services_count: 10,
  },
  {
    id: "3",
    title: "Спецпредложения",
    slug: "special",
    description: "Особые условия и пакетные предложения",
    image_url: null,
    is_active: true,
    sort_order: 3,
    services_count: 4,
  },
];

export default function SectionsPage() {
  const [sections, setSections] = useState(initialSections);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    is_active: true,
  });

  const handleCreate = () => {
    setEditingSection(null);
    setFormData({ title: "", slug: "", description: "", is_active: true });
    setIsModalOpen(true);
  };

  const handleEdit = (section: any) => {
    setEditingSection(section);
    setFormData({
      title: section.title,
      slug: section.slug,
      description: section.description || "",
      is_active: section.is_active,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setSections(sections.filter((s) => s.id !== id));
    toast.success("Раздел удалён");
  };

  const handleSave = () => {
    if (!formData.title) {
      toast.error("Введите название раздела");
      return;
    }

    if (editingSection) {
      // Редактирование
      setSections(
        sections.map((s) =>
          s.id === editingSection.id ? { ...s, ...formData } : s
        )
      );
      toast.success("Раздел обновлён");
    } else {
      // Создание
      const newSection = {
        id: crypto.randomUUID(),
        ...formData,
        image_url: null,
        sort_order: sections.length + 1,
        services_count: 0,
      };
      setSections([...sections, newSection]);
      toast.success("Раздел создан");
    }

    setIsModalOpen(false);
  };

  const toggleActive = (id: string) => {
    setSections(
      sections.map((s) =>
        s.id === id ? { ...s, is_active: !s.is_active } : s
      )
    );
  };

  // Автогенерация slug из названия
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Разделы</h1>
          <p className="text-muted-foreground">
            Управление разделами на главной странице
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Создать раздел
        </Button>
      </div>

      {/* Sections List */}
      <div className="space-y-4">
        <AnimatePresence>
          {sections.map((section, index) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card
                className={`transition-all ${
                  !section.is_active ? "opacity-60" : ""
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Drag Handle */}
                    <div className="cursor-grab text-muted-foreground hover:text-foreground">
                      <GripVertical className="h-5 w-5" />
                    </div>

                    {/* Image Placeholder */}
                    <div className="w-20 h-20 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      {section.image_url ? (
                        <img
                          src={section.image_url}
                          alt={section.title}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <span className="text-2xl text-muted-foreground">
                          📁
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground truncate">
                          {section.title}
                        </h3>
                        <Badge
                          variant={section.is_active ? "default" : "secondary"}
                        >
                          {section.is_active ? "Активен" : "Скрыт"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                        {section.description}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span>Slug: /{section.slug}</span>
                        <span>•</span>
                        <span>{section.services_count} услуг</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleActive(section.id)}
                      >
                        {section.is_active ? (
                          <Eye className="h-4 w-4" />
                        ) : (
                          <EyeOff className="h-4 w-4" />
                        )}
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(section)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Редактировать
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDelete(section.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Удалить
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Create/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingSection ? "Редактировать раздел" : "Создать раздел"}
            </DialogTitle>
            <DialogDescription>
              {editingSection
                ? "Измените данные раздела"
                : "Заполните данные для нового раздела"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Название *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    title: e.target.value,
                    slug: generateSlug(e.target.value),
                  });
                }}
                placeholder="Юридическим лицам"
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
                placeholder="business"
              />
              <p className="text-xs text-muted-foreground">
                Будет использоваться в URL: /services/{formData.slug || "..."}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Описание</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Краткое описание раздела..."
                rows={3}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="is_active">Активен</Label>
                <p className="text-xs text-muted-foreground">
                  Показывать на сайте
                </p>
              </div>
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_active: checked })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleSave}>
              {editingSection ? "Сохранить" : "Создать"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

