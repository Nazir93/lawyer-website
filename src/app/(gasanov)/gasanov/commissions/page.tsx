"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CheckCircle2,
  Loader2,
  Banknote,
  XCircle,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

type CommissionItem = {
  id: string;
  type: string;
  level: number;
  percent: number;
  amountLabel: string;
  status: "PENDING" | "APPROVED" | "PAID" | "CANCELLED";
  createdAt: string;
  paidAt: string | null;
  note: string | null;
  beneficiary: {
    id: string;
    name: string | null;
    email: string | null;
    role: string;
  };
  contract: {
    id: string;
    title: string;
    contractAmountLabel?: string;
    amount: number;
    status: string;
    lawyer: { displayName: string };
    client: { name: string | null; email: string | null };
  };
  contractAmountLabel: string;
};

const statusLabel: Record<string, string> = {
  PENDING: "Ожидает",
  APPROVED: "Одобрено",
  PAID: "Выплачено",
  CANCELLED: "Отменено",
};

const typeLabel: Record<string, string> = {
  PLATFORM: "Платформа",
  REFERRAL_L1: "Реферал L1",
  REFERRAL_L2: "Реферал L2",
};

export default function AdminCommissionsPage() {
  const [items, setItems] = useState<CommissionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const qs =
        statusFilter === "all" ? "" : `?status=${encodeURIComponent(statusFilter)}`;
      const res = await fetch(`/api/admin/commissions${qs}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ошибка загрузки");
      setItems(data.items || []);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Ошибка загрузки");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const act = async (
    id: string,
    action: "approve" | "mark_paid" | "cancel"
  ) => {
    setUpdatingId(id);
    try {
      const res = await fetch("/api/admin/commissions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ошибка");
      toast.success(
        action === "approve"
          ? "Одобрено"
          : action === "mark_paid"
            ? "Отмечено как выплаченное"
            : "Отменено"
      );
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-light tracking-tight">Начисления</h1>
          <p className="text-muted-foreground mt-2">
            Комиссии платформы и рефералов после оплаты договоров. Выплаты
            пока учитываются вручную.
          </p>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[200px] rounded-xl">
            <SelectValue placeholder="Статус" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все статусы</SelectItem>
            <SelectItem value="PENDING">Ожидает</SelectItem>
            <SelectItem value="APPROVED">Одобрено</SelectItem>
            <SelectItem value="PAID">Выплачено</SelectItem>
            <SelectItem value="CANCELLED">Отменено</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Начислений пока нет. Они появятся после оплаты договора.
        </p>
      ) : (
        <div className="rounded-2xl border border-border divide-y divide-border">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4"
            >
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">
                    {typeLabel[item.type] || item.type} · {item.percent}%
                  </p>
                  <Badge variant="secondary">
                    {statusLabel[item.status] || item.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {item.beneficiary.name || item.beneficiary.email} · договор «
                  {item.contract.title}» ({item.contractAmountLabel}) ·{" "}
                  {item.contract.lawyer.displayName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(item.createdAt).toLocaleString("ru-RU")}
                  {item.note ? ` · ${item.note}` : ""}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <p className="font-medium mr-2">{item.amountLabel}</p>
                {item.status === "PENDING" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-full"
                    disabled={updatingId === item.id}
                    onClick={() => act(item.id, "approve")}
                  >
                    <ShieldCheck className="h-4 w-4 mr-1.5" />
                    Одобрить
                  </Button>
                )}
                {(item.status === "PENDING" || item.status === "APPROVED") && (
                  <Button
                    size="sm"
                    className="rounded-full"
                    disabled={updatingId === item.id}
                    onClick={() => act(item.id, "mark_paid")}
                  >
                    {updatingId === item.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Banknote className="h-4 w-4 mr-1.5" />
                        Выплачено
                      </>
                    )}
                  </Button>
                )}
                {item.status !== "PAID" && item.status !== "CANCELLED" && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="rounded-full text-destructive"
                    disabled={updatingId === item.id}
                    onClick={() => act(item.id, "cancel")}
                  >
                    <XCircle className="h-4 w-4 mr-1.5" />
                    Отмена
                  </Button>
                )}
                {item.status === "PAID" && (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
