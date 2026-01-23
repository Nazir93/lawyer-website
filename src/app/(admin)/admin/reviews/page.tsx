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
  Star,
  CheckCircle,
  XCircle,
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
import type { Review } from "@prisma/client";

export default function AdminReviewsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  const { data: reviews, isLoading, update, remove } = useApi<Review>({
    url: "/api/reviews",
  });

  const filteredReviews = reviews.filter((r) =>
    r.authorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggleActive = async (review: Review) => {
    await update(review.id, { isActive: !review.isActive });
  };

  const handleToggleVerified = async (review: Review) => {
    await update(review.id, { isVerified: !review.isVerified });
  };

  const handleDelete = async () => {
    if (deleteId) {
      await remove(deleteId);
      setDeleteId(null);
    }
  };

  if (isLoading && reviews.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const stats = {
    total: reviews.length,
    active: reviews.filter((r) => r.isActive).length,
    verified: reviews.filter((r) => r.isVerified).length,
    averageRating: reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
      : "0",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Отзывы</h1>
          <p className="text-muted-foreground">Управление отзывами клиентов</p>
        </div>
        <Button asChild>
          <Link href="/admin/reviews/new">
            <Plus className="mr-2 h-4 w-4" />
            Добавить отзыв
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
            <p className="text-sm text-muted-foreground">Активных</p>
            <p className="text-2xl font-bold text-green-600">{stats.active}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Проверенных</p>
            <p className="text-2xl font-bold text-blue-600">{stats.verified}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Средняя оценка</p>
            <p className="text-2xl font-bold">{stats.averageRating} ⭐</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Поиск отзывов..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="text-center py-12">
          <Star className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground mb-4">Отзывов пока нет</p>
          <Button asChild>
            <Link href="/admin/reviews/new">
              <Plus className="mr-2 h-4 w-4" />
              Добавить первый отзыв
            </Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
            >
              <Card className={!review.isActive ? "opacity-60" : ""}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-muted-foreground/30"
                              }`}
                            />
                          ))}
                        </div>
                        {review.isVerified && (
                          <Badge variant="default" className="gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Проверен
                          </Badge>
                        )}
                        {!review.isActive && (
                          <Badge variant="secondary">Скрыт</Badge>
                        )}
                      </div>

                      <p className="text-foreground mb-3 leading-relaxed">
                        {review.content}
                      </p>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">
                          {review.authorName}
                        </span>
                        {review.authorPosition && (
                          <>
                            <span>•</span>
                            <span>{review.authorPosition}</span>
                          </>
                        )}
                        {review.authorCompany && (
                          <>
                            <span>•</span>
                            <span>{review.authorCompany}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex flex-col gap-2">
                        <Switch
                          checked={review.isActive}
                          onCheckedChange={() => handleToggleActive(review)}
                        />
                        <Switch
                          checked={review.isVerified}
                          onCheckedChange={() => handleToggleVerified(review)}
                        />
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/reviews/${review.id}`}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Редактировать
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => setDeleteId(review.id)}
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
        </div>
      )}

      {filteredReviews.length === 0 && reviews.length > 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Отзывы не найдены</p>
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить отзыв?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие нельзя отменить. Отзыв будет удалён навсегда.
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

