"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  MessageSquare,
  FileText,
  Briefcase,
  Eye,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { Lead } from "@prisma/client";
import { formatDateShort } from "@/lib/utils/date";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    newLeads: 0,
    totalServices: 0,
    activeCases: 0,
    publishedNews: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);

  useEffect(() => {
    async function loadStats() {
      try {
        const [leadsRes, servicesRes, casesRes, newsRes] = await Promise.all([
          fetch("/api/leads?status=new"),
          fetch("/api/services?active=true"),
          fetch("/api/cases?active=true"),
          fetch("/api/news?published=true"),
        ]);

        const [leadsData, servicesData, casesData, newsData] = await Promise.all([
          leadsRes.json(),
          servicesRes.json(),
          casesRes.json(),
          newsRes.json(),
        ]);

        setStats({
          newLeads: leadsData.count || 0,
          totalServices: servicesData.count || 0,
          activeCases: casesData.count || 0,
          publishedNews: newsData.count || 0,
        });

        // Загружаем последние заявки
        const recentLeadsRes = await fetch("/api/leads?limit=5");
        const recentLeadsData = await recentLeadsRes.json();
        setRecentLeads(recentLeadsData.data || []);
      } catch (error) {
        console.error("Error loading stats:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadStats();
  }, []);

  const statsData = [
    {
      title: "Новые заявки",
      value: stats.newLeads.toString(),
      change: "Требуют внимания",
      icon: MessageSquare,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
      href: "/admin/leads?status=new",
    },
    {
      title: "Активные услуги",
      value: stats.totalServices.toString(),
      change: "Опубликовано на сайте",
      icon: FileText,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/30",
      href: "/admin/services",
    },
    {
      title: "Опубликованных кейсов",
      value: stats.activeCases.toString(),
      change: "Показано на сайте",
      icon: Briefcase,
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900/30",
      href: "/admin/cases",
    },
    {
      title: "Опубликованных новостей",
      value: stats.publishedNews.toString(),
      change: "В блоге",
      icon: Eye,
      color: "text-orange-600",
      bgColor: "bg-orange-100 dark:bg-orange-900/30",
      href: "/admin/news",
    },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Дашборд</h1>
          <p className="text-muted-foreground">
            Обзор активности и статистики сайта
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          Обновлено: только что
        </div>
      </div>

      {/* Stats Grid */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center justify-center h-24">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
        >
          {statsData.map((stat) => {
            const Icon = stat.icon;
            return (
              <motion.div key={stat.title} variants={item}>
                <Link href={stat.href}>
                  <Card className="hover:border-foreground/20 transition-colors cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">
                            {stat.title}
                          </p>
                          <p className="text-3xl font-bold text-foreground mt-1">
                            {stat.value}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {stat.change}
                          </p>
                        </div>
                        <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                          <Icon className={`h-6 w-6 ${stat.color}`} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Leads */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Последние заявки</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/leads">Все заявки →</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : recentLeads.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Заявок пока нет</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentLeads.map((lead) => (
                    <div
                      key={lead.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-foreground">
                            {lead.name}
                          </p>
                          <Badge variant="default" className="text-xs">
                            {lead.status === "NEW" ? "Новая" : lead.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span>{lead.phone}</span>
                          {lead.service && (
                            <>
                              <span>•</span>
                              <span>{lead.service}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatDateShort(lead.createdAt.toISOString())}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Быстрые действия</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                <Button className="w-full justify-start" asChild>
                  <Link href="/admin/news/new">
                    <FileText className="mr-2 h-4 w-4" />
                    Создать новость
                  </Link>
                </Button>
                <Button className="w-full justify-start" variant="outline" asChild>
                  <Link href="/admin/cases/new">
                    <Briefcase className="mr-2 h-4 w-4" />
                    Добавить кейс
                  </Link>
                </Button>
                <Button className="w-full justify-start" variant="outline" asChild>
                  <Link href="/admin/services/new">
                    <FileText className="mr-2 h-4 w-4" />
                    Добавить услугу
                  </Link>
                </Button>
                <Button className="w-full justify-start" variant="outline" asChild>
                  <Link href="/admin/settings">
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Настройки сайта
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* System Status */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Статус системы</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Сайт работает</span>
                  </div>
                  <Badge variant="secondary">Онлайн</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">База данных</span>
                  </div>
                  <Badge variant="secondary">Подключена</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm">Telegram уведомления</span>
                  </div>
                  <Badge variant="outline">
                    {process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN ? "Настроено" : "Настроить"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
