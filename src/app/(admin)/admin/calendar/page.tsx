"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDateShort, formatTime } from "@/lib/utils/date";
import { toast } from "sonner";

interface Appointment {
  id: string;
  user_id: string;
  lawyer_id: string;
  title: string;
  description: string | null;
  appointment_time: string;
  duration_minutes: number;
  type: "online" | "offline";
  status: "scheduled" | "completed" | "cancelled";
  meeting_link: string | null;
  created_at: string;
  user_name?: string;
  user_email?: string;
}

const DAYS_OF_WEEK = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
const MONTHS = [
  "Январь",
  "Февраль",
  "Март",
  "Апрель",
  "Май",
  "Июнь",
  "Июль",
  "Август",
  "Сентябрь",
  "Октябрь",
  "Ноябрь",
  "Декабрь",
];

export default function AdminCalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [formData, setFormData] = useState({
    user_id: "",
    title: "",
    description: "",
    appointment_time: "",
    duration_minutes: 60,
    type: "online" as "online" | "offline",
    meeting_link: "",
  });
  const [users, setUsers] = useState<Array<{ id: string; name: string; email: string }>>([]);

  useEffect(() => {
    loadAppointments();
    loadUsers();
  }, [currentMonth]);

  const loadAppointments = async () => {
    try {
      setIsLoading(true);
      const startOfMonth = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        1
      );
      const endOfMonth = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() + 1,
        0,
        23,
        59,
        59
      );

      const res = await fetch(
        `/api/admin/appointments?start=${startOfMonth.toISOString()}&end=${endOfMonth.toISOString()}`
      );
      const data = await res.json();
      if (res.ok) {
        setAppointments(data.data || []);
      }
    } catch (error) {
      console.error("Error loading appointments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (res.ok) {
        setUsers(data.data || []);
      }
    } catch (error) {
      console.error("Error loading users:", error);
    }
  };

  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = (firstDay.getDay() + 6) % 7; // Понедельник = 0

    const days = [];
    // Пустые ячейки для дней предыдущего месяца
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    // Дни текущего месяца
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const getAppointmentsForDate = (date: Date | null) => {
    if (!date) return [];
    const dateStr = date.toISOString().split("T")[0];
    return appointments.filter((apt) => {
      const aptDate = new Date(apt.appointment_time).toISOString().split("T")[0];
      return aptDate === dateStr;
    });
  };

  const handleSave = async () => {
    if (!formData.user_id || !formData.title || !formData.appointment_time) {
      toast.error("Заполните все обязательные поля");
      return;
    }

    try {
      const url = editingAppointment
        ? `/api/admin/appointments/${editingAppointment.id}`
        : "/api/admin/appointments";
      const method = editingAppointment ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          duration_minutes: parseInt(formData.duration_minutes.toString()),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(
          editingAppointment
            ? "Запись обновлена"
            : "Запись создана"
        );
        setIsDialogOpen(false);
        setEditingAppointment(null);
        setFormData({
          user_id: "",
          title: "",
          description: "",
          appointment_time: "",
          duration_minutes: 60,
          type: "online",
          meeting_link: "",
        });
        loadAppointments();
      } else {
        toast.error(data.error || "Ошибка сохранения");
      }
    } catch (error) {
      console.error("Error saving appointment:", error);
      toast.error("Ошибка сохранения");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Удалить запись?")) return;

    try {
      const res = await fetch(`/api/admin/appointments/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Запись удалена");
        loadAppointments();
      } else {
        toast.error("Ошибка удаления");
      }
    } catch (error) {
      console.error("Error deleting appointment:", error);
      toast.error("Ошибка удаления");
    }
  };

  const openDialog = (date?: Date, appointment?: Appointment) => {
    if (appointment) {
      setEditingAppointment(appointment);
      setFormData({
        user_id: appointment.user_id,
        title: appointment.title,
        description: appointment.description || "",
        appointment_time: new Date(appointment.appointment_time)
          .toISOString()
          .slice(0, 16),
        duration_minutes: appointment.duration_minutes,
        type: appointment.type,
        meeting_link: appointment.meeting_link || "",
      });
    } else if (date) {
      setSelectedDate(date);
      const dateTime = new Date(date);
      dateTime.setHours(10, 0, 0, 0);
      setFormData({
        user_id: "",
        title: "",
        description: "",
        appointment_time: dateTime.toISOString().slice(0, 16),
        duration_minutes: 60,
        type: "online",
        meeting_link: "",
      });
    }
    setIsDialogOpen(true);
  };

  const days = getDaysInMonth();
  const selectedDateAppointments = getAppointmentsForDate(selectedDate);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Календарь записей</h1>
          <p className="text-muted-foreground">
            Управление записями клиентов на консультации
          </p>
        </div>
        <Button onClick={() => openDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Новая запись
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
                onClick={() => {
                  setCurrentMonth(
                    new Date(
                      currentMonth.getFullYear(),
                      currentMonth.getMonth() - 1
                    )
                  );
                }}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-xl font-semibold">
                {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setCurrentMonth(
                    new Date(
                      currentMonth.getFullYear(),
                      currentMonth.getMonth() + 1
                    )
                  );
                }}
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
                    <div
                      key={day}
                      className="text-center text-sm font-medium text-muted-foreground py-2"
                    >
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {days.map((day, index) => {
                    const dayAppointments = day
                      ? getAppointmentsForDate(day)
                      : [];
                    const isToday =
                      day &&
                      day.toDateString() === new Date().toDateString();
                    const isSelected =
                      day &&
                      selectedDate &&
                      day.toDateString() === selectedDate.toDateString();

                    return (
                      <button
                        key={index}
                        onClick={() => {
                          if (day) {
                            setSelectedDate(day);
                            openDialog(day);
                          }
                        }}
                        className={`aspect-square p-1 rounded-lg border transition-colors ${
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
                            <div className="text-sm font-medium mb-1">
                              {day.getDate()}
                            </div>
                            {dayAppointments.length > 0 && (
                              <div className="space-y-0.5">
                                {dayAppointments.slice(0, 2).map((apt) => (
                                  <div
                                    key={apt.id}
                                    className={`text-[10px] px-1 py-0.5 rounded truncate ${
                                      apt.status === "completed"
                                        ? "bg-green-500/20 text-green-600"
                                        : apt.status === "cancelled"
                                        ? "bg-red-500/20 text-red-600"
                                        : "bg-blue-500/20 text-blue-600"
                                    }`}
                                  >
                                    {formatTime(apt.appointment_time)}
                                  </div>
                                ))}
                                {dayAppointments.length > 2 && (
                                  <div className="text-[10px] text-muted-foreground">
                                    +{dayAppointments.length - 2}
                                  </div>
                                )}
                              </div>
                            )}
                          </>
                        )}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Список записей на выбранную дату */}
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedDate
                ? formatDateShort(selectedDate.toISOString())
                : "Выберите дату"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDate ? (
              selectedDateAppointments.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Нет записей на эту дату
                </p>
              ) : (
                <div className="space-y-3">
                  {selectedDateAppointments.map((apt) => (
                    <div
                      key={apt.id}
                      className="p-3 rounded-lg border border-border hover:bg-secondary transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm mb-1">
                            {apt.title}
                          </h4>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                            <Clock className="h-3 w-3" />
                            {formatTime(apt.appointment_time)} (
                            {apt.duration_minutes} мин)
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                            <User className="h-3 w-3" />
                            {apt.user_name || apt.user_email || "Клиент"}
                          </div>
                          {apt.type === "online" ? (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Video className="h-3 w-3" />
                              Онлайн
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              Офлайн
                            </div>
                          )}
                        </div>
                        <Badge
                          variant={
                            apt.status === "completed"
                              ? "default"
                              : apt.status === "cancelled"
                              ? "destructive"
                              : "secondary"
                          }
                          className="text-xs"
                        >
                          {apt.status === "completed"
                            ? "Завершено"
                            : apt.status === "cancelled"
                            ? "Отменено"
                            : "Запланировано"}
                        </Badge>
                      </div>
                      <div className="flex gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => openDialog(undefined, apt)}
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Изменить
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleDelete(apt.id)}
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Удалить
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                Выберите дату в календаре
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Диалог создания/редактирования записи */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingAppointment ? "Изменить запись" : "Новая запись"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="user_id">Клиент *</Label>
              <Select
                value={formData.user_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, user_id: value })
                }
              >
                <SelectTrigger id="user_id">
                  <SelectValue placeholder="Выберите клиента" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="title">Название *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Консультация по делу..."
              />
            </div>

            <div>
              <Label htmlFor="description">Описание</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Дополнительная информация..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="appointment_time">Дата и время *</Label>
                <Input
                  id="appointment_time"
                  type="datetime-local"
                  value={formData.appointment_time}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      appointment_time: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <Label htmlFor="duration_minutes">Длительность (мин) *</Label>
                <Input
                  id="duration_minutes"
                  type="number"
                  value={formData.duration_minutes}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      duration_minutes: parseInt(e.target.value) || 60,
                    })
                  }
                  min={15}
                  max={480}
                  step={15}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="type">Тип консультации *</Label>
              <Select
                value={formData.type}
                onValueChange={(value: "online" | "offline") =>
                  setFormData({ ...formData, type: value })
                }
              >
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="online">Онлайн</SelectItem>
                  <SelectItem value="offline">Офлайн</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.type === "online" && (
              <div>
                <Label htmlFor="meeting_link">Ссылка на встречу</Label>
                <Input
                  id="meeting_link"
                  value={formData.meeting_link}
                  onChange={(e) =>
                    setFormData({ ...formData, meeting_link: e.target.value })
                  }
                  placeholder="https://zoom.us/j/..."
                />
              </div>
            )}

            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false);
                  setEditingAppointment(null);
                }}
              >
                Отмена
              </Button>
              <Button onClick={handleSave}>
                {editingAppointment ? "Сохранить" : "Создать"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

