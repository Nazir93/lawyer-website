"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  Plus,
  ChevronLeft,
  ChevronRight,
  User,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Временные данные
const upcomingAppointments = [
  {
    id: "1",
    title: "Консультация по делу о разделе имущества",
    lawyer: "Адвокат И.И. Иванов",
    date: "25 января 2024",
    time: "14:00 - 15:00",
    type: "online",
    status: "confirmed",
  },
  {
    id: "2",
    title: "Обсуждение стратегии по взысканию долга",
    lawyer: "Адвокат И.И. Иванов",
    date: "30 января 2024",
    time: "10:00 - 11:00",
    type: "offline",
    address: "ул. Примерная, д. 10, офис 5",
    status: "pending",
  },
];

const pastAppointments = [
  {
    id: "3",
    title: "Первичная консультация",
    lawyer: "Адвокат И.И. Иванов",
    date: "15 декабря 2023",
    time: "12:00 - 13:00",
    type: "online",
    status: "completed",
  },
  {
    id: "4",
    title: "Подписание договора",
    lawyer: "Адвокат И.И. Иванов",
    date: "18 декабря 2023",
    time: "16:00 - 16:30",
    type: "offline",
    address: "ул. Примерная, д. 10, офис 5",
    status: "completed",
  },
];

const timeSlots = [
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
];

const statusConfig = {
  confirmed: {
    label: "Подтверждено",
    color: "bg-green-500",
    textColor: "text-green-600 dark:text-green-400",
  },
  pending: {
    label: "Ожидает",
    color: "bg-yellow-500",
    textColor: "text-yellow-600 dark:text-yellow-400",
  },
  completed: {
    label: "Завершено",
    color: "bg-gray-500",
    textColor: "text-muted-foreground",
  },
  cancelled: {
    label: "Отменено",
    color: "bg-red-500",
    textColor: "text-red-600 dark:text-red-400",
  },
};

