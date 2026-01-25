import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Trophy, Calendar, Clock, User, CheckCircle, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils/date";

export const dynamic = 'force-dynamic';

async function getCase(slug: string) {
  const data = await prisma.case.findUnique({
    where: { slug, isActive: true },
  });
  return data;
}

async function getRelatedCases(currentId: string, category: string | null) {
  const data = await prisma.case.findMany({
    where: {
      isActive: true,
      id: { not: currentId },
      ...(category ? { category } : {}),
    },
    take: 3,
    orderBy: { createdAt: "desc" },
  });
  return data;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const caseData = await getCase(slug);
  
  if (!caseData) {
    return { title: "Кейс не найден" };
  }
  
  return {
    title: caseData.metaTitle || `${caseData.title} | Адвокат`,
    description: caseData.metaDescription || caseData.description,
  };
}

export default async function CasePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const caseData = await getCase(slug);

  if (!caseData) {
    notFound();
  }

  const relatedCases = await getRelatedCases(caseData.id, caseData.category);

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <section className="relative">
        {/* Background Image */}
        <div className="absolute inset-0 h-[400px] lg:h-[500px]">
          {caseData.imageUrl ? (
            <img
              src={caseData.imageUrl}
              alt={caseData.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/10 via-primary/5 to-background" />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
        </div>

        {/* Content */}
        <div className="relative container mx-auto px-6 lg:px-8 pt-8 pb-16">
          {/* Back Button */}
          <Button variant="ghost" size="sm" className="mb-8" asChild>
            <Link href="/cases">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Все кейсы
            </Link>
          </Button>

          <div className="max-w-4xl">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              {caseData.category && (
                <Badge variant="secondary" className="text-sm">
                  <Scale className="mr-1 h-3 w-3" />
                  {caseData.category}
                </Badge>
              )}
              <Badge variant="outline" className="text-sm">
                <Calendar className="mr-1 h-3 w-3" />
                {caseData.year} год
              </Badge>
              {caseData.isFeatured && (
                <Badge className="bg-yellow-500 text-black">
                  ⭐ Знаковое дело
                </Badge>
              )}
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-light tracking-tight mb-6">
              {caseData.title}
            </h1>

            {/* Result - Success Banner */}
            <div className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl bg-green-500/10 border border-green-500/20 text-green-700 dark:text-green-400">
              <Trophy className="h-6 w-6" />
              <div>
                <p className="text-xs uppercase tracking-wider opacity-70">Результат</p>
                <p className="font-medium text-lg">{caseData.result}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 lg:py-16">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Article Content */}
            <div className="lg:col-span-2">
              {/* Description */}
              {caseData.description && (
                <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                  {caseData.description}
                </p>
              )}

              {/* Main Content */}
              {caseData.content && (
                <div className="prose prose-lg dark:prose-invert max-w-none">
                  {caseData.content.split('\n').map((paragraph, index) => (
                    paragraph.trim() && (
                      <p key={index} className="mb-4 text-foreground/80 leading-relaxed">
                        {paragraph}
                      </p>
                    )
                  ))}
                </div>
              )}

              {/* If no content */}
              {!caseData.content && !caseData.description && (
                <div className="py-8 text-center text-muted-foreground">
                  <p>Подробное описание кейса будет добавлено позже.</p>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Case Details Card */}
              <Card>
                <CardContent className="p-6 space-y-4">
                  <h3 className="font-medium text-lg">Детали дела</h3>
                  <Separator />
                  
                  <div className="space-y-4">
                    {caseData.category && (
                      <div className="flex items-start gap-3">
                        <Scale className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wider">Категория</p>
                          <p className="font-medium">{caseData.category}</p>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Год</p>
                        <p className="font-medium">{caseData.year}</p>
                      </div>
                    </div>

                    {caseData.duration && (
                      <div className="flex items-start gap-3">
                        <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wider">Длительность</p>
                          <p className="font-medium">{caseData.duration}</p>
                        </div>
                      </div>
                    )}

                    {caseData.clientName && (
                      <div className="flex items-start gap-3">
                        <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wider">Клиент</p>
                          <p className="font-medium">{caseData.clientName}</p>
                        </div>
                      </div>
                    )}

                    <Separator />

                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Результат</p>
                        <p className="font-medium text-green-600 dark:text-green-400">{caseData.result}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* CTA Card */}
              <Card className="bg-primary text-primary-foreground">
                <CardContent className="p-6 text-center">
                  <h3 className="font-medium text-lg mb-2">У вас похожая ситуация?</h3>
                  <p className="text-sm opacity-90 mb-4">
                    Получите бесплатную консультацию
                  </p>
                  <Button variant="secondary" className="w-full rounded-full" asChild>
                    <Link href="/contacts">
                      Связаться
                      <ArrowUpRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Related Cases */}
      {relatedCases.length > 0 && (
        <section className="py-12 lg:py-16 border-t border-border bg-muted/30">
          <div className="container mx-auto px-6 lg:px-8">
            <h2 className="text-2xl font-light tracking-tight mb-8">
              Похожие дела
            </h2>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedCases.map((item) => (
                <article
                  key={item.id}
                  className="group rounded-xl border border-border bg-background overflow-hidden hover:border-foreground/20 hover:shadow-lg transition-all"
                >
                  {/* Image */}
                  <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Trophy className="h-12 w-12 text-muted-foreground/20" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary" className="text-xs">
                        {item.category || "Кейс"}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{item.year}</span>
                    </div>

                    <h3 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors mb-2">
                      <Link href={`/cases/${item.slug}`}>
                        {item.title}
                      </Link>
                    </h3>

                    <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                      <Trophy className="h-3 w-3" />
                      {item.result}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Bottom CTA */}
      <section className="py-16 border-t border-border">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 max-w-4xl mx-auto">
            <div>
              <h2 className="text-2xl sm:text-3xl font-light tracking-tight mb-2">
                Нужна помощь?
              </h2>
              <p className="text-muted-foreground">
                Мы поможем в решении вашей юридической проблемы
              </p>
            </div>
            <Button size="lg" className="rounded-full px-8 shrink-0" asChild>
              <Link href="/contacts">
                Получить консультацию
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

