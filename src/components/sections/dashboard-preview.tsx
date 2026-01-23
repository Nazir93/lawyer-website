"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import {
  FileText,
  MessageSquare,
  Calendar,
  Briefcase,
  CreditCard,
  Settings,
  ArrowUpRight,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: FileText,
    title: "Мои документы",
    description: "Все ваши документы в одном месте. Быстрый доступ к договорам, справкам и другим файлам.",
    color: "text-blue-600",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
  },
  {
    icon: MessageSquare,
    title: "Сообщения",
    description: "Прямая связь с вашим адвокатом. Задавайте вопросы и получайте ответы в реальном времени.",
    color: "text-green-600",
    bgColor: "bg-green-100 dark:bg-green-900/30",
  },
  {
    icon: Calendar,
    title: "Встречи",
    description: "Управляйте встречами и консультациями. Просматривайте расписание и записывайтесь онлайн.",
    color: "text-purple-600",
    bgColor: "bg-purple-100 dark:bg-purple-900/30",
  },
  {
    icon: Briefcase,
    title: "Мои дела",
    description: "Отслеживайте статус ваших дел. Видите все этапы работы и получайте уведомления об обновлениях.",
    color: "text-orange-600",
    bgColor: "bg-orange-100 dark:bg-orange-900/30",
  },
  {
    icon: CreditCard,
    title: "Счета и оплата",
    description: "Просматривайте счета, историю платежей и управляйте оплатой услуг онлайн.",
    color: "text-red-600",
    bgColor: "bg-red-100 dark:bg-red-900/30",
  },
  {
    icon: Settings,
    title: "Настройки",
    description: "Управляйте профилем, настройками уведомлений и безопасностью аккаунта.",
    color: "text-gray-600",
    bgColor: "bg-gray-100 dark:bg-gray-900/30",
  },
];

const benefits = [
  "Полный контроль над вашими делами",
  "Прямая связь с адвокатом",
  "Безопасное хранение документов",
  "Прозрачность всех процессов",
  "Уведомления о важных событиях",
  "Доступ 24/7 из любого устройства",
];

export function DashboardPreview() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [50, -50]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);

  return (
    <section ref={sectionRef} className="py-24 lg:py-32 relative">
      <motion.div style={{ y, opacity }} className="container mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <span className="text-sm text-muted-foreground uppercase tracking-widest mb-4 block">
            Личный кабинет
          </span>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight mb-6">
            Всё под
            <br />
            <span className="font-serif italic">контролем</span>
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            После регистрации вы получаете доступ к личному кабинету, где можете отслеживать все ваши дела,
            общаться с адвокатом, просматривать документы и управлять встречами.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full hover:border-foreground/20 transition-colors">
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 rounded-xl ${feature.bgColor} flex items-center justify-center mb-4`}>
                      <Icon className={`h-6 w-6 ${feature.color}`} />
                    </div>
                    <h3 className="text-xl font-medium mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="max-w-2xl mx-auto"
        >
          <Card>
            <CardContent className="p-8">
              <h3 className="text-2xl font-light tracking-tight mb-6 text-center">
                Преимущества личного кабинета
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={benefit}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.4 + index * 0.05 }}
                    className="flex items-center gap-3"
                  >
                    <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
                    <span className="text-sm">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-12 text-center"
        >
          <Button size="lg" className="rounded-full px-8 h-14 text-base" asChild>
            <Link href="/register">
              Создать аккаунт
              <ArrowUpRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <p className="text-sm text-muted-foreground mt-4">
            Уже есть аккаунт?{" "}
            <Link href="/login" className="text-foreground hover:underline">
              Войти
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </section>
  );
}

