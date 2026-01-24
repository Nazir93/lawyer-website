"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import {
  Plus,
  Pencil,
  Trash2,
  GripVertical,
  Eye,
  EyeOff,
  MoreHorizontal,
  ChevronDown,
  ChevronRight,
  FolderPlus,
  Loader2,
  Save,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { ImageUpload } from "@/components/admin/image-upload";

interface Section {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  icon: string | null;
  parent_id: string | null;
  sort_order: number;
  is_active: boolean;
  services_count: number;
  children_count: number;
  children?: Section[];
}

export default function SectionsPage() {
  const [sections, setSections] = useState<Section[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [hasOrderChanges, setHasOrderChanges] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    image_url: "",
    icon: "",
    parent_id: "",
    is_active: true,
  });

  // Загрузка разделов
  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      const res = await fetch("/api/sections?includeChildren=true");
      const result = await res.json();
      if (result.data) {
        setSections(result.data);
      }
    } catch (error) {
      console.error("Error fetching sections:", error);
      toast.error("Ошибка загрузки разделов");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = (parentId?: string) => {
    setEditingSection(null);
    setFormData({
      name: "",
      slug: "",
      description: "",
      image_url: "",
      icon: "",
      parent_id: parentId || "",
      is_active: true,
    });
    setIsModalOpen(true);
  };

  const handleEdit = (section: Section) => {
    setEditingSection(section);
    setFormData({
      name: section.name,
      slug: section.slug,
      description: section.description || "",
      image_url: section.image_url || "",
      icon: section.icon || "",
      parent_id: section.parent_id || "",
      is_active: section.is_active,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Удалить раздел? Все подразделы также будут удалены.")) {
      return;
    }

    try {
      const res = await fetch(`/api/sections/${id}`, { method: "DELETE" });
      if (res.ok) {
        setSections(sections.filter((s) => s.id !== id));
        toast.success("Раздел удалён");
      } else {
        throw new Error("Failed to delete");
      }
    } catch (error) {
      toast.error("Ошибка удаления раздела");
    }
  };

  const handleSave = async () => {
    if (!formData.name) {
      toast.error("Введите название раздела");
      return;
    }

    setIsSaving(true);

    try {
      const url = editingSection
        ? `/api/sections/${editingSection.id}`
        : "/api/sections";
      const method = editingSection ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Ошибка сохранения");
      }

      toast.success(editingSection ? "Раздел обновлён" : "Раздел создан");
      setIsModalOpen(false);
      fetchSections(); // Перезагружаем список
    } catch (error: any) {
      toast.error(error.message || "Ошибка сохранения раздела");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleActive = async (section: Section) => {
    try {
      const res = await fetch(`/api/sections/${section.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...section, is_active: !section.is_active }),
      });

      if (res.ok) {
        setSections(
          sections.map((s) =>
            s.id === section.id ? { ...s, is_active: !s.is_active } : s
          )
        );
      }
    } catch (error) {
      toast.error("Ошибка изменения статуса");
    }
  };

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedSections(newExpanded);
  };

  // Обработка drag-and-drop
  const handleReorder = (newOrder: Section[]) => {
    setSections(newOrder);
    setHasOrderChanges(true);
  };

  const saveOrder = async () => {
    setIsSaving(true);
    try {
      const reorderData = sections.map((s, index) => ({
        id: s.id,
        sort_order: index,
      }));

      const res = await fetch("/api/sections/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sections: reorderData }),
      });

      if (res.ok) {
        toast.success("Порядок сохранён");
        setHasOrderChanges(false);
      } else {
        throw new Error("Failed to save order");
      }
    } catch (error) {
      toast.error("Ошибка сохранения порядка");
    } finally {
      setIsSaving(false);
    }
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Разделы</h1>
          <p className="text-muted-foreground">
            Управление разделами сайта. Перетащите для изменения порядка.
          </p>
        </div>
        <div className="flex gap-2">
          {hasOrderChanges && (
            <Button onClick={saveOrder} disabled={isSaving} variant="outline">
              {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Сохранить порядок
            </Button>
          )}
          <Button onClick={() => handleCreate()}>
            <Plus className="mr-2 h-4 w-4" />
            Создать раздел
          </Button>
        </div>
      </div>

      {/* Sections List with Drag-and-Drop */}
      {sections.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground mb-4">Разделы пока не созданы</p>
            <Button onClick={() => handleCreate()}>
              <Plus className="mr-2 h-4 w-4" />
              Создать первый раздел
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Reorder.Group
          axis="y"
          values={sections}
          onReorder={handleReorder}
          className="space-y-3"
        >
          {sections.map((section) => (
            <Reorder.Item
              key={section.id}
              value={section}
              className="list-none"
            >
              <Card
                className={`transition-all cursor-grab active:cursor-grabbing ${
                  !section.is_active ? "opacity-60" : ""
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Drag Handle */}
                    <div className="text-muted-foreground hover:text-foreground">
                      <GripVertical className="h-5 w-5" />
                    </div>

                    {/* Expand/Collapse for children */}
                    {section.children_count > 0 ? (
                      <button
                        onClick={() => toggleExpand(section.id)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        {expandedSections.has(section.id) ? (
                          <ChevronDown className="h-5 w-5" />
                        ) : (
                          <ChevronRight className="h-5 w-5" />
                        )}
                      </button>
                    ) : (
                      <div className="w-5" />
                    )}

                    {/* Image */}
                    <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      {section.image_url ? (
                        <img
                          src={section.image_url}
                          alt={section.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <span className="text-2xl text-muted-foreground">
                          {section.icon || "📁"}
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground truncate">
                          {section.name}
                        </h3>
                        <Badge variant={section.is_active ? "default" : "secondary"}>
                          {section.is_active ? "Активен" : "Скрыт"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                        {section.description || "Без описания"}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span>/{section.slug}</span>
                        <span>•</span>
                        <span>{section.services_count} услуг</span>
                        {section.children_count > 0 && (
                          <>
                            <span>•</span>
                            <span>{section.children_count} подразделов</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleActive(section)}
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
                          <DropdownMenuItem onClick={() => handleCreate(section.id)}>
                            <FolderPlus className="mr-2 h-4 w-4" />
                            Добавить подраздел
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

                  {/* Children (Subsections) */}
                  <AnimatePresence>
                    {expandedSections.has(section.id) && section.children && section.children.length > 0 && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-4 ml-12 space-y-2 border-l-2 border-muted pl-4">
                          {section.children.map((child) => (
                            <div
                              key={child.id}
                              className={`flex items-center gap-3 p-3 rounded-lg bg-muted/50 ${
                                !child.is_active ? "opacity-60" : ""
                              }`}
                            >
                              <div className="w-10 h-10 rounded bg-muted flex items-center justify-center shrink-0">
                                <span className="text-lg">{child.icon || "📄"}</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium truncate">{child.name}</span>
                                  <Badge variant={child.is_active ? "outline" : "secondary"} className="text-xs">
                                    {child.is_active ? "Активен" : "Скрыт"}
                                  </Badge>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  /{child.slug} • {child.services_count} услуг
                                </div>
                              </div>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEdit(child)}
                                >
                                  <Pencil className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(child.id)}
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </Reorder.Item>
          ))}
        </Reorder.Group>
      )}

      {/* Create/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingSection ? "Редактировать раздел" : "Создать раздел"}
            </DialogTitle>
            <DialogDescription>
              {formData.parent_id
                ? "Создание подраздела"
                : editingSection
                ? "Измените данные раздела"
                : "Заполните данные для нового раздела"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Родительский раздел */}
            {sections.length > 0 && (
              <div className="space-y-2">
                <Label>Родительский раздел</Label>
                <Select
                  value={formData.parent_id || "none"}
                  onValueChange={(value) =>
                    setFormData({ ...formData, parent_id: value === "none" ? "" : value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Корневой раздел" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Корневой раздел</SelectItem>
                    {sections
                      .filter((s) => s.id !== editingSection?.id)
                      .map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Название *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    name: e.target.value,
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
                URL: /services/{formData.slug || "..."}
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

            <div className="space-y-2">
              <Label>Изображение</Label>
              <ImageUpload
                value={formData.image_url || null}
                onChange={(url) => setFormData({ ...formData, image_url: url || "" })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="icon">Иконка (эмодзи)</Label>
              <Input
                id="icon"
                value={formData.icon}
                onChange={(e) =>
                  setFormData({ ...formData, icon: e.target.value })
                }
                placeholder="📁"
                maxLength={4}
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
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingSection ? "Сохранить" : "Создать"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
