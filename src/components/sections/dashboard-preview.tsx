"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";
import { ArrowUpRight, Shield, Clock, MessageSquare, FileText, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

const features = [
  {
    icon: FileText,
    title: "Мои дела",
    description: "Отслеживайте статус и прогресс ваших дел в реальном времени",
  },
  {
    icon: MessageSquare,
    title: "Сообщения",
    description: "Прямая связь с вашим адвокатом в защищённом чате",
  },
  {
    icon: Clock,
    title: "Записи",
    description: "Планируйте консультации и встречи онлайн",
  },
  {
    icon: Shield,
    title: "Документы",
    description: "Безопасное хранение и обмен документами",
  },
  {
    icon: Bell,
    title: "Уведомления",
    description: "Мгновенные уведомления о важных событиях",
  },
];

export function DashboardPreview() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { isLoggedIn, isLoading } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Не показываем блок авторизованным пользователям
  if (isLoggedIn && !isLoading) {
    return null;
  }

  return (
    <section ref={ref} className="py-24 lg:py-32 overflow-hidden">
      <div className="container mx-auto px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="text-sm text-muted-foreground uppercase tracking-widest mb-4 block">
            Личный кабинет
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light tracking-tight mb-6">
            Все ваши дела
            <br />
            <span className="font-serif italic">в одном месте</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Удобный личный кабинет для отслеживания статуса дел, общения с адвокатом и управления документами
          </p>
        </motion.div>

        {/* Dashboard Image */}
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.95 }}
          animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative max-w-6xl mx-auto mb-20"
        >
          {/* Glow effect */}
          <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-primary/5 to-primary/20 rounded-3xl blur-2xl opacity-50" />
          
          {/* Browser frame */}
          <div className="relative rounded-2xl overflow-hidden border border-border/50 shadow-2xl bg-background">
            {/* Browser header */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50 bg-muted/30">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <div className="flex-1 mx-4">
                <div className="max-w-md mx-auto px-4 py-1.5 rounded-lg bg-background/50 text-xs text-muted-foreground text-center">
                  azim-gasanov.ru/dashboard
                </div>
              </div>
            </div>
            
            {/* Screenshot */}
            <div className="relative">
              {mounted ? (
                <Image
                  src={resolvedTheme === "dark" ? "/images/dashboard-dark.png" : "/images/dashboard-light.png"}
                  alt="Личный кабинет клиента"
                  width={1567}
                  height={700}
                  className="w-full h-auto"
                  priority
                />
              ) : (
                <div className="w-full aspect-[1567/700] bg-muted animate-pulse" />
              )}
            </div>
          </div>

          {/* Floating badges */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="absolute -left-4 lg:-left-8 top-1/4 hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-background border border-border shadow-lg"
          >
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-medium">Дело обновлено</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="absolute -right-4 lg:-right-8 top-1/3 hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-background border border-border shadow-lg"
          >
            <MessageSquare className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Новое сообщение</span>
          </motion.div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                className="group p-6 rounded-2xl border border-border/50 hover:border-border hover:bg-muted/30 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-medium mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center"
        >
          <Button size="lg" className="rounded-full px-8" asChild>
            <Link href="/register">
              Создать личный кабинет
              <ArrowUpRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
