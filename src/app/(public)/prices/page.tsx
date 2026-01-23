import Link from "next/link";
import { Check, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/db";
import type { Pricing } from "@prisma/client";

async function getPricing() {
  const data = await prisma.pricing.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
  return data;
}

function PricingCard({ pkg }: { pkg: Pricing }) {
  return (
    <div
      className={`h-full p-6 rounded-2xl border transition-all duration-300 ${
        pkg.isPopular
          ? "border-foreground bg-foreground text-background"
          : "border-border hover:border-foreground/20"
      }`}
    >
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-1">{pkg.name}</h3>
        {pkg.description && (
          <p
            className={`text-sm ${
              pkg.isPopular
                ? "text-background/60"
                : "text-muted-foreground"
            }`}
          >
            {pkg.description}
          </p>
        )}
      </div>

      {/* Price */}
      <div className="mb-6">
        <div className="flex items-baseline gap-1">
          {pkg.priceNote && (
            <span
              className={`text-sm ${
                pkg.isPopular
                  ? "text-background/60"
                  : "text-muted-foreground"
              }`}
            >
              {pkg.priceNote}
            </span>
          )}
          <span className="text-3xl font-light tracking-tight">
            {pkg.price}
          </span>
        </div>
      </div>

      {/* Features */}
      {pkg.features && pkg.features.length > 0 && (
        <ul className="space-y-3 mb-6">
          {pkg.features.map((feature, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <Check
                className={`h-4 w-4 mt-0.5 shrink-0 ${
                  pkg.isPopular ? "text-background" : ""
                }`}
              />
              <span
                className={pkg.isPopular ? "text-background/80" : ""}
              >
                {feature}
              </span>
            </li>
          ))}
        </ul>
      )}

      {/* Button */}
      <Button
        variant={pkg.isPopular ? "secondary" : "outline"}
        className={`w-full rounded-full ${
          pkg.isPopular
            ? "bg-background text-foreground hover:bg-background/90"
            : "border-foreground/20 hover:bg-foreground hover:text-background"
        }`}
        asChild
      >
        <Link href="/contacts">Выбрать</Link>
      </Button>
    </div>
  );
}

export default async function PricesPage() {
  const pricing = await getPricing();

  return (
    <div className="min-h-screen pt-20">
      {/* Hero */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="max-w-2xl">
            <span className="text-sm text-muted-foreground uppercase tracking-widest mb-4 block">
              Тарифы
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight mb-6">
              Стоимость
              <br />
              <span className="font-serif italic">услуг</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Прозрачные цены без скрытых платежей
            </p>
          </div>
        </div>
      </section>

      {/* Packages */}
      <section className="pb-24">
        <div className="container mx-auto px-6 lg:px-8">
          {pricing.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {pricing.map((pkg) => (
                <PricingCard key={pkg.id} pkg={pkg} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-lg">Тарифы пока не добавлены</p>
              <p className="text-sm mt-2">
                Добавьте тарифы в админ-панели → Настройки
              </p>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 border-t border-border">
        <div className="container mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-light tracking-tight mb-4">
            Нужен точный расчёт?
          </h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Оставьте заявку, и мы подготовим индивидуальное предложение
          </p>
          <Button size="lg" className="rounded-full px-8" asChild>
            <Link href="/contacts">
              Получить расчёт
              <ArrowUpRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
