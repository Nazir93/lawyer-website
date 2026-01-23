"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  Plus,
  Search,
  MoreVertical,
  Pencil,
  Trash2,
  Eye,
  Trophy,
  Calendar,
  Loader2,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { useApi } from "@/hooks/use-api";
import type { Case } from "@prisma/client";

export default function AdminCasesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  const { data: cases, isLoading, update, remove } = useApi<Case>({
    url: "/api/cases",
  });

  const filteredCases = cases.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggleActive = async (caseItem: Case) => {
    await update(caseItem.id, { isActive: !caseItem.isActive });
  };

  const handleToggleFeatured = async (caseItem: Case) => {
    await update(caseItem.id, { isFeatured: !caseItem.isFeatured });
  };

  const handleDelete = async () => {
    if (deleteId) {
      await remove(deleteId);
      setDeleteId(null);
    }
  };

  if (isLoading && cases.length === 0) {
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
          <h1 className="text-3xl font-bold text-foreground">Кейсы</h1>
          <p className="text-muted-foreground">Управление выигранными делами</p>
        </div>
        <Button asChild>
          <Link href="/admin/cases/new">
            <Plus className="mr-2 h-4 w-4" />
            Добавить кейс
          </Link>
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск кейсов..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Badge variant="secondary" className="px-3 py-1.5">
                Всего: {cases.length}
              </Badge>
              <Badge variant="outline" className="px-3 py-1.5">
                <Trophy className="mr-1 h-3 w-3" />
                Активных: {cases.filter((c) => c.isActive).length}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cases Grid */}
      {cases.length === 0 ? (
        <div className="text-center py-12">
          <Trophy className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground mb-4">Кейсов пока нет</p>
          <Button asChild>
            <Link href="/admin/cases/new">
              <Plus className="mr-2 h-4 w-4" />
              Добавить первый кейс
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCases.map((caseItem, index) => (
            <motion.div
              key={caseItem.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className={`overflow-hidden ${!caseItem.isActive ? "opacity-60" : ""}`}>
                {/* Image */}
                <div className="aspect-video bg-muted relative">
                  {caseItem.imageUrl ? (
                    <Image
                      src={caseItem.imageUrl}
                      alt={caseItem.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Trophy className="h-12 w-12 text-muted-foreground/30" />
                    </div>
                  )}
                  {caseItem.isFeatured && (
                    <div className="absolute top-2 left-2">
                      <Badge className="bg-yellow-500 text-black">
                        <Star className="mr-1 h-3 w-3" />
                        Featured
                      </Badge>
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="secondary" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/cases/${caseItem.id}`}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Редактировать
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/cases/${caseItem.slug}`} target="_blank">
                            <Eye className="mr-2 h-4 w-4" />
                            Просмотр
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleFeatured(caseItem)}>
                          <Star className="mr-2 h-4 w-4" />
                          {caseItem.isFeatured ? "Убрать из Featured" : "Сделать Featured"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => setDeleteId(caseItem.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Удалить
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <Badge variant="secondary">{caseItem.category || "Без категории"}</Badge>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {caseItem.year}
                    </div>
                  </div>

                  <h3 className="font-medium text-foreground line-clamp-2 mb-2">
                    {caseItem.title}
                  </h3>

                  <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 mb-4">
                    <Trophy className="h-4 w-4" />
                    {caseItem.result}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <span className="text-sm text-muted-foreground">
                      {caseItem.isActive ? "Опубликован" : "Скрыт"}
                    </span>
                    <Switch
                      checked={caseItem.isActive}
                      onCheckedChange={() => handleToggleActive(caseItem)}
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {filteredCases.length === 0 && cases.length > 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Кейсы не найдены</p>
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить кейс?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие нельзя отменить. Кейс будет удалён навсегда.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
