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
  Loader2,
  Check,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { formatDateShort, formatTime } from "@/lib/utils/date";

interface Appointment {
  id: string;
  title: string;
  description: string | null;
  appointment_date: string;
  duration_minutes: number;
  type: string;
  status: string;
  meeting_link: string | null;
  office_address: string | null;
}

interface TimeSlot {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

interface AvailableDate {
  date: string;
  slots_count: number;
  slots: Array<{ id: string; start_time: string; end_time: string }>;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  scheduled: { label: "Запланировано", color: "bg-blue-500" },
  confirmed: { label: "Подтверждено", color: "bg-green-500" },
  completed: { label: "Завершено", color: "bg-gray-500" },
  cancelled: { label: "Отменено", color: "bg-red-500" },
  rescheduled: { label: "Перенесено", color: "bg-yellow-500" },
};

export default function AppointmentsPage() {
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [pastAppointments, setPastAppointments] = useState<Appointment[]>([]);
  const [availableDates, setAvailableDates] = useState<AvailableDate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState<Date | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{ id: string; start_time: string; end_time: string } | null>(null);
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    title: "Консультация",
    description: "",
    type: "online",
  });

  useEffect(() => {
    setCurrentMonth(new Date());
    loadAppointments();
    loadAvailableSlots();
  }, []);

  const loadAppointments = async () => {
    try {
      setIsLoading(true);
      
      // Загружаем предстоящие записи
      const upcomingRes = await fetch("/api/dashboard/appointments?upcoming=true");
      const upcomingData = await upcomingRes.json();
      if (upcomingRes.ok) {
        setUpcomingAppointments(upcomingData.data || []);
      }

      // Загружаем прошедшие записи
      const pastRes = await fetch("/api/dashboard/appointments?past=true");
      const pastData = await pastRes.json();
      if (pastRes.ok) {
        setPastAppointments(pastData.data || []);
      }
    } catch (error) {
      console.error("Error loading appointments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAvailableSlots = async () => {
    try {
      const res = await fetch("/api/public/timeslots");
      const data = await res.json();
      if (res.ok) {
        setAvailableDates(data.data || []);
      }
    } catch (error) {
      console.error("Error loading available slots:", error);
    }
  };

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

  const getAvailableSlotsForDate = (date: Date | null) => {
    if (!date) return [];
    const dateStr = date.toISOString().split("T")[0];
    const found = availableDates.find((d) => d.date === dateStr);
    return found?.slots || [];
  };

  const hasAvailableSlots = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    return availableDates.some((d) => d.date === dateStr && d.slots_count > 0);
  };

  const handleBookSlot = async () => {
    if (!selectedSlot) return;

    setIsBooking(true);
    try {
      const res = await fetch("/api/dashboard/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slot_id: selectedSlot.id,
          title: bookingForm.title,
          description: bookingForm.description,
          type: bookingForm.type,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Запись успешно создана!");
        setIsBookingDialogOpen(false);
        setSelectedSlot(null);
        setBookingForm({ title: "Консультация", description: "", type: "online" });
        loadAppointments();
        loadAvailableSlots();
      } else {
        toast.error(data.error || "Ошибка бронирования");
      }
    } catch (error) {
      toast.error("Ошибка бронирования");
    } finally {
      setIsBooking(false);
    }
  };

  const openBookingDialog = (slot: { id: string; start_time: string; end_time: string }) => {
    setSelectedSlot(slot);
    setIsBookingDialogOpen(true);
  };

  if (!currentMonth) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const days = getDaysInMonth(currentMonth);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const slotsForSelectedDate = getAvailableSlotsForDate(selectedDate);

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
            Записаться
          </TabsTrigger>
        </TabsList>

        {/* Upcoming */}
        <TabsContent value="upcoming">
          <div className="space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : upcomingAppointments.length > 0 ? (
              upcomingAppointments.map((appointment, index) => {
                const status = statusConfig[appointment.status] || statusConfig.scheduled;
                const date = new Date(appointment.appointment_date);
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
                          <div className="flex md:flex-col items-center gap-3 md:gap-1 md:w-20 md:text-center">
                            <div className="w-14 h-14 rounded-xl bg-secondary flex flex-col items-center justify-center">
                              <span className="text-xs text-muted-foreground">
                                {date.toLocaleDateString("ru-RU", { month: "short" })}
                              </span>
                              <span className="text-xl font-bold">
                                {date.getDate()}
                              </span>
                            </div>
                            <Badge variant="secondary" className="gap-1">
                              <span className={`w-1.5 h-1.5 rounded-full ${status.color}`} />
                              {status.label}
                            </Badge>
                          </div>

                          <div className="flex-1">
                            <h3 className="font-medium mb-2">{appointment.title}</h3>
                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {formatTime(appointment.appointment_date)} ({appointment.duration_minutes} мин)
                              </span>
                              {appointment.type === "online" ? (
                                <span className="flex items-center gap-1">
                                  <Video className="h-4 w-4" />
                                  Онлайн
                                </span>
                              ) : (
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4" />
                                  {appointment.office_address || "В офисе"}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex gap-2">
                            {appointment.type === "online" && appointment.meeting_link && (
                              <Button className="rounded-full" asChild>
                                <a href={appointment.meeting_link} target="_blank" rel="noopener noreferrer">
                                  <Video className="mr-2 h-4 w-4" />
                                  Подключиться
                                </a>
                              </Button>
                            )}
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
              </div>
            )}
          </div>
        </TabsContent>

        {/* Past */}
        <TabsContent value="past">
          <div className="space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : pastAppointments.length > 0 ? (
              pastAppointments.map((appointment, index) => {
                const status = statusConfig[appointment.status] || statusConfig.completed;
                const date = new Date(appointment.appointment_date);
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
                                {date.toLocaleDateString("ru-RU", { month: "short" })}
                              </span>
                              <span className="text-xl font-bold">
                                {date.getDate()}
                              </span>
                            </div>
                            <Badge variant="secondary">{status.label}</Badge>
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium mb-2">{appointment.title}</h3>
                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {formatTime(appointment.appointment_date)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                Нет прошедших записей
              </div>
            )}
          </div>
        </TabsContent>

        {/* Calendar for Booking */}
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
                    const isToday = day.toDateString() === today.toDateString();
                    const isPast = day < today;
                    const isSelected =
                      selectedDate && day.toDateString() === selectedDate.toDateString();
                    const hasSlots = hasAvailableSlots(day);

                    return (
                      <button
                        key={index}
                        onClick={() => !isPast && hasSlots && setSelectedDate(day)}
                        disabled={isPast || !hasSlots}
                        className={`aspect-square rounded-lg flex flex-col items-center justify-center text-sm transition-colors relative ${
                          isSelected
                            ? "bg-foreground text-background"
                            : isToday
                            ? "bg-secondary font-bold"
                            : isPast || !hasSlots
                            ? "text-muted-foreground/30 cursor-not-allowed"
                            : "hover:bg-secondary"
                        }`}
                      >
                        {day.getDate()}
                        {hasSlots && !isPast && (
                          <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-green-500" />
                        )}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                    Есть свободные окна
                  </div>
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
                  slotsForSelectedDate.length > 0 ? (
                    <div className="space-y-2">
                      {slotsForSelectedDate.map((slot) => (
                        <button
                          key={slot.id}
                          onClick={() => openBookingDialog(slot)}
                          className="w-full p-3 rounded-lg border border-border hover:border-green-500 hover:bg-green-500/10 transition-colors text-left group"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{slot.start_time} - {slot.end_time}</span>
                            <Badge variant="secondary" className="group-hover:bg-green-500 group-hover:text-white">
                              Свободно
                            </Badge>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm text-center py-8">
                      Нет свободных окон на эту дату
                    </p>
                  )
                ) : (
                  <p className="text-muted-foreground text-sm text-center py-8">
                    Выберите дату в календаре, чтобы увидеть доступное время
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Booking Dialog */}
      <Dialog open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Запись на консультацию</DialogTitle>
            <DialogDescription>
              {selectedDate && selectedSlot && (
                <>
                  {selectedDate.toLocaleDateString("ru-RU", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}{" "}
                  в {selectedSlot.start_time}
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Тема консультации</Label>
              <Input
                value={bookingForm.title}
                onChange={(e) => setBookingForm({ ...bookingForm, title: e.target.value })}
                placeholder="Консультация"
              />
            </div>

            <div className="space-y-2">
              <Label>Описание (необязательно)</Label>
              <Textarea
                value={bookingForm.description}
                onChange={(e) => setBookingForm({ ...bookingForm, description: e.target.value })}
                placeholder="Опишите ваш вопрос..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Формат встречи</Label>
              <Select
                value={bookingForm.type}
                onValueChange={(value) => setBookingForm({ ...bookingForm, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="online">
                    <div className="flex items-center gap-2">
                      <Video className="h-4 w-4" />
                      Онлайн
                    </div>
                  </SelectItem>
                  <SelectItem value="office">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      В офисе
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBookingDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleBookSlot} disabled={isBooking}>
              {isBooking ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Check className="mr-2 h-4 w-4" />
              )}
              Записаться
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
