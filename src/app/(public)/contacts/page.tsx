import { Suspense } from "react";
import { Phone, Mail, MapPin, Clock, ArrowUpRight } from "lucide-react";
import { ContactForm } from "@/components/forms/contact-form";
import { prisma } from "@/lib/db";
import { normalizeLawyerQueryParam } from "@/lib/platform/leads";

export const dynamic = "force-dynamic";

async function getSettings() {
  return prisma.siteSettings.findFirst();
}

async function getLawyerLabel(slug: string | null) {
  if (!slug) return null;
  const profile = await prisma.lawyerProfile.findFirst({
    where: { slug, status: "ACTIVE" },
    select: { displayName: true },
  });
  return profile?.displayName ?? null;
}

export default async function ContactsPage({
  searchParams,
}: {
  searchParams: Promise<{ lawyer?: string }>;
}) {
  const params = await searchParams;
  const lawyerSlug = normalizeLawyerQueryParam(params.lawyer);
  const [settings, lawyerName] = await Promise.all([
    getSettings(),
    getLawyerLabel(lawyerSlug),
  ]);

  const contactInfo = [
    {
      icon: Phone,
      title: "Телефон",
      value: settings?.phone || "+7 (900) 123-45-67",
      href: settings?.phone ? `tel:${settings.phone.replace(/\D/g, "")}` : "tel:+79001234567",
      description: "Пн-Пт: 9:00 - 19:00",
    },
    {
      icon: Mail,
      title: "Email",
      value: settings?.email || "info@azim-gasanov.ru",
      href: settings?.email ? `mailto:${settings.email}` : "mailto:info@azim-gasanov.ru",
      description: "Ответим в течение часа",
    },
    {
      icon: MapPin,
      title: "Адрес",
      value: settings?.address || "Москва, ул. Примерная, 1",
      href: settings?.address
        ? `https://maps.google.com/search?q=${encodeURIComponent(settings.address)}`
        : "https://maps.google.com",
      description: "Офис 100, БЦ «Название»",
    },
    {
      icon: Clock,
      title: "График",
      value: "Пн-Пт: 9:00 - 19:00",
      href: null,
      description: "Сб-Вс: по записи",
    },
  ];

  const messengers = [];
  if (settings?.whatsapp) {
    messengers.push({
      name: "WhatsApp",
      href: `https://wa.me/${settings.whatsapp.replace(/\D/g, "")}`,
    });
  }
  if (settings?.telegram) {
    messengers.push({
      name: "Telegram",
      href: settings.telegram.startsWith("@")
        ? `https://t.me/${settings.telegram.slice(1)}`
        : settings.telegram,
    });
  }
  if (settings?.vkUrl) {
    messengers.push({ name: "VK", href: settings.vkUrl });
  }

  return (
    <div className="min-h-screen pt-20">
      {/* Hero */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="max-w-2xl">
            <span className="text-sm text-muted-foreground uppercase tracking-widest mb-4 block">
              Контакты
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight mb-6">
              Свяжитесь
              <br />
              <span className="font-serif italic">с нами</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Получите бесплатную первичную консультацию. Мы ответим в течение
              часа.
              {lawyerName
                ? ` Заявка будет направлена юристу: ${lawyerName}.`
                : ""}
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="pb-24 lg:pb-32">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24">
            {/* Form */}
            <div>
              <h2 className="text-2xl font-light tracking-tight mb-8">
                Оставить заявку
              </h2>
              <Suspense fallback={<div>Загрузка формы...</div>}>
                <ContactForm />
              </Suspense>
            </div>

            {/* Info */}
            <div className="space-y-12">
              <div>
                <h2 className="text-2xl font-light tracking-tight mb-8">
                  Контактная информация
                </h2>

                <div className="space-y-6">
                  {contactInfo.map((item) => {
                    const Icon = item.icon;
                    const Wrapper = item.href ? "a" : "div";
                    return (
                      <Wrapper
                        key={item.title}
                        {...(item.href
                          ? {
                              href: item.href,
                              target: item.href.startsWith("http")
                                ? "_blank"
                                : undefined,
                              rel: item.href.startsWith("http")
                                ? "noopener noreferrer"
                                : undefined,
                            }
                          : {})}
                        className="flex items-start gap-4 group"
                      >
                        <div className="w-12 h-12 rounded-full border border-border flex items-center justify-center group-hover:bg-foreground group-hover:text-background transition-all duration-300">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">
                            {item.title}
                          </p>
                          <p className="text-lg font-medium">
                            {item.value}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {item.description}
                          </p>
                        </div>
                      </Wrapper>
                    );
                  })}
                </div>
              </div>

              {/* Messengers */}
              {messengers.length > 0 && (
                <div>
                  <h3 className="text-sm uppercase tracking-widest text-muted-foreground mb-4">
                    Мессенджеры
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {messengers.map((messenger) => (
                      <a
                        key={messenger.name}
                        href={messenger.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-border hover:bg-foreground hover:text-background transition-all duration-300"
                      >
                        {messenger.name}
                        <ArrowUpRight className="h-3 w-3" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Map */}
              {settings?.address && (
                <div className="rounded-2xl overflow-hidden border border-border">
                  <div className="h-64 bg-secondary flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <MapPin className="h-8 w-8 mx-auto mb-2" />
                      <p className="font-medium">{settings.address}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
