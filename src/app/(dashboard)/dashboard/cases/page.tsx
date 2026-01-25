"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Search,
  Filter,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowUpRight,
  FileText,
  Calendar,
  Briefcase,
  Scale,
  Gavel,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDateShort } from "@/lib/utils/date";

interface Case {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  category: string | null;
  status: string;
  status_label: string;
  progress: number;
  next_action: string | null;
  next_action_date: string | null;
  start_date: string;
  updated_at: string;
}

type StatusConfigItem = {
  color: string;
  textColor: string;
  bgColor: string;
  icon: typeof Clock;
};

const statusConfig: Record<string, StatusConfigItem> = {
  consultation: {
    color: "bg-purple-500",
    textColor: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-50 dark:bg-purple-950",
    icon: Briefcase,
  },
  in_progress: {
    color: "bg-blue-500",
    textColor: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-950",
    icon: Loader2,
  },
  pending: {
    color: "bg-yellow-500",
    textColor: "text-yellow-600 dark:text-yellow-400",
    bgColor: "bg-yellow-50 dark:bg-yellow-950",
    icon: Clock,
  },
  court: {
    color: "bg-orange-500",
    textColor: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-50 dark:bg-orange-950",
    icon: Gavel,
  },
  appeal: {
    color: "bg-indigo-500",
    textColor: "text-indigo-600 dark:text-indigo-400",
    bgColor: "bg-indigo-50 dark:bg-indigo-950",
    icon: Scale,
  },
  completed: {
    color: "bg-green-500",
    textColor: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-50 dark:bg-green-950",
    icon: CheckCircle2,
  },
  cancelled: {
    color: "bg-red-500",
    textColor: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-50 dark:bg-red-950",
    icon: AlertCircle,
  },
};

export default function MyCasesPage() {
  const [cases, setCases] = useState<Case[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    loadCases();
  }, []);

  const loadCases = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/dashboard/cases");
      const data = await res.json();
      if (res.ok) {
        setCases(data.data || []);
      }
    } catch (error) {
      console.error("Error loading cases:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCases = cases.filter((c) => {
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeCases = cases.filter((c) => c.status !== "completed" && c.status !== "cancelled").length;
  const completedCases = cases.filter((c) => c.status === "completed").length;

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "сегодня";
    if (diffDays === 1) return "вчера";
    if (diffDays < 7) return `${diffDays} дн. назад`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} нед. назад`;
    return `${Math.floor(diffDays / 30)} мес. назад`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-light tracking-tight">Мои дела</h1>
          <p className="text-muted-foreground mt-1">
            {activeCases} активных, {completedCases} завершённых
          </p>
        </div>
        <Button className="rounded-full" asChild>
          <Link href="/contacts">
            Новая консультация
            <ArrowUpRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Loader2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-light">
                  {cases.filter((c) => c.status === "in_progress" || c.status === "court").length}
                </p>
                <p className="text-sm text-muted-foreground">В работе</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-light">
                  {cases.filter((c) => c.status === "pending" || c.status === "consultation").length}
                </p>
                <p className="text-sm text-muted-foreground">Ожидание</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-light">{completedCases}</p>
                <p className="text-sm text-muted-foreground">Завершено</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск по делам..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 rounded-full"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48 rounded-full">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Статус" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все статусы</SelectItem>
            <SelectItem value="consultation">Консультация</SelectItem>
            <SelectItem value="in_progress">В работе</SelectItem>
            <SelectItem value="pending">Ожидание</SelectItem>
            <SelectItem value="court">В суде</SelectItem>
            <SelectItem value="appeal">Апелляция</SelectItem>
            <SelectItem value="completed">Завершено</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Cases List */}
      <div className="space-y-4">
        {filteredCases.length > 0 ? (
          filteredCases.map((caseItem, index) => {
            const status = statusConfig[caseItem.status] || statusConfig.in_progress;
            const StatusIcon = status.icon;
            return (
              <motion.div
                key={caseItem.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href={`/dashboard/cases/${caseItem.id}`}>
                  <Card className="hover:border-foreground/20 transition-all cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                        {/* Main Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-3 mb-3">
                            <div
                              className={`w-10 h-10 rounded-full ${status.bgColor} flex items-center justify-center shrink-0`}
                            >
                              <StatusIcon className={`h-5 w-5 ${status.textColor}`} />
                            </div>
                            <div className="min-w-0">
                              <h3 className="text-lg font-medium truncate">
                                {caseItem.title}
                              </h3>
                              <div className="flex flex-wrap items-center gap-2 mt-1">
                                {caseItem.category && (
                                  <Badge variant="secondary">{caseItem.category}</Badge>
                                )}
                                <Badge
                                  variant="outline"
                                  className={`${status.textColor} border-current`}
                                >
                                  {caseItem.status_label}
                                </Badge>
                              </div>
                            </div>
                          </div>

                          {/* Meta */}
                          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              Начато: {formatDateShort(caseItem.start_date)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              Обновлено: {getRelativeTime(caseItem.updated_at)}
                            </span>
                          </div>
                        </div>

                        {/* Progress & Next Action */}
                        <div className="lg:w-64 lg:text-right">
                          {caseItem.status !== "completed" && caseItem.status !== "cancelled" && (
                            <>
                              <div className="mb-2">
                                <span className="text-sm text-muted-foreground">
                                  Прогресс
                                </span>
                                <div className="flex items-center gap-2 mt-1">
                                  <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-foreground rounded-full transition-all"
                                      style={{ width: `${caseItem.progress}%` }}
                                    />
                                  </div>
                                  <span className="text-sm font-medium">
                                    {caseItem.progress}%
                                  </span>
                                </div>
                              </div>
                              {caseItem.next_action && (
                                <p className="text-sm text-muted-foreground">
                                  {caseItem.next_action}
                                </p>
                              )}
                              {caseItem.next_action_date && (
                                <p className="text-sm font-medium">
                                  {formatDateShort(caseItem.next_action_date)}
                                </p>
                              )}
                            </>
                          )}
                          {caseItem.status === "completed" && (
                            <div className="flex items-center justify-end gap-2 text-green-600 dark:text-green-400">
                              <CheckCircle2 className="h-5 w-5" />
                              <span className="font-medium">
                                Дело успешно закрыто
                              </span>
                            </div>
                          )}
                          {caseItem.status === "cancelled" && (
                            <div className="flex items-center justify-end gap-2 text-red-600 dark:text-red-400">
                              <AlertCircle className="h-5 w-5" />
                              <span className="font-medium">
                                Дело отменено
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            );
          })
        ) : cases.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground mb-4">У вас пока нет дел</p>
            <Button className="rounded-full" asChild>
              <Link href="/contacts">
                Записаться на консультацию
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">Дела не найдены по заданным фильтрам</p>
          </div>
        )}
      </div>
    </div>
  );
}
