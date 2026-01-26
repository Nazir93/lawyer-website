"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

// Дефолтные услуги (используются если БД недоступна)
const defaultServices = [
  { title: "Юридическим лицам", href: "/services/business" },
  { title: "Физическим лицам", href: "/services/individual" },
  { title: "Спецпредложения", href: "/services/special" },
];

const navigation = {
  company: [
    { title: "О нас", href: "/about" },
    { title: "Кейсы", href: "/cases" },
    { title: "Новости", href: "/news" },
    { title: "Контакты", href: "/contacts" },
  ],
  legal: [
    { title: "Политика конфиденциальности", href: "/privacy" },
    { title: "Пользовательское соглашение", href: "/terms" },
  ],
  social: [
    { title: "Telegram", href: "https://t.me/lawyer" },
    { title: "WhatsApp", href: "https://wa.me/79001234567" },
    { title: "VK", href: "https://vk.com/lawyer" },
  ],
};

export function Footer() {
  const [services, setServices] = useState(defaultServices);

  useEffect(() => {
    fetch("/api/public/sections")
      .then((res) => res.json())
      .then((data) => {
        if (data.data && data.data.length > 0) {
          setServices(data.data);
        }
      })
      .catch(() => {
        // При ошибке используем дефолтные значения
      });
  }, []);

  return (
    <footer className="border-t border-border">
      {/* Main Footer */}
      <div className="container mx-auto px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8">
          {/* Brand */}
          <div className="lg:col-span-4">
            <Link href="/" className="inline-block mb-6">
              <div className="flex items-center gap-1">
                <span className="text-3xl font-bold tracking-tight">G.</span>
                <span className="text-3xl font-bold tracking-tight">A</span>
              </div>
            </Link>
            <p className="text-muted-foreground leading-relaxed max-w-sm">
              Профессиональная юридическая помощь физическим и юридическим
              лицам. Защита ваших прав и интересов.
            </p>

            {/* Contact Info */}
            <div className="mt-8 space-y-2">
              <a
                href="tel:+79001234567"
                className="block text-lg hover:text-muted-foreground transition-colors"
              >
                +7 (900) 123-45-67
              </a>
              <a
                href="mailto:info@azim-gasanov.ru"
                className="block text-muted-foreground hover:text-foreground transition-colors"
              >
                info@azim-gasanov.ru
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div className="lg:col-span-8 grid sm:grid-cols-4 gap-8">
            <div>
              <h4 className="text-sm uppercase tracking-widest text-muted-foreground mb-4">
                Услуги
              </h4>
              <ul className="space-y-3">
                {services.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-sm hover:text-muted-foreground transition-colors line-animate inline-block"
                    >
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-sm uppercase tracking-widest text-muted-foreground mb-4">
                Компания
              </h4>
              <ul className="space-y-3">
                {navigation.company.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-sm hover:text-muted-foreground transition-colors line-animate inline-block"
                    >
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-sm uppercase tracking-widest text-muted-foreground mb-4">
                Правовая информация
              </h4>
              <ul className="space-y-3">
                {navigation.legal.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-sm hover:text-muted-foreground transition-colors line-animate inline-block"
                    >
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-sm uppercase tracking-widest text-muted-foreground mb-4">
                Соцсети
              </h4>
              <ul className="space-y-3">
                {navigation.social.map((item) => (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm hover:text-muted-foreground transition-colors inline-flex items-center gap-1 group"
                    >
                      {item.title}
                      <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border">
        <div className="container mx-auto px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4">
              <span>© 2024 Адвокат</span>
              <span className="hidden md:inline">•</span>
              <span>ОГРН: 1234567890123</span>
            </div>
            <div className="flex items-center gap-4">
              <span>Designed with ♥</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
