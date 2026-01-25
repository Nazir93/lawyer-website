import Link from "next/link";
import { ArrowUpRight, Trophy, Calendar, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/db";

// Force dynamic rendering to avoid static generation database calls
export const dynamic = 'force-dynamic';

async function getCases() {
  const data = await prisma.case.findMany({
    where: { isActive: true },
    orderBy: [
      { year: "desc" },
      { createdAt: "desc" },
    ],
  });
  return data;
}

export default async function CasesPage() {
  const cases = await getCases();

  return (
    <div className="min-h-screen pt-20">
      {/* Hero */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="max-w-2xl">
            <span className="text-sm text-muted-foreground uppercase tracking-widest mb-4 block">
              Кейсы
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight mb-6">
              Выигранные
              <br />
              <span className="font-serif italic">дела</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Реальные результаты для наших клиентов
            </p>
          </div>
        </div>
      </section>

      {/* Cases Grid */}
      <section className="pb-24 lg:pb-32">
        <div className="container mx-auto px-6 lg:px-8">
          {cases.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cases.map((caseItem) => (
                <article
                  key={caseItem.id}
                  className="group rounded-2xl border border-border overflow-hidden hover:border-foreground/20 transition-colors"
                >
                  {/* Image */}
                  <div className="aspect-[4/3] bg-muted relative">
                    {caseItem.imageUrl ? (
                      <img
                        src={caseItem.imageUrl}
                        alt={caseItem.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Trophy className="h-16 w-16 text-muted-foreground/20" />
                      </div>
                    )}
                    {caseItem.isFeatured && (
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-yellow-500 text-black">
                          <Star className="mr-1 h-3 w-3" />
                          Featured
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <Badge variant="secondary">
                        {caseItem.category || "Юридический кейс"}
                      </Badge>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {caseItem.year}
                      </span>
                    </div>

                    <h2 className="text-lg font-medium mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                      <Link href={`/cases/${caseItem.slug}`}>
                        {caseItem.title}
                      </Link>
                    </h2>

                    {caseItem.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                        {caseItem.description}
                      </p>
                    )}

                    <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 mb-4">
                      <Trophy className="h-4 w-4" />
                      {caseItem.result}
                    </div>

                    <Link
                      href={`/cases/${caseItem.slug}`}
                      className="inline-flex items-center text-sm font-medium hover:underline"
                    >
                      Подробнее
                      <ArrowUpRight className="ml-1 h-4 w-4" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Trophy className="h-16 w-16 mx-auto mb-4 opacity-20" />
              <p className="text-lg">Кейсы пока не добавлены</p>
              <p className="text-sm mt-2">
                Добавьте кейсы в админ-панели
              </p>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 border-t border-border">
        <div className="container mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-light tracking-tight mb-4">
            У вас похожая ситуация?
          </h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Свяжитесь с нами для бесплатной консультации
          </p>
          <Button size="lg" className="rounded-full px-8" asChild>
            <Link href="/contacts">
              Получить консультацию
              <ArrowUpRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
