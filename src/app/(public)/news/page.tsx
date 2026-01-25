import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Calendar, Eye, Newspaper, Clock, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils/date";

export const dynamic = 'force-dynamic';

async function getNews() {
  const data = await prisma.news.findMany({
    where: { isPublished: true },
    orderBy: { publishedAt: "desc" },
  });
  return data;
}

export default async function NewsPage() {
  const news = await getNews();
  
  // Разделяем: главная новость, свежие (3 шт), остальные
  const featuredNews = news[0];
  const recentNews = news.slice(1, 4);
  const otherNews = news.slice(4);

  return (
    <div className="min-h-screen pt-20">
      {/* Hero */}
      <section className="py-12 lg:py-16">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <Badge variant="outline" className="mb-4">
                <Newspaper className="h-3 w-3 mr-1" />
                Юридический блог
              </Badge>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight">
                Новости и
                <span className="font-serif italic"> статьи</span>
              </h1>
            </div>
            <p className="text-muted-foreground max-w-md">
              Актуальные изменения в законодательстве, полезные советы и разборы сложных юридических ситуаций
            </p>
          </div>
        </div>
      </section>

      {news.length > 0 ? (
        <>
          {/* Featured + Recent Section */}
          <section className="pb-12">
            <div className="container mx-auto px-6 lg:px-8">
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Featured Article - Large */}
                {featuredNews && (
                  <article className="lg:col-span-2 group">
                    <Link href={`/news/${featuredNews.slug}`} className="block">
                      <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-muted mb-4">
                        {featuredNews.imageUrl ? (
                          <img
                            src={featuredNews.imageUrl}
                            alt={featuredNews.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                            <Newspaper className="h-24 w-24 text-muted-foreground/20" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8">
                          <Badge className="mb-3 bg-white/20 backdrop-blur-sm text-white border-0">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            Главное
                          </Badge>
                          <h2 className="text-2xl lg:text-3xl font-medium text-white mb-3 line-clamp-2">
                            {featuredNews.title}
                          </h2>
                          {featuredNews.description && (
                            <p className="text-white/80 line-clamp-2 mb-4 max-w-2xl">
                              {featuredNews.description}
                            </p>
                          )}
                          <div className="flex items-center gap-4 text-sm text-white/70">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {featuredNews.publishedAt ? formatDate(featuredNews.publishedAt.toISOString(), {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              }) : ""}
                            </span>
                            {featuredNews.views > 0 && (
                              <span className="flex items-center gap-1">
                                <Eye className="h-4 w-4" />
                                {featuredNews.views}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </article>
                )}

                {/* Recent News - Sidebar */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                      Свежее
                    </span>
                  </div>
                  
                  {recentNews.length > 0 ? (
                    <div className="space-y-4">
                      {recentNews.map((item, index) => (
                        <article
                          key={item.id}
                          className="group flex gap-4 p-4 rounded-xl border border-border hover:border-foreground/20 hover:bg-muted/50 transition-all"
                        >
                          {/* Thumbnail */}
                          <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted shrink-0">
                            {item.imageUrl ? (
                              <img
                                src={item.imageUrl}
                                alt={item.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                                <Newspaper className="h-6 w-6 text-muted-foreground/30" />
                              </div>
                            )}
                          </div>
                          
                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <Link href={`/news/${item.slug}`}>
                              <h3 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors mb-1">
                                {item.title}
                              </h3>
                            </Link>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              {item.publishedAt ? formatDate(item.publishedAt.toISOString(), {
                                day: "numeric",
                                month: "short",
                              }) : ""}
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Нет свежих новостей</p>
                  )}
                  
                  {news.length > 4 && (
                    <Button variant="outline" className="w-full rounded-full" asChild>
                      <a href="#all-news">
                        Все новости
                        <ArrowUpRight className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* All News Grid */}
          {otherNews.length > 0 && (
            <section id="all-news" className="py-12 border-t border-border">
              <div className="container mx-auto px-6 lg:px-8">
                <h2 className="text-2xl font-light tracking-tight mb-8">
                  Все публикации
                </h2>
                
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {otherNews.map((item) => (
                    <article
                      key={item.id}
                      className="group rounded-xl border border-border overflow-hidden hover:border-foreground/20 hover:shadow-lg transition-all"
                    >
                      {/* Image */}
                      <div className="relative aspect-[4/3] bg-muted overflow-hidden">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10">
                            <Newspaper className="h-12 w-12 text-muted-foreground/20" />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-4">
                        <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {item.publishedAt ? formatDate(item.publishedAt.toISOString(), {
                            day: "numeric",
                            month: "long",
                          }) : ""}
                        </div>

                        <h3 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors mb-2">
                          <Link href={`/news/${item.slug}`}>
                            {item.title}
                          </Link>
                        </h3>

                        {item.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </section>
          )}
        </>
      ) : (
        <section className="pb-24">
          <div className="container mx-auto px-6 lg:px-8">
            <div className="text-center py-16 rounded-2xl border border-dashed border-border">
              <Newspaper className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
              <p className="text-lg text-muted-foreground mb-2">Новостей пока нет</p>
              <p className="text-sm text-muted-foreground">
                Добавьте новости в админ-панели
              </p>
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-16 bg-muted/30 border-t border-border">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 max-w-4xl mx-auto">
            <div>
              <h2 className="text-2xl sm:text-3xl font-light tracking-tight mb-2">
                Нужна консультация?
              </h2>
              <p className="text-muted-foreground">
                Получите профессиональную юридическую помощь
              </p>
            </div>
            <Button size="lg" className="rounded-full px-8 shrink-0" asChild>
              <Link href="/contacts">
                Связаться с нами
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
