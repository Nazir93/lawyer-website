import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/db";
import type { Service } from "@prisma/client";

export const dynamic = 'force-dynamic';

// Статичные данные для групп (заголовки)
const groupInfo: Record<string, { title: string; description: string }> = {
  BUSINESS: {
    title: "Юридическим лицам",
    description: "Полное юридическое сопровождение бизнеса",
  },
  INDIVIDUAL: {
    title: "Физическим лицам",
    description: "Защита прав и интересов граждан",
  },
  SPECIAL: {
    title: "Спецпредложения",
    description: "Особые условия и пакетные предложения",
  },
};

async function getServices() {
  const data = await prisma.service.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
  return data;
}

function ServiceSection({
  group,
  services,
  index,
}: {
  group: string;
  services: Service[];
  index: number;
}) {
  const info = groupInfo[group];
  if (!info || services.length === 0) return null;

  return (
    <div className="rounded-2xl border border-border overflow-hidden">
      <div className="grid lg:grid-cols-2">
        {/* Left */}
        <div className="p-8 lg:p-12 flex flex-col justify-between">
          <div>
            <span className="text-sm text-muted-foreground mb-4 block">
              0{index + 1}
            </span>
            <h2 className="text-3xl lg:text-4xl font-light tracking-tight mb-4">
              {info.title}
            </h2>
            <p className="text-muted-foreground mb-8">{info.description}</p>
          </div>
          <Button
            variant="outline"
            className="rounded-full self-start px-6 border-foreground/20 hover:bg-foreground hover:text-background"
            asChild
          >
            <Link href={`/services?group=${group.toLowerCase()}`}>
              Подробнее
              <ArrowUpRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Right */}
        <div className="p-8 lg:p-12 bg-secondary/30">
          <h3 className="text-sm uppercase tracking-widest text-muted-foreground mb-6">
            Услуги
          </h3>
          <ul className="grid sm:grid-cols-2 gap-4">
            {services.map((service) => (
              <li key={service.id} className="flex items-start gap-3 text-sm">
                <Check className="h-4 w-4 mt-0.5 shrink-0" />
                <Link
                  href={`/services/${service.slug}`}
                  className="hover:underline"
                >
                  {service.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default async function ServicesPage() {
  const services = await getServices();

  // Группируем услуги
  const grouped = {
    BUSINESS: services.filter((s) => s.serviceGroup === "BUSINESS"),
    INDIVIDUAL: services.filter((s) => s.serviceGroup === "INDIVIDUAL"),
    SPECIAL: services.filter((s) => s.serviceGroup === "SPECIAL"),
  };

  const hasServices = services.length > 0;

  return (
    <div className="min-h-screen pt-20">
      {/* Hero */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="max-w-2xl">
            <span className="text-sm text-muted-foreground uppercase tracking-widest mb-4 block">
              Услуги
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight mb-6">
              Полный спектр
              <br />
              <span className="font-serif italic">услуг</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Юридическая помощь для физических и юридических лиц
            </p>
          </div>
        </div>
      </section>

      {/* Sections */}
      <section className="pb-24 lg:pb-32">
        <div className="container mx-auto px-6 lg:px-8">
          {hasServices ? (
            <div className="space-y-6">
              {Object.entries(grouped).map(([group, groupServices], index) => (
                <ServiceSection
                  key={group}
                  group={group}
                  services={groupServices}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-lg">Услуги пока не добавлены</p>
              <p className="text-sm mt-2">
                Добавьте услуги в админ-панели
              </p>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 border-t border-border">
        <div className="container mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-light tracking-tight mb-4">
            Не нашли нужную услугу?
          </h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Свяжитесь с нами, и мы подберём решение
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
