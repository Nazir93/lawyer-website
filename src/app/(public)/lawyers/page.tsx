import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { toPublicLawyer } from "@/lib/platform/fees";
import { buildLawyersIndexSeo } from "@/lib/platform/seo";
import { Scale, MapPin, ArrowUpRight } from "lucide-react";

export const dynamic = "force-dynamic";

async function getActiveLawyers(q?: string, city?: string) {
  const profiles = await prisma.lawyerProfile.findMany({
    where: {
      status: "ACTIVE",
      ...(q
        ? {
            OR: [
              { displayName: { contains: q, mode: "insensitive" } },
              { specialization: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(city ? { city: { contains: city, mode: "insensitive" } } : {}),
    },
    orderBy: [{ verifiedAt: "desc" }, { createdAt: "desc" }],
    take: 100,
  });

  return profiles
    .map((p) => toPublicLawyer(p))
    .filter((p): p is NonNullable<typeof p> => p !== null);
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; city?: string }>;
}): Promise<Metadata> {
  const params = await searchParams;
  const lawyers = await getActiveLawyers(params.q, params.city);
  const seo = buildLawyersIndexSeo(lawyers.length);
  return {
    title: seo.title,
    description: seo.description,
    alternates: { canonical: seo.canonicalPath },
  };
}

export default async function LawyersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; city?: string }>;
}) {
  const params = await searchParams;
  const lawyers = await getActiveLawyers(params.q, params.city);

  return (
    <div className="min-h-screen pt-14">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mb-12">
          <div className="flex items-center gap-3 mb-4 text-muted-foreground">
            <Scale className="h-5 w-5" />
            <span className="text-sm uppercase tracking-widest">Платформа</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-light tracking-tight mb-4">
            Юристы <span className="font-serif italic">платформы</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Проверенные специалисты. Выберите юриста и оставьте заявку.
          </p>
        </div>

        <form className="flex flex-col sm:flex-row gap-3 mb-10 max-w-2xl">
          <input
            name="q"
            defaultValue={params.q || ""}
            placeholder="Специализация или имя"
            className="flex-1 h-11 rounded-xl border border-input bg-background px-4 text-sm"
          />
          <input
            name="city"
            defaultValue={params.city || ""}
            placeholder="Город"
            className="sm:w-48 h-11 rounded-xl border border-input bg-background px-4 text-sm"
          />
          <button
            type="submit"
            className="h-11 px-6 rounded-full bg-foreground text-background text-sm font-medium"
          >
            Найти
          </button>
        </form>

        {lawyers.length === 0 ? (
          <p className="text-muted-foreground">
            Пока нет активных юристов
            {params.q || params.city ? " по этому запросу" : ""}.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {lawyers.map((lawyer) => (
              <Link
                key={lawyer.id}
                href={`/lawyers/${lawyer.slug}`}
                className="group rounded-2xl border border-border p-6 hover:bg-secondary/40 transition-colors"
              >
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-foreground text-background flex items-center justify-center text-sm font-medium shrink-0">
                    {lawyer.displayName
                      .split(" ")
                      .map((p) => p[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <h2 className="text-lg font-medium tracking-tight mb-1">
                  {lawyer.displayName}
                </h2>
                {lawyer.specialization && (
                  <p className="text-sm text-muted-foreground mb-3">
                    {lawyer.specialization}
                  </p>
                )}
                {lawyer.city && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" />
                    {lawyer.city}
                  </p>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
