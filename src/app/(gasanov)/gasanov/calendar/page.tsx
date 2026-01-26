"use client";

import { useState, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  Video,
  MapPin,
  Plus,
  Edit,
  Trash2,
  Loader2,
  Settings,
  Check,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDateShort, formatTime } from "@/lib/utils/date";
import { toast } from "sonner";

interface TimeSlot {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  is_booked: boolean;
  is_available: boolean;
  appointment_id: string | null;
}

interface Appointment {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  appointmentDate: string;
  durationMinutes: number;
  type: string;
  status: string;
  user_name?: string;
  user_email?: string;
}

const DAYS_OF_WEEK = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
const MONTHS = [
  "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
  "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь",
];

export default function AdminCalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateSettings, setGenerateSettings] = useState({
    start_hour: 9,
    end_hour: 18,
    slot_duration: 60,
    skip_weekends: true,
  });

  useEffect(() => {
    loadData();
  }, [currentMonth]);

  const loadData = async () => {
    setIsLoading(true);
    await Promise.all([loadTimeSlots(), loadAppointments()]);
    setIsLoading(false);
  };

  const loadTimeSlots = async () => {
    try {
      const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

      const res = await fetch(
        `/api/gasanov/timeslots?start=${startOfMonth.toISOString()}&end=${endOfMonth.toISOString()}`
      );
      const data = await res.json();
      if (res.ok) {
        setTimeSlots(data.data || []);
      }
    } catch (error) {
      console.error("Error loading time slots:", error);
    }
  };

  const loadAppointments = async () => {
    try {
      const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0, 23, 59, 59);

      const res = await fetch(
        `/api/gasanov/appointments?start=${startOfMonth.toISOString()}&end=${endOfMonth.toISOString()}`
      );
      const data = await res.json();
      if (res.ok) {
        setAppointments(data.data || []);
      }
    } catch (error) {
      console.error("Error loading appointments:", error);
    }
  };

  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = (firstDay.getDay() + 6) % 7;

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const getSlotsForDate = (date: Date | null) => {
    if (!date) return [];
    const dateStr = date.toISOString().split("T")[0];
    return timeSlots.filter((slot) => slot.date === dateStr);
  };

  const getAppointmentsForDate = (date: Date | null) => {
    if (!date) return [];
    const dateStr = date.toISOString().split("T")[0];
    return appointments.filter((apt) => {
      const aptDate = new Date(apt.appointmentDate).toISOString().split("T")[0];
      return aptDate === dateStr;
    });
  };

  const handleGenerateSlots = async () => {
    if (!selectedDate) {
      toast.error("Выберите дату");
      return;
    }

    setIsGenerating(true);
    try {
      const res = await fetch("/api/gasanov/timeslots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: selectedDate.toISOString(),
          generate_week: true,
          ...generateSettings,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(`Создано ${data.count} слотов`);
        setIsGenerateDialogOpen(false);
        loadTimeSlots();
      } else {
        toast.error(data.error || "Ошибка создания слотов");
      }
    } catch (error) {
      toast.error("Ошибка создания слотов");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteSlot = async (slotId: string) => {
    try {
      const res = await fetch(`/api/gasanov/timeslots?id=${slotId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Слот удалён");
        loadTimeSlots();
      } else {
        toast.error("Ошибка удаления");
      }
    } catch (error) {
      toast.error("Ошибка удаления");
    }
  };

  const handleDeleteDaySlots = async () => {
    if (!selectedDate) return;
    if (!confirm("Удалить все незанятые слоты за этот день?")) return;

    try {
      const dateStr = selectedDate.toISOString().split("T")[0];
      const res = await fetch(`/api/gasanov/timeslots?date=${dateStr}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Слоты удалены");
        loadTimeSlots();
      } else {
        toast.error("Ошибка удаления");
      }
    } catch (error) {
      toast.error("Ошибка удаления");
    }
  };

  const days = getDaysInMonth();
  const selectedDateSlots = getSlotsForDate(selectedDate);
  const selectedDateAppointments = getAppointmentsForDate(selectedDate);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Календарь записей</h1>
          <p className="text-muted-foreground">
            Управление временными окнами и записями клиентов
          </p>
        </div>
        <Button onClick={() => {
          if (!selectedDate) {
            setSelectedDate(new Date());
          }
          setIsGenerateDialogOpen(true);
        }}>
          <Settings className="mr-2 h-4 w-4" />
          Настроить расписание
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Календарь */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-xl font-semibold">
                {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {DAYS_OF_WEEK.map((day) => (
                    <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {days.map((day, index) => {
                    const daySlots = day ? getSlotsForDate(day) : [];
                    const dayAppointments = day ? getAppointmentsForDate(day) : [];
                    const availableCount = daySlots.filter((s) => !s.is_booked && s.is_available).length;
                    const bookedCount = daySlots.filter((s) => s.is_booked).length;
                    const isToday = day && day.toDateString() === new Date().toDateString();
                    const isSelected = day && selectedDate && day.toDateString() === selectedDate.toDateString();

                    return (
                      <button
                        key={index}
                        onClick={() => day && setSelectedDate(day)}
                        className={`aspect-square p-1 rounded-lg border transition-colors text-left ${
                          !day
                            ? "border-transparent"
                            : isSelected
                            ? "border-foreground bg-foreground text-background"
                            : isToday
                            ? "border-primary bg-primary/10"
                            : "border-border hover:bg-secondary"
                        }`}
                      >
                        {day && (
                          <>
                            <div className="text-sm font-medium mb-1">{day.getDate()}</div>
                            <div className="space-y-0.5">
                              {availableCount > 0 && (
                                <div className="text-[10px] px-1 py-0.5 rounded bg-green-500/20 text-green-600 truncate">
                                  {availableCount} своб.
                                </div>
                              )}
                              {bookedCount > 0 && (
                                <div className="text-[10px] px-1 py-0.5 rounded bg-blue-500/20 text-blue-600 truncate">
                                  {bookedCount} зап.
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded bg-green-500/20" />
                    Свободные окна
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded bg-blue-500/20" />
                    Занятые окна
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Слоты на выбранную дату */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">
              {selectedDate ? formatDateShort(selectedDate.toISOString()) : "Выберите дату"}
            </CardTitle>
            {selectedDate && selectedDateSlots.length > 0 && (
              <Button variant="ghost" size="sm" onClick={handleDeleteDaySlots}>
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {selectedDate ? (
              <Tabs defaultValue="slots">
                <TabsList className="w-full mb-4">
                  <TabsTrigger value="slots" className="flex-1">Окна ({selectedDateSlots.length})</TabsTrigger>
                  <TabsTrigger value="appointments" className="flex-1">Записи ({selectedDateAppointments.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="slots">
                  {selectedDateSlots.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-sm text-muted-foreground mb-4">Нет окон на этот день</p>
                      <Button size="sm" onClick={() => setIsGenerateDialogOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Создать окна
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[400px] overflow-y-auto">
                      {selectedDateSlots
                        .sort((a, b) => a.start_time.localeCompare(b.start_time))
                        .map((slot) => (
                          <div
                            key={slot.id}
                            className={`p-3 rounded-lg border flex items-center justify-between ${
                              slot.is_booked
                                ? "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800"
                                : "border-border"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{slot.start_time} - {slot.end_time}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {slot.is_booked ? (
                                <Badge variant="secondary" className="bg-blue-500/10 text-blue-600">
                                  Занято
                                </Badge>
                              ) : (
                                <>
                                  <Badge variant="secondary" className="bg-green-500/10 text-green-600">
                                    Свободно
                                  </Badge>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => handleDeleteSlot(slot.id)}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="appointments">
                  {selectedDateAppointments.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      Нет записей на этот день
                    </p>
                  ) : (
                    <div className="space-y-3 max-h-[400px] overflow-y-auto">
                      {selectedDateAppointments.map((apt) => (
                        <div key={apt.id} className="p-3 rounded-lg border border-border">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-sm">{apt.title}</h4>
                            <Badge
                              variant={apt.status === "COMPLETED" ? "default" : apt.status === "CANCELLED" ? "destructive" : "secondary"}
                              className="text-xs"
                            >
                              {apt.status === "COMPLETED" ? "Завершено" : apt.status === "CANCELLED" ? "Отменено" : "Запланировано"}
                            </Badge>
                          </div>
                          <div className="space-y-1 text-xs text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Clock className="h-3 w-3" />
                              {formatTime(apt.appointmentDate)} ({apt.durationMinutes} мин)
                            </div>
                            <div className="flex items-center gap-2">
                              <User className="h-3 w-3" />
                              {apt.user_name || apt.user_email || "Клиент"}
                            </div>
                            <div className="flex items-center gap-2">
                              {apt.type === "ONLINE" ? <Video className="h-3 w-3" /> : <MapPin className="h-3 w-3" />}
                              {apt.type === "ONLINE" ? "Онлайн" : "В офисе"}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                Выберите дату в календаре
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Диалог настройки расписания */}
      <Dialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Настройка расписания</DialogTitle>
            <DialogDescription>
              Создание временных окон для записи клиентов на неделю начиная с{" "}
              {selectedDate ? formatDateShort(selectedDate.toISOString()) : "выбранной даты"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Начало рабочего дня</Label>
                <Input
                  type="number"
                  min={6}
                  max={20}
                  value={generateSettings.start_hour}
                  onChange={(e) => setGenerateSettings({ ...generateSettings, start_hour: parseInt(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Конец рабочего дня</Label>
                <Input
                  type="number"
                  min={8}
                  max={23}
                  value={generateSettings.end_hour}
                  onChange={(e) => setGenerateSettings({ ...generateSettings, end_hour: parseInt(e.target.value) })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Длительность слота (минут)</Label>
              <Input
                type="number"
                min={15}
                max={120}
                step={15}
                value={generateSettings.slot_duration}
                onChange={(e) => setGenerateSettings({ ...generateSettings, slot_duration: parseInt(e.target.value) })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Пропускать выходные</Label>
              <Switch
                checked={generateSettings.skip_weekends}
                onCheckedChange={(checked) => setGenerateSettings({ ...generateSettings, skip_weekends: checked })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsGenerateDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleGenerateSlots} disabled={isGenerating || !selectedDate}>
              {isGenerating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Check className="mr-2 h-4 w-4" />
              )}
              Создать окна на неделю
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
