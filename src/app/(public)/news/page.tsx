import Link from "next/link";
import { ArrowUpRight, Calendar, Eye, Newspaper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils/date";

async function getNews() {
  const data = await prisma.news.findMany({
    where: { isPublished: true },
    orderBy: { publishedAt: "desc" },
  });
  return data;
}

export default async function NewsPage() {
  const news = await getNews();

  return (
    <div className="min-h-screen pt-20">
      {/* Hero */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="max-w-2xl">
            <span className="text-sm text-muted-foreground uppercase tracking-widest mb-4 block">
              Новости
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight mb-6">
              Юридический
              <br />
              <span className="font-serif italic">блог</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Актуальные новости законодательства и полезные статьи
            </p>
          </div>
        </div>
      </section>

      {/* News Grid */}
      <section className="pb-24 lg:pb-32">
        <div className="container mx-auto px-6 lg:px-8">
          {news.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {news.map((item, index) => (
                <article
                  key={item.id}
                  className={`group rounded-2xl border border-border overflow-hidden hover:border-foreground/20 transition-colors ${
                    index === 0 ? "md:col-span-2 lg:col-span-2" : ""
                  }`}
                >
                  {/* Image */}
                  <div className={`bg-muted relative ${index === 0 ? "aspect-[2/1]" : "aspect-[4/3]"}`}>
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10">
                        <Newspaper className="h-16 w-16 text-muted-foreground/20" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {item.publishedAt ? formatDate(item.publishedAt.toISOString(), {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        }) : ""}
                      </span>
                      {item.views > 0 && (
                        <span className="flex items-center gap-1">
                          <Eye className="h-3.5 w-3.5" />
                          {item.views}
                        </span>
                      )}
                    </div>

                    <h2 className={`font-medium mb-3 line-clamp-2 group-hover:text-primary transition-colors ${
                      index === 0 ? "text-xl lg:text-2xl" : "text-lg"
                    }`}>
                      <Link href={`/news/${item.slug}`}>
                        {item.title}
                      </Link>
                    </h2>

                    {item.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                        {item.description}
                      </p>
                    )}

                    <Link
                      href={`/news/${item.slug}`}
                      className="inline-flex items-center text-sm font-medium hover:underline"
                    >
                      Читать
                      <ArrowUpRight className="ml-1 h-4 w-4" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Newspaper className="h-16 w-16 mx-auto mb-4 opacity-20" />
              <p className="text-lg">Новостей пока нет</p>
              <p className="text-sm mt-2">
                Добавьте новости в админ-панели
              </p>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 border-t border-border">
        <div className="container mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-light tracking-tight mb-4">
            Нужна консультация?
          </h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Свяжитесь с нами для получения квалифицированной помощи
          </p>
          <Button size="lg" className="rounded-full px-8" asChild>
            <Link href="/contacts">
              Связаться
              <ArrowUpRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
