"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Mail, Phone, RefreshCw } from "lucide-react";
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
import {
  LEAD_STATUSES,
  leadStatusLabel,
  type LeadStatusValue,
} from "@/lib/platform/leads";

type LeadItem = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  service: string | null;
  message: string | null;
  status: LeadStatusValue;
  source: string;
  createdAt: string;
};

type LeadStats = {
  total: number;
  newCount: number;
  inProgress: number;
  done: number;
};

const badgeVariant: Record<
  LeadStatusValue,
  "default" | "secondary" | "outline" | "destructive"
> = {
  NEW: "default",
  CONTACTED: "secondary",
  CONSULTATION: "outline",
  DONE: "secondary",
  REJECTED: "destructive",
};

export default function LawyerLeadsPage() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<LeadItem[]>([]);
  const [stats, setStats] = useState<LeadStats>({
    total: 0,
    newCount: 0,
    inProgress: 0,
    done: 0,
  });
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [q, setQ] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const params = new URLSearchParams();
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (q.trim()) params.set("q", q.trim());
    const res = await fetch(`/api/lawyer/leads?${params.toString()}`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Ошибка загрузки заявок");
    setItems(json.items || []);
    setStats(json.stats || { total: 0, newCount: 0, inProgress: 0, done: 0 });
  }, [statusFilter, q]);

  useEffect(() => {
    setLoading(true);
    load()
      .catch((e) => toast.error(e.message || "Ошибка загрузки"))
      .finally(() => setLoading(false));
  }, [load]);

  const updateStatus = async (id: string, status: LeadStatusValue) => {
    setUpdatingId(id);
    try {
      const res = await fetch("/api/lawyer/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Не удалось обновить");
      toast.success(`Статус: ${leadStatusLabel(status)}`);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setUpdatingId(null);
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString("ru-RU", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-light tracking-tight">
            Заявки <span className="font-serif italic">клиентов</span>
          </h1>
          <p className="text-muted-foreground mt-2">
            Обращения с вашей публичной страницы и формы контактов.
          </p>
        </div>
        <Button
          variant="outline"
          className="rounded-full"
          onClick={() => {
            setLoading(true);
            load()
              .catch((e) => toast.error(e.message || "Ошибка"))
              .finally(() => setLoading(false));
          }}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Обновить
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Всего", value: stats.total },
          { label: "Новые", value: stats.newCount },
          { label: "В работе", value: stats.inProgress },
          { label: "Завершено", value: stats.done },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-border p-4">
            <p className="text-sm text-muted-foreground">{s.label}</p>
            <p className="text-2xl font-medium tracking-tight mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          placeholder="Поиск по имени, телефону, email"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="rounded-xl"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="sm:w-56 rounded-xl">
            <SelectValue placeholder="Статус" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все статусы</SelectItem>
            {LEAD_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {leadStatusLabel(status)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : items.length === 0 ? (
        <p className="text-muted-foreground py-8">
          Пока нет заявок. Поделитесь ссылкой на профиль: /lawyers/ваш-slug
        </p>
      ) : (
        <div className="space-y-3">
          {items.map((lead) => (
            <div
              key={lead.id}
              className="rounded-2xl border border-border p-5 space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-lg font-medium tracking-tight">
                      {lead.name}
                    </h2>
                    <Badge variant={badgeVariant[lead.status]}>
                      {leadStatusLabel(lead.status)}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {formatDate(lead.createdAt)}
                    {lead.service ? ` · ${lead.service}` : ""}
                    {lead.source ? ` · ${lead.source}` : ""}
                  </p>
                </div>
                <Select
                  value={lead.status}
                  disabled={updatingId === lead.id}
                  onValueChange={(v) =>
                    updateStatus(lead.id, v as LeadStatusValue)
                  }
                >
                  <SelectTrigger className="w-full sm:w-48 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LEAD_STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>
                        {leadStatusLabel(status)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-wrap gap-4 text-sm">
                <a
                  href={`tel:${lead.phone.replace(/\D/g, "")}`}
                  className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
                >
                  <Phone className="h-3.5 w-3.5" />
                  {lead.phone}
                </a>
                {lead.email && (
                  <a
                    href={`mailto:${lead.email}`}
                    className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    {lead.email}
                  </a>
                )}
              </div>

              {lead.message && (
                <p className="text-sm text-muted-foreground whitespace-pre-wrap border-t border-border pt-3">
                  {lead.message}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
