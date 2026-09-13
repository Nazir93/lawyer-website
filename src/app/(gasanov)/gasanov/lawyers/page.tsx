"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CheckCircle,
  Loader2,
  Scale,
  Search,
  ShieldOff,
  XCircle,
} from "lucide-react";
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
import { toast } from "sonner";

type LawyerItem = {
  id: string;
  displayName: string;
  slug: string;
  specialization: string | null;
  city: string | null;
  phone: string | null;
  barNumber: string | null;
  status: "PENDING" | "ACTIVE" | "SUSPENDED" | "REJECTED";
  verifiedAt: string | null;
  createdAt: string;
  user: {
    id: string;
    email: string | null;
    referralCode: string | null;
    referredById: string | null;
    createdAt: string;
  };
};

const statusLabel: Record<string, string> = {
  PENDING: "На модерации",
  ACTIVE: "Активен",
  SUSPENDED: "Приостановлен",
  REJECTED: "Отклонён",
};

const statusVariant: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  PENDING: "secondary",
  ACTIVE: "default",
  SUSPENDED: "outline",
  REJECTED: "destructive",
};

export default function AdminLawyersPage() {
  const [items, setItems] = useState<LawyerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/lawyers");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ошибка загрузки");
      setItems(data.items || []);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Ошибка загрузки");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((item) => {
      if (statusFilter !== "all" && item.status !== statusFilter) return false;
      if (!q) return true;
      const hay = [
        item.displayName,
        item.slug,
        item.specialization,
        item.city,
        item.user.email,
        item.user.referralCode,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [items, search, statusFilter]);

  const setStatus = async (id: string, status: LawyerItem["status"]) => {
    setUpdatingId(id);
    try {
      const res = await fetch("/api/admin/lawyers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Не удалось обновить");
      setItems((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                status,
                verifiedAt:
                  status === "ACTIVE"
                    ? new Date().toISOString()
                    : item.verifiedAt,
              }
            : item
        )
      );
      toast.success(`Статус: ${statusLabel[status]}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setUpdatingId(null);
    }
  };

  const pendingCount = items.filter((i) => i.status === "PENDING").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-light tracking-tight flex items-center gap-3">
          <Scale className="h-7 w-7" />
          Юристы платформы
        </h1>
        <p className="text-muted-foreground mt-2">
          Модерация заявок. На модерации: {pendingCount}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск по имени, email, городу..."
            className="pl-9 h-11 rounded-xl"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48 h-11 rounded-xl">
            <SelectValue placeholder="Статус" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все статусы</SelectItem>
            <SelectItem value="PENDING">На модерации</SelectItem>
            <SelectItem value="ACTIVE">Активные</SelectItem>
            <SelectItem value="SUSPENDED">Приостановленные</SelectItem>
            <SelectItem value="REJECTED">Отклонённые</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8">Юристов не найдено</p>
      ) : (
        <div className="rounded-2xl border border-border divide-y divide-border bg-background">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center gap-4 justify-between"
            >
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium truncate">{item.displayName}</p>
                  <Badge variant={statusVariant[item.status]}>
                    {statusLabel[item.status]}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {item.user.email || "без email"}
                  {item.specialization ? ` · ${item.specialization}` : ""}
                  {item.city ? ` · ${item.city}` : ""}
                </p>
                <p className="text-xs text-muted-foreground">
                  slug: {item.slug}
                  {item.barNumber ? ` · удост.: ${item.barNumber}` : ""}
                  {item.user.referralCode
                    ? ` · код: ${item.user.referralCode}`
                    : ""}
                  {" · "}
                  {new Date(item.createdAt).toLocaleDateString("ru-RU")}
                </p>
              </div>

              <div className="flex flex-wrap gap-2 shrink-0">
                {item.status !== "ACTIVE" && (
                  <Button
                    size="sm"
                    className="rounded-full"
                    disabled={updatingId === item.id}
                    onClick={() => setStatus(item.id, "ACTIVE")}
                  >
                    {updatingId === item.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-1.5" />
                    )}
                    Одобрить
                  </Button>
                )}
                {item.status !== "REJECTED" && item.status === "PENDING" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-full"
                    disabled={updatingId === item.id}
                    onClick={() => setStatus(item.id, "REJECTED")}
                  >
                    <XCircle className="h-4 w-4 mr-1.5" />
                    Отклонить
                  </Button>
                )}
                {item.status === "ACTIVE" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-full"
                    disabled={updatingId === item.id}
                    onClick={() => setStatus(item.id, "SUSPENDED")}
                  >
                    <ShieldOff className="h-4 w-4 mr-1.5" />
                    Приостановить
                  </Button>
                )}
                {item.status === "SUSPENDED" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-full"
                    disabled={updatingId === item.id}
                    onClick={() => setStatus(item.id, "REJECTED")}
                  >
                    <XCircle className="h-4 w-4 mr-1.5" />
                    Отклонить
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
