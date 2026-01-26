"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Search,
  MoreVertical,
  Mail,
  Phone,
  User,
  Calendar,
  CheckCircle,
  XCircle,
  Eye,
  Loader2,
  Download,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDateShort, formatDateTime } from "@/lib/utils/date";
import { toast } from "sonner";

interface User {
  id: string;
  email?: string;
  phone?: string;
  name?: string;
  company?: string;
  position?: string;
  registration_method: "email" | "phone" | "vk" | "google" | "telegram";
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  last_login_at?: string;
  confirmed_at?: string;
  last_sign_in_at?: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [methodFilter, setMethodFilter] = useState<string>("all");
  const [activeFilter, setActiveFilter] = useState<string>("all");

  useEffect(() => {
    loadUsers();
  }, [methodFilter, activeFilter]);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (methodFilter !== "all") params.append("method", methodFilter);
      if (activeFilter !== "all") params.append("active", activeFilter);

      const response = await fetch(`/api/users?${params.toString()}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Ошибка загрузки пользователей");
      }

      setUsers(result.data || []);
    } catch (error: any) {
      toast.error(error.message || "Ошибка загрузки пользователей");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    loadUsers();
  };

  const handleExport = () => {
    const csv = [
      ["Имя", "Email", "Телефон", "Метод регистрации", "Дата регистрации", "Последний вход", "Статус"].join(","),
      ...users.map((user) =>
        [
          user.name || "",
          user.email || "",
          user.phone || "",
          user.registration_method,
          new Date(user.created_at).toLocaleDateString("ru-RU"),
          user.last_login_at ? new Date(user.last_login_at).toLocaleDateString("ru-RU") : "—",
          user.is_active ? "Активен" : "Неактивен",
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `users-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    toast.success("Данные экспортированы");
  };

  const stats = {
    total: users.length,
    email: users.filter((u) => u.registration_method === "email").length,
    phone: users.filter((u) => u.registration_method === "phone").length,
    vk: users.filter((u) => u.registration_method === "vk").length,
    telegram: users.filter((u) => u.registration_method === "telegram").length,
    active: users.filter((u) => u.is_active).length,
    verified: users.filter((u) => u.is_verified).length,
  };

  const methodLabels = {
    email: "Email",
    phone: "Телефон",
    vk: "VK",
    google: "Google",
    telegram: "Telegram",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Пользователи</h1>
          <p className="text-muted-foreground">Управление зарегистрированными клиентами</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Экспорт
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-7 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Всего</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="text-2xl font-bold text-blue-600">{stats.email}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Телефон</p>
            <p className="text-2xl font-bold text-green-600">{stats.phone}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">VK</p>
            <p className="text-2xl font-bold text-purple-600">{stats.vk}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Активных</p>
            <p className="text-2xl font-bold text-green-600">{stats.active}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Проверенных</p>
            <p className="text-2xl font-bold text-blue-600">{stats.verified}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск по имени, email, телефону..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="pl-9"
              />
            </div>
            <Select value={methodFilter} onValueChange={setMethodFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Метод регистрации" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все методы</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="phone">Телефон</SelectItem>
                <SelectItem value="vk">VK</SelectItem>
                <SelectItem value="telegram">Telegram</SelectItem>
              </SelectContent>
            </Select>
            <Select value={activeFilter} onValueChange={setActiveFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Статус" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все</SelectItem>
                <SelectItem value="true">Активные</SelectItem>
                <SelectItem value="false">Неактивные</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleSearch}>
              <Search className="mr-2 h-4 w-4" />
              Найти
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-12">
          <User className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground mb-4">Пользователей пока нет</p>
          <p className="text-sm text-muted-foreground">
            Пользователи появятся после регистрации на сайте
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {users.map((user, index) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium text-foreground">
                            {user.name || "Без имени"}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {methodLabels[user.registration_method] || user.registration_method}
                            </Badge>
                            {user.is_active ? (
                              <Badge variant="default" className="text-xs gap-1">
                                <CheckCircle className="h-3 w-3" />
                                Активен
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="text-xs gap-1">
                                <XCircle className="h-3 w-3" />
                                Неактивен
                              </Badge>
                            )}
                            {user.is_verified && (
                              <Badge variant="outline" className="text-xs">
                                Проверен
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4 mt-4 text-sm">
                        {user.email && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Mail className="h-4 w-4" />
                            <span>{user.email}</span>
                          </div>
                        )}
                        {user.phone && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Phone className="h-4 w-4" />
                            <span>{user.phone}</span>
                          </div>
                        )}
                        {user.company && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <span className="font-medium">Компания:</span>
                            <span>{user.company}</span>
                          </div>
                        )}
                        {user.position && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <span className="font-medium">Должность:</span>
                            <span>{user.position}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>Регистрация: {formatDateShort(user.created_at)}</span>
                        </div>
                        {user.last_login_at && (
                          <div className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            <span>Вход: {formatDateShort(user.last_login_at)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/gasanov/users/${user.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            Подробнее
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Mail className="mr-2 h-4 w-4" />
                          Отправить email
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

