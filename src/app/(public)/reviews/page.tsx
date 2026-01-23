"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, Quote, Loader2, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDateShort } from "@/lib/utils/date";
import Link from "next/link";

interface Review {
  id: string;
  authorName: string;
  authorPosition: string | null;
  authorCompany: string | null;
  authorPhotoUrl: string | null;
  content: string;
  rating: number;
  serviceId: string | null;
  isVerified: boolean;
  createdAt: string;
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "5" | "4" | "3">("all");

  useEffect(() => {
    loadReviews();
  }, [filter]);

  const loadReviews = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      params.append("active", "true");
      if (filter !== "all") {
        params.append("rating", filter);
      }
      
      const res = await fetch(`/api/reviews?${params}`);
      const data = await res.json();
      
      if (res.ok) {
        setReviews(data.data || []);
      }
    } catch (error) {
      console.error("Error loading reviews:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  const ratingDistribution = {
    5: reviews.filter(r => r.rating === 5).length,
    4: reviews.filter(r => r.rating === 4).length,
    3: reviews.filter(r => r.rating === 3).length,
    2: reviews.filter(r => r.rating === 2).length,
    1: reviews.filter(r => r.rating === 1).length,
  };

  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl sm:text-5xl font-light tracking-tight mb-4">
            Отзывы <span className="font-serif italic">клиентов</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Реальные отзывы от наших клиентов о качестве юридических услуг
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar with Stats */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <div className="text-5xl font-light mb-2">
                    {averageRating.toFixed(1)}
                  </div>
                  <div className="flex items-center justify-center gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-5 w-5 ${
                          star <= Math.round(averageRating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-muted-foreground"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {reviews.length} отзывов
                  </p>
                </div>

                <div className="space-y-3 mb-6">
                  <p className="text-sm font-medium mb-3">Фильтр по рейтингу</p>
                  <Button
                    variant={filter === "all" ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={() => setFilter("all")}
                  >
                    Все отзывы ({reviews.length})
                  </Button>
                  <Button
                    variant={filter === "5" ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={() => setFilter("5")}
                  >
                    ⭐ 5 звезд ({ratingDistribution[5]})
                  </Button>
                  <Button
                    variant={filter === "4" ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={() => setFilter("4")}
                  >
                    ⭐ 4 звезды ({ratingDistribution[4]})
                  </Button>
                  <Button
                    variant={filter === "3" ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={() => setFilter("3")}
                  >
                    ⭐ 3 звезды ({ratingDistribution[3]})
                  </Button>
                </div>

                <div className="pt-6 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-3">
                    Распределение оценок
                  </p>
                  <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map((rating) => {
                      const count = ratingDistribution[rating as keyof typeof ratingDistribution];
                      const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                      return (
                        <div key={rating} className="flex items-center gap-2">
                          <span className="text-xs w-8">{rating} ⭐</span>
                          <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                            <div
                              className="h-full bg-foreground transition-all"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground w-8 text-right">
                            {count}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Reviews List */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : reviews.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Quote className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">Пока нет отзывов</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {reviews.map((review, index) => (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="hover:border-foreground/20 transition-colors">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          {/* Avatar */}
                          <div className="w-12 h-12 rounded-full bg-foreground text-background flex items-center justify-center text-lg font-medium shrink-0">
                            {review.authorPhotoUrl ? (
                              <img
                                src={review.authorPhotoUrl}
                                alt={review.authorName}
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              review.authorName.charAt(0)
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            {/* Header */}
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-medium">{review.authorName}</h3>
                                  {review.isVerified && (
                                    <span title="Проверенный отзыв">
                                      <CheckCircle className="h-4 w-4 text-green-500" />
                                    </span>
                                  )}
                                </div>
                                {(review.authorPosition || review.authorCompany) && (
                                  <p className="text-sm text-muted-foreground">
                                    {review.authorPosition}
                                    {review.authorPosition && review.authorCompany && ", "}
                                    {review.authorCompany}
                                  </p>
                                )}
                              </div>
                              <div className="text-right">
                                <div className="flex items-center gap-1 mb-1">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                      key={star}
                                      className={`h-4 w-4 ${
                                        star <= review.rating
                                          ? "fill-yellow-400 text-yellow-400"
                                          : "text-muted-foreground"
                                      }`}
                                    />
                                  ))}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  {formatDateShort(review.createdAt)}
                                </p>
                              </div>
                            </div>

                            {/* Content */}
                            <div className="relative">
                              <Quote className="absolute -top-2 -left-2 h-8 w-8 text-muted-foreground/20" />
                              <p className="text-sm leading-relaxed pl-6">
                                {review.content}
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-12 text-center"
            >
              <Card>
                <CardContent className="p-8">
                  <h3 className="text-xl font-medium mb-2">
                    Оставьте свой отзыв
                  </h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    Поделитесь своим опытом работы с нами
                  </p>
                  <Button asChild>
                    <Link href="/reviews/new">Оставить отзыв</Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
