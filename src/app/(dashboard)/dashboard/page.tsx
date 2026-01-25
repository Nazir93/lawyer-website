"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  FileText,
  MessageSquare,
  Calendar,
  Clock,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDateShort, formatDateTime } from "@/lib/utils/date";

interface Case {
  id: string;
  title: string;
  category: string | null;
  status: string;
  statusLabel: string;
  nextAction?: string;
  nextDate?: string;
}

interface Message {
  id: string;
  from: string;
  preview: string;
  time: string;
  unread: boolean;
  conversation_id: string;
}

interface Appointment {
  id: string;
  title: string;
  appointment_date: string;
  duration_minutes: number;
  type: string;
}

const statusConfig = {
  in_progress: { color: "bg-blue-500", icon: Loader2 },
  pending: { color: "bg-yellow-500", icon: Clock },
  completed: { color: "bg-green-500", icon: CheckCircle2 },
  attention: { color: "bg-red-500", icon: AlertCircle },
};

export default function DashboardPage() {
  const [stats, setStats] = useState({
    activeCases: 0,
    newMessages: 0,
    nextAppointment: null as string | null,
  });
  const [activeCases, setActiveCases] = useState<Case[]>([]);
  const [recentMessages, setRecentMessages] = useState<Message[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Загружаем пользователя
      const userRes = await fetch("/api/users/me");
      const userData = await userRes.json();
      if (userRes.ok && userData.user) {
        setUserName(userData.user.name?.split(" ")[0] || "Пользователь");
      }

      // Загружаем дела
      const casesRes = await fetch("/api/dashboard/cases");
      const casesData = await casesRes.json();
      if (casesRes.ok) {
        const cases = (casesData.data || []).slice(0, 2).map((c: any) => ({
          id: c.id,
          title: c.title,
          category: c.category,
          status: "in_progress",
          statusLabel: "В работе",
        }));
        setActiveCases(cases);
        setStats(prev => ({ ...prev, activeCases: casesData.count || 0 }));
      }

      // Загружаем беседы и последние сообщения
      const conversationsRes = await fetch("/api/dashboard/conversations");
      const conversationsData = await conversationsRes.json();
      if (conversationsRes.ok) {
        const conversations = conversationsData.data || [];
        const unreadCount = conversations.reduce((sum: number, conv: any) => sum + (conv.unread_count || 0), 0);
        setStats(prev => ({ ...prev, newMessages: unreadCount }));

        // Загружаем последние сообщения из каждой беседы
        const messagesPromises = conversations.slice(0, 2).map(async (conv: any) => {
          const msgsRes = await fetch(`/api/dashboard/messages?conversation_id=${conv.conversation_id}`);
          const msgsData = await msgsRes.json();
          if (msgsRes.ok && msgsData.data && msgsData.data.length > 0) {
            const lastMsg = msgsData.data[msgsData.data.length - 1];
            return {
              id: lastMsg.id,
              from: conv.participant.name,
              preview: lastMsg.message_text.substring(0, 50) + "...",
              time: formatDateTime(lastMsg.created_at),
              unread: !lastMsg.is_read && lastMsg.receiver_id,
              conversation_id: conv.conversation_id,
            };
          }
          return null;
        });
        const messages = (await Promise.all(messagesPromises)).filter(Boolean);
        setRecentMessages(messages);
      }

      // Загружаем ближайшие записи
      const appointmentsRes = await fetch("/api/dashboard/appointments?upcoming=true");
      const appointmentsData = await appointmentsRes.json();
      if (appointmentsRes.ok) {
        const appointments = (appointmentsData.data || []).slice(0, 1);
        setUpcomingAppointments(appointments);
        if (appointments.length > 0) {
          setStats(prev => ({ 
            ...prev, 
            nextAppointment: formatDateShort(appointments[0].appointment_date) 
          }));
        }
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const statsData = [
    {
      title: "Активные дела",
      value: stats.activeCases.toString(),
      icon: FileText,
      href: "/dashboard/cases",
    },
    {
      title: "Новые сообщения",
      value: stats.newMessages.toString(),
      icon: MessageSquare,
      href: "/dashboard/messages",
    },
    {
      title: "Ближайшая запись",
      value: stats.nextAppointment || "Нет",
      icon: Calendar,
      href: "/dashboard/appointments",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-light tracking-tight">
          Добрый день, <span className="font-serif italic">{userName}</span>
        </h1>
        <p className="text-muted-foreground mt-1">
          Вот что происходит с вашими делами
        </p>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-4">
        {statsData.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={stat.href}>
                <Card className="hover:border-foreground/20 transition-colors cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          {stat.title}
                        </p>
                        <p className="text-3xl font-light tracking-tight mt-1">
                          {stat.value}
                        </p>
                      </div>
                      <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                        <Icon className="h-5 w-5" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Active Cases */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-medium">
                Активные дела
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard/cases">
                  Все дела
                  <ArrowUpRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : activeCases.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Нет активных дел
                </p>
              ) : (
                activeCases.map((caseItem) => {
                  const status = statusConfig[caseItem.status as keyof typeof statusConfig];
                  return (
                    <Link
                      key={caseItem.id}
                      href={`/dashboard/cases/${caseItem.id}`}
                      className="block"
                    >
                      <div className="p-4 rounded-xl border border-border hover:border-foreground/20 hover:bg-secondary/30 transition-all">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-medium">{caseItem.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {caseItem.category || "Дело"}
                            </p>
                          </div>
                          <Badge
                            variant="secondary"
                            className="gap-1.5"
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${status.color}`}
                            />
                            {caseItem.statusLabel}
                          </Badge>
                        </div>
                      </div>
                    </Link>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Messages */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-medium">Сообщения</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard/messages">
                  <ArrowUpRight className="h-3 w-3" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {isLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              ) : recentMessages.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Нет сообщений
                </p>
              ) : (
                recentMessages.map((message) => (
                  <Link
                    key={message.id}
                    href={`/dashboard/messages?conversation=${message.conversation_id}`}
                    className="block"
                  >
                    <div className="p-3 rounded-lg hover:bg-secondary/50 transition-colors">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">{message.from}</span>
                        {message.unread && (
                          <span className="w-2 h-2 rounded-full bg-blue-500" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {message.preview}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {message.time}
                      </p>
                    </div>
                  </Link>
                ))
              )}
            </CardContent>
          </Card>

          {/* Appointments */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-medium">
                Ближайшие записи
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard/appointments">
                  <ArrowUpRight className="h-3 w-3" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              ) : upcomingAppointments.length > 0 ? (
                <div className="space-y-3">
                  {upcomingAppointments.map((appointment) => {
                    const date = new Date(appointment.appointment_date);
                    return (
                      <div
                        key={appointment.id}
                        className="p-3 rounded-lg bg-secondary/50"
                      >
                        <p className="text-sm font-medium">{appointment.title}</p>
                        <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{formatDateShort(appointment.appointment_date)}</span>
                          <span>•</span>
                          <span>{date.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}</span>
                        </div>
                        <Badge variant="outline" className="mt-2 text-xs">
                          {appointment.type === "online" ? "Онлайн" : "В офисе"}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Нет запланированных записей
                </p>
              )}
              <Button
                variant="outline"
                className="w-full mt-4 rounded-full"
                asChild
              >
                <Link href="/dashboard/appointments">
                  Записаться на консультацию
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Быстрые действия</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-4 gap-3">
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
              <Link href="/dashboard/messages">
                <MessageSquare className="h-5 w-5" />
                <span className="text-sm">Написать юристу</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
              <Link href="/dashboard/appointments">
                <Calendar className="h-5 w-5" />
                <span className="text-sm">Записаться</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
              <Link href="/dashboard/documents">
                <FileText className="h-5 w-5" />
                <span className="text-sm">Документы</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
              <Link href="/dashboard/billing">
                <ArrowUpRight className="h-5 w-5" />
                <span className="text-sm">Оплатить</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

