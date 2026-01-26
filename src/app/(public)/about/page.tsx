import Link from "next/link";
import { ArrowUpRight, Award, BookOpen, Briefcase, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/db";

export const dynamic = 'force-dynamic';

async function getSettings() {
  const data = await prisma.siteSettings.findFirst();
  return data;
}

const specializations = [
  { icon: Briefcase, title: "Корпоративное право" },
  { icon: Scale, title: "Арбитражные споры" },
  { icon: BookOpen, title: "Семейное право" },
  { icon: Award, title: "Защита бизнеса" },
];

export default async function AboutPage() {
  const settings = await getSettings();

  // Данные адвоката Азима Гасанова (приоритет над настройками БД)
  const lawyerName = "Азим Гасанов";
  const lawyerPhoto = "/images/azim-gasanov.png";
  const lawyerPosition = "Адвокат";
  const lawyerBio = `Меня зовут Азим Гасанов. Я профессиональный адвокат с многолетним опытом защиты прав и интересов клиентов.

Моя практика охватывает широкий спектр юридических вопросов: от корпоративного права и арбитражных споров до семейных дел и защиты бизнеса.

Я верю, что каждый клиент заслуживает качественной правовой защиты и индивидуального подхода. Моя цель — не просто выиграть дело, а найти оптимальное решение для каждой конкретной ситуации.`;

  const firstName = "Азим";
  const lastName = "Гасанов";

  const stats = [
    {
      label: "Лет опыта",
      value: settings?.lawyerExperienceYears
        ? `${settings.lawyerExperienceYears}+`
        : "10+",
    },
    { label: "Выигранных дел", value: "300+" },
    { label: "Довольных клиентов", value: "500+" },
    { label: "Консультаций", value: "1000+" },
  ];

  return (
    <div className="min-h-screen pt-20">
      {/* Hero */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Image */}
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-white dark:bg-transparent order-2 lg:order-1">
              {/* Glow effect for dark mode */}
              <div className="absolute inset-0 dark:bg-gradient-to-t dark:from-background dark:via-transparent dark:to-background/50 z-10 pointer-events-none" />
              <div className="absolute inset-0 dark:bg-gradient-to-r dark:from-background/80 dark:via-transparent dark:to-background/80 z-10 pointer-events-none" />
              <img
                src={lawyerPhoto}
                alt={lawyerName}
                className="w-full h-full object-cover object-top dark:mix-blend-luminosity dark:opacity-95"
              />
            </div>

            {/* Content */}
            <div className="order-1 lg:order-2">
              <span className="text-sm text-muted-foreground uppercase tracking-widest mb-4 block">
                О юристе
              </span>
              <h1 className="text-4xl sm:text-5xl font-light tracking-tight mb-6">
                {firstName}
                {lastName && (
                  <>
                    <br />
                    <span className="font-serif italic">{lastName}</span>
                  </>
                )}
              </h1>
              <p className="text-xl text-muted-foreground mb-6">
                {lawyerPosition}
              </p>
              <p className="text-muted-foreground leading-relaxed mb-8 whitespace-pre-line">
                {lawyerBio}
              </p>

              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="rounded-full px-8" asChild>
                  <Link href="/contacts">
                    Связаться
                    <ArrowUpRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full px-8 border-foreground/20"
                  asChild
                >
                  <Link href="/cases">Мои кейсы</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 border-t border-border">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-4xl lg:text-5xl font-light tracking-tight mb-2">
                  {stat.value}
                </p>
                <p className="text-sm text-muted-foreground uppercase tracking-widest">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Specializations */}
      <section className="py-16 lg:py-24 bg-secondary/30">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="max-w-xl mb-12">
            <span className="text-sm text-muted-foreground uppercase tracking-widest mb-4 block">
              Специализация
            </span>
            <h2 className="text-3xl lg:text-4xl font-light tracking-tight">
              Основные направления
              <br />
              <span className="font-serif italic">практики</span>
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {specializations.map((spec) => {
              const Icon = spec.icon;
              return (
                <div
                  key={spec.title}
                  className="p-6 rounded-2xl bg-background border border-border hover:border-foreground/20 transition-colors"
                >
                  <Icon className="h-8 w-8 mb-4" />
                  <h3 className="font-medium">{spec.title}</h3>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 border-t border-border">
        <div className="container mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-light tracking-tight mb-4">
            Готов помочь в вашем деле
          </h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Запишитесь на консультацию, и мы обсудим вашу ситуацию
          </p>
          <Button size="lg" className="rounded-full px-8" asChild>
            <Link href="/contacts">
              Записаться на консультацию
              <ArrowUpRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
