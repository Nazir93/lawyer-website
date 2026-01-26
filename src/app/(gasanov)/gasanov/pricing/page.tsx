"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Pencil,
  Trash2,
  GripVertical,
  Star,
  Loader2,
  Save,
  X,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface Pricing {
  id: string;
  name: string;
  description: string | null;
  price: string;
  priceNote: string | null;
  features: string[];
  isPopular: boolean;
  sortOrder: number;
  isActive: boolean;
}

export default function AdminPricingPage() {
  const [pricing, setPricing] = useState<Pricing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Pricing | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    priceNote: "",
    features: "",
    isPopular: false,
    isActive: true,
  });

  useEffect(() => {
    fetchPricing();
  }, []);

  const fetchPricing = async () => {
    try {
      const res = await fetch("/api/pricing");
      const data = await res.json();
      if (data.data) {
        setPricing(data.data);
      }
    } catch (error) {
      console.error("Error fetching pricing:", error);
      toast.error("Ошибка загрузки тарифов");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingItem(null);
    setFormData({
      name: "",
      description: "",
      price: "",
      priceNote: "",
      features: "",
      isPopular: false,
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleEdit = (item: Pricing) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description || "",
      price: item.price,
      priceNote: item.priceNote || "",
      features: item.features.join("\n"),
      isPopular: item.isPopular,
      isActive: item.isActive,
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.price) {
      toast.error("Заполните название и цену");
      return;
    }

    setIsSaving(true);

    try {
      const payload = {
        name: formData.name,
        description: formData.description || null,
        price: formData.price,
        price_note: formData.priceNote || null,
        features: formData.features.split("\n").filter((f) => f.trim()),
        is_popular: formData.isPopular,
        is_active: formData.isActive,
      };

      const url = editingItem
        ? `/api/pricing/${editingItem.id}`
        : "/api/pricing";
      const method = editingItem ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Ошибка сохранения");
      }

      toast.success(editingItem ? "Тариф обновлён" : "Тариф создан");
      setIsModalOpen(false);
      fetchPricing();
    } catch (error: any) {
      toast.error(error.message || "Ошибка сохранения");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const res = await fetch(`/api/pricing/${deleteId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Тариф удалён");
        setPricing(pricing.filter((p) => p.id !== deleteId));
      } else {
        throw new Error("Ошибка удаления");
      }
    } catch (error) {
      toast.error("Ошибка удаления тарифа");
    } finally {
      setDeleteId(null);
    }
  };

  const toggleActive = async (item: Pricing) => {
    try {
      const res = await fetch(`/api/pricing/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !item.isActive }),
      });

      if (res.ok) {
        setPricing(
          pricing.map((p) =>
            p.id === item.id ? { ...p, isActive: !p.isActive } : p
          )
        );
      }
    } catch (error) {
      toast.error("Ошибка изменения статуса");
    }
  };

  const togglePopular = async (item: Pricing) => {
    try {
      const res = await fetch(`/api/pricing/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_popular: !item.isPopular }),
      });

      if (res.ok) {
        setPricing(
          pricing.map((p) =>
            p.id === item.id ? { ...p, isPopular: !p.isPopular } : p
          )
        );
      }
    } catch (error) {
      toast.error("Ошибка изменения статуса");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Тарифы</h1>
          <p className="text-muted-foreground">
            Управление ценами на услуги
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Добавить тариф
        </Button>
      </div>

      {/* Pricing Cards */}
      {pricing.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">Тарифы не добавлены</p>
            <Button onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Создать первый тариф
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {pricing.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  className={`relative ${
                    !item.isActive ? "opacity-60" : ""
                  } ${item.isPopular ? "ring-2 ring-primary" : ""}`}
                >
                  {item.isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-primary">
                        <Star className="mr-1 h-3 w-3" />
                        Популярный
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl">{item.name}</CardTitle>
                        {item.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {item.description}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(item)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(item.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Price */}
                    <div>
                      <p className="text-3xl font-bold">{item.price}</p>
                      {item.priceNote && (
                        <p className="text-sm text-muted-foreground">
                          {item.priceNote}
                        </p>
                      )}
                    </div>

                    {/* Features */}
                    {item.features.length > 0 && (
                      <ul className="space-y-2">
                        {item.features.slice(0, 5).map((feature, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-2 text-sm"
                          >
                            <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                            <span>{feature}</span>
                          </li>
                        ))}
                        {item.features.length > 5 && (
                          <li className="text-sm text-muted-foreground">
                            +{item.features.length - 5} ещё...
                          </li>
                        )}
                      </ul>
                    )}

                    {/* Controls */}
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={item.isActive}
                          onCheckedChange={() => toggleActive(item)}
                        />
                        <span className="text-sm text-muted-foreground">
                          {item.isActive ? "Активен" : "Скрыт"}
                        </span>
                      </div>
                      <Button
                        variant={item.isPopular ? "default" : "outline"}
                        size="sm"
                        onClick={() => togglePopular(item)}
                      >
                        <Star
                          className={`h-3 w-3 mr-1 ${
                            item.isPopular ? "fill-current" : ""
                          }`}
                        />
                        {item.isPopular ? "Популярный" : "Сделать популярным"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Редактировать тариф" : "Новый тариф"}
            </DialogTitle>
            <DialogDescription>
              Заполните информацию о тарифе
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Название *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Консультация"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Цена *</Label>
              <Input
                id="price"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                placeholder="от 5 000 ₽"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priceNote">Примечание к цене</Label>
              <Input
                id="priceNote"
                value={formData.priceNote}
                onChange={(e) =>
                  setFormData({ ...formData, priceNote: e.target.value })
                }
                placeholder="за 1 час"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Описание</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Краткое описание тарифа..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="features">
                Что входит (каждый пункт с новой строки)
              </Label>
              <Textarea
                id="features"
                value={formData.features}
                onChange={(e) =>
                  setFormData({ ...formData, features: e.target.value })
                }
                placeholder="Анализ документов
Правовая экспертиза
Составление заключения"
                rows={5}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Популярный тариф</Label>
                <p className="text-xs text-muted-foreground">
                  Выделить на странице
                </p>
              </div>
              <Switch
                checked={formData.isPopular}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isPopular: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Активен</Label>
                <p className="text-xs text-muted-foreground">
                  Показывать на сайте
                </p>
              </div>
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isActive: checked })
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
              {editingItem ? "Сохранить" : "Создать"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить тариф?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие нельзя отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground"
            >
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

