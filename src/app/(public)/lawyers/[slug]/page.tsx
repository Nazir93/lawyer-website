import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { toPublicLawyer } from "@/lib/platform/fees";
import { buildLawyerProfileSeo } from "@/lib/platform/seo";
import { ArrowLeft, MapPin, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

async function loadLawyer(slug: string) {
  const profile = await prisma.lawyerProfile.findUnique({ where: { slug } });
  return profile ? toPublicLawyer(profile) : null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const lawyer = await loadLawyer(slug);
  if (!lawyer) return { title: "Юрист не найден" };
  const seo = buildLawyerProfileSeo(lawyer);
  return {
    title: seo.title,
    description: seo.description,
    alternates: { canonical: seo.canonicalPath },
    openGraph: {
      title: seo.title,
      description: seo.description,
      url: seo.canonicalPath,
      type: "profile",
    },
  };
}

export default async function LawyerPublicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const lawyer = await loadLawyer(slug);
  if (!lawyer) notFound();

  return (
    <div className="min-h-screen pt-14">
      <div className="container mx-auto px-4 py-16 max-w-3xl">
        <Link
          href="/lawyers"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Все юристы
        </Link>

        <div className="flex items-start gap-5 mb-8">
          <div className="w-16 h-16 rounded-full bg-foreground text-background flex items-center justify-center text-lg font-medium shrink-0">
            {lawyer.displayName
              .split(" ")
              .map((p) => p[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
              <Scale className="h-4 w-4" />
              Юрист платформы
              {lawyer.verifiedAt ? " · проверен" : ""}
            </div>
            <h1 className="text-3xl lg:text-4xl font-light tracking-tight">
              {lawyer.displayName}
            </h1>
            {lawyer.specialization && (
              <p className="text-muted-foreground mt-2">
                {lawyer.specialization}
              </p>
            )}
            {lawyer.city && (
              <p className="text-sm text-muted-foreground mt-3 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                {lawyer.city}
              </p>
            )}
          </div>
        </div>

        {lawyer.bio && (
          <div className="prose prose-neutral dark:prose-invert max-w-none mb-10">
            <p className="text-base leading-relaxed whitespace-pre-wrap">
              {lawyer.bio}
            </p>
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <Button asChild className="rounded-full">
            <Link href={`/contacts?lawyer=${lawyer.slug}`}>Оставить заявку</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/register?type=client">Зарегистрироваться</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