export default function AppointmentsPage() {
  const [currentMonth, setCurrentMonth] = useState<Date | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [today, setToday] = useState<Date | null>(null);

  // Инициализируем даты только на клиенте
  useEffect(() => {
    setCurrentMonth(new Date());
    setToday(new Date());
  }, []);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const formatMonth = (date: Date) => {
    return date.toLocaleDateString("ru-RU", { month: "long", year: "numeric" });
  };

  if (!currentMonth || !today) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Загрузка...</div>
      </div>
    );
  }

  const days = getDaysInMonth(currentMonth);
  const todayNormalized = new Date(today);
  todayNormalized.setHours(0, 0, 0, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-light tracking-tight">Записи</h1>
          <p className="text-muted-foreground mt-1">
            Управление вашими консультациями
          </p>
        </div>
        <Button className="rounded-full gap-2" asChild>
          <Link href="/dashboard/appointments/new">
            <Plus className="h-4 w-4" />
            Записаться
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="upcoming" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-3 h-auto p-1 rounded-full bg-secondary/50">
          <TabsTrigger value="upcoming" className="rounded-full py-2">
            Предстоящие
          </TabsTrigger>
          <TabsTrigger value="past" className="rounded-full py-2">
            Прошедшие
          </TabsTrigger>
          <TabsTrigger value="calendar" className="rounded-full py-2">
            Календарь
          </TabsTrigger>
        </TabsList>

        {/* Upcoming */}
        <TabsContent value="upcoming">
          <div className="space-y-4">
            {upcomingAppointments.length > 0 ? (
              upcomingAppointments.map((appointment, index) => {
                const status = statusConfig[appointment.status as keyof typeof statusConfig];
                return (
                  <motion.div
                    key={appointment.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="hover:border-foreground/20 transition-colors">
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center gap-6">
                          {/* Date Badge */}
                          <div className="flex md:flex-col items-center gap-3 md:gap-1 md:w-20 md:text-center">
                            <div className="w-14 h-14 rounded-xl bg-secondary flex flex-col items-center justify-center">
                              <span className="text-xs text-muted-foreground">
                                {appointment.date.split(" ")[1]}
                              </span>
                              <span className="text-xl font-bold">
                                {appointment.date.split(" ")[0]}
                              </span>
                            </div>
                            <Badge variant="secondary" className="gap-1">
                              <span className={`w-1.5 h-1.5 rounded-full ${status.color}`} />
                              {status.label}
                            </Badge>
                          </div>

                          {/* Info */}
                          <div className="flex-1">
                            <h3 className="font-medium mb-2">{appointment.title}</h3>
                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <User className="h-4 w-4" />
                                {appointment.lawyer}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {appointment.time}
                              </span>
                              {appointment.type === "online" ? (
                                <span className="flex items-center gap-1">
                                  <Video className="h-4 w-4" />
                                  Онлайн
                                </span>
                              ) : (
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4" />
                                  {appointment.address}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2">
                            {appointment.type === "online" && (
                              <Button className="rounded-full">
                                <Video className="mr-2 h-4 w-4" />
                                Подключиться
                              </Button>
                            )}
                            <Button variant="outline" className="rounded-full">
                              Перенести
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })
            ) : (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground mb-4">
                  Нет запланированных консультаций
                </p>
                <Button className="rounded-full" asChild>
                  <Link href="/dashboard/appointments/new">Записаться</Link>
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Past */}
        <TabsContent value="past">
          <div className="space-y-4">
            {pastAppointments.map((appointment, index) => {
              const status = statusConfig[appointment.status as keyof typeof statusConfig];
              return (
                <motion.div
                  key={appointment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="opacity-75">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center gap-6">
                        <div className="flex md:flex-col items-center gap-3 md:gap-1 md:w-20 md:text-center">
                          <div className="w-14 h-14 rounded-xl bg-secondary flex flex-col items-center justify-center">
                            <span className="text-xs text-muted-foreground">
                              {appointment.date.split(" ")[1]}
                            </span>
                            <span className="text-xl font-bold">
                              {appointment.date.split(" ")[0]}
                            </span>
                          </div>
                          <Badge variant="secondary" className={status.textColor}>
                            {status.label}
                          </Badge>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium mb-2">{appointment.title}</h3>
                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <User className="h-4 w-4" />
                              {appointment.lawyer}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {appointment.time}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </TabsContent>

        {/* Calendar */}
        <TabsContent value="calendar">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Calendar */}
            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg capitalize">{formatMonth(currentMonth)}</CardTitle>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      setCurrentMonth(
                        new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
                      )
                    }
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      setCurrentMonth(
                        new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
                      )
                    }
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-1 text-center mb-2">
                  {["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"].map((day) => (
                    <div key={day} className="py-2 text-sm text-muted-foreground">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {days.map((day, index) => {
                    if (!day) {
                      return <div key={index} className="aspect-square" />;
                    }
                    const isToday = day.toDateString() === todayNormalized.toDateString();
                    const isPast = day < todayNormalized;
                    const isSelected =
                      selectedDate && day.toDateString() === selectedDate.toDateString();
                    const hasAppointment = upcomingAppointments.some(
                      (a) =>
                        new Date(a.date.split(" ").reverse().join("-")).toDateString() ===
                        day.toDateString()
                    );

                    return (
                      <button
                        key={index}
                        onClick={() => !isPast && setSelectedDate(day)}
                        disabled={isPast}
                        className={`aspect-square rounded-lg flex flex-col items-center justify-center text-sm transition-colors relative ${
                          isSelected
                            ? "bg-foreground text-background"
                            : isToday
                            ? "bg-secondary font-bold"
                            : isPast
                            ? "text-muted-foreground/50 cursor-not-allowed"
                            : "hover:bg-secondary"
                        }`}
                      >
                        {day.getDate()}
                        {hasAppointment && (
                          <span className="absolute bottom-1 w-1 h-1 rounded-full bg-blue-500" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Time Slots */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {selectedDate
                    ? selectedDate.toLocaleDateString("ru-RU", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                      })
                    : "Выберите дату"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedDate ? (
                  <div className="space-y-2">
                    {timeSlots.map((time) => (
                      <button
                        key={time}
                        className="w-full p-3 rounded-lg border border-border hover:border-foreground/20 hover:bg-secondary/50 transition-colors text-left"
                      >
                        <span className="font-medium">{time}</span>
                        <span className="text-sm text-muted-foreground ml-2">
                          Свободно
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">
                    Выберите дату в календаре, чтобы увидеть доступное время
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

