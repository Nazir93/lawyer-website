"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Plus,
  Search,
  MoreVertical,
  Pencil,
  Trash2,
  Eye,
  Clock,
  Calendar,
  Loader2,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import type { News } from "@prisma/client";

export default function AdminNewsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  const { data: news, isLoading, update, remove } = useApi<News>({
    url: "/api/news",
  });

  const filteredNews = news.filter((n) =>
    n.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleTogglePublished = async (newsItem: News) => {
    await update(newsItem.id, { 
      isPublished: !newsItem.isPublished,
      publishedAt: !newsItem.isPublished ? new Date() : null,
    });
  };

  const handleDelete = async () => {
    if (deleteId) {
      await remove(deleteId);
      setDeleteId(null);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    try {
      return new Date(dateStr).toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  if (isLoading && news.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const stats = {
    total: news.length,
    published: news.filter((n) => n.isPublished).length,
    drafts: news.filter((n) => !n.isPublished).length,
    views: news.reduce((acc, n) => acc + (n.views || 0), 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Новости</h1>
          <p className="text-muted-foreground">Управление блогом и новостями</p>
        </div>
        <Button asChild>
          <Link href="/admin/news/new">
            <Plus className="mr-2 h-4 w-4" />
            Создать новость
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Всего</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Опубликовано</p>
            <p className="text-2xl font-bold text-green-600">{stats.published}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Черновики</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.drafts}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Просмотров</p>
            <p className="text-2xl font-bold">
              {stats.views.toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Поиск новостей..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      {news.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">Новостей пока нет</p>
          <Button asChild>
            <Link href="/admin/news/new">
              <Plus className="mr-2 h-4 w-4" />
              Создать первую новость
            </Link>
          </Button>
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Заголовок</TableHead>
                  <TableHead className="text-center">Просмотры</TableHead>
                  <TableHead>Дата</TableHead>
                  <TableHead className="text-center">Статус</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredNews.map((item, index) => (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="group"
                  >
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground line-clamp-1">
                          {item.title}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          /news/{item.slug}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-center text-muted-foreground">
                      {item.views?.toLocaleString() || 0}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        {item.publishedAt ? formatDate(item.publishedAt.toISOString()) : "—"}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Switch
                          checked={item.isPublished}
                          onCheckedChange={() => handleTogglePublished(item)}
                        />
                        {item.isPublished ? (
                          <Eye className="h-4 w-4 text-green-600" />
                        ) : (
                          <Clock className="h-4 w-4 text-yellow-600" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/news/${item.id}`}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Редактировать
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/news/${item.slug}`} target="_blank">
                              <Eye className="mr-2 h-4 w-4" />
                              Просмотр
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => setDeleteId(item.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Удалить
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {filteredNews.length === 0 && news.length > 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Новости не найдены</p>
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить новость?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие нельзя отменить. Новость будет удалена навсегда.
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
