import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, Eye, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils/date";

export const dynamic = 'force-dynamic';

async function getNews(slug: string) {
  const data = await prisma.news.findUnique({
    where: { slug },
  });
  
  if (data && !data.isPublished) {
    return null;
  }
  
  return data;
}

export default async function NewsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const news = await getNews(slug);

  if (!news) {
    notFound();
  }

  return (
    <div className="min-h-screen pt-20">
      {/* Header */}
      <section className="py-8 border-b border-border">
        <div className="container mx-auto px-6 lg:px-8">
          <Button variant="ghost" size="sm" asChild className="mb-6">
            <Link href="/news">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Назад к новостям
            </Link>
          </Button>

          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-3 text-sm text-muted-foreground mb-4">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {news.publishedAt ? formatDate(news.publishedAt.toISOString(), {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                }) : ""}
              </span>
              {news.views > 0 && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {news.views} просмотров
                  </span>
                </>
              )}
            </div>

            <h1 className="text-4xl sm:text-5xl font-light tracking-tight mb-6">
              {news.title}
            </h1>

            {news.description && (
              <p className="text-xl text-muted-foreground leading-relaxed">
                {news.description}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Image */}
      {news.imageUrl && (
        <section className="py-8">
          <div className="container mx-auto px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="relative aspect-video rounded-2xl overflow-hidden">
                <img
                  src={news.imageUrl}
                  alt={news.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Content */}
      <section className="py-12">
        <div className="container mx-auto px-6 lg:px-8">
          <article className="max-w-3xl mx-auto prose prose-lg dark:prose-invert">
            <div className="whitespace-pre-wrap text-foreground leading-relaxed">
              {news.content || news.description}
            </div>
          </article>
        </div>
      </section>

      {/* Footer Actions */}
      <section className="py-8 border-t border-border">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <Button variant="outline" asChild>
              <Link href="/news">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Все новости
              </Link>
            </Button>
            <Button variant="outline">
              <Share2 className="mr-2 h-4 w-4" />
              Поделиться
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
