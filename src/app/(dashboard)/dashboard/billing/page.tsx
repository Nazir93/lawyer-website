"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileSignature,
  Receipt,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CONTRACT_STATUS_LABEL } from "@/lib/platform/contract-labels";

type ContractItem = {
  id: string;
  title: string;
  description: string | null;
  status: keyof typeof CONTRACT_STATUS_LABEL;
  amountRub: number;
  amountLabel: string;
  createdAt: string;
  signedAt: string | null;
  paidAt: string | null;
  lawyer: {
    displayName: string;
    slug: string;
    specialization: string | null;
  };
};

const statusUi: Record<
  string,
  {
    label: string;
    color: string;
    textColor: string;
    bgColor: string;
    icon: typeof Clock;
  }
> = {
  DRAFT: {
    label: CONTRACT_STATUS_LABEL.DRAFT,
    color: "bg-muted-foreground",
    textColor: "text-muted-foreground",
    bgColor: "bg-secondary",
    icon: Clock,
  },
  SENT: {
    label: CONTRACT_STATUS_LABEL.SENT,
    color: "bg-yellow-500",
    textColor: "text-yellow-600 dark:text-yellow-400",
    bgColor: "bg-yellow-50 dark:bg-yellow-950",
    icon: Clock,
  },
  SIGNED: {
    label: CONTRACT_STATUS_LABEL.SIGNED,
    color: "bg-blue-500",
    textColor: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-950",
    icon: FileSignature,
  },
  PAID: {
    label: CONTRACT_STATUS_LABEL.PAID,
    color: "bg-green-500",
    textColor: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-50 dark:bg-green-950",
    icon: CheckCircle2,
  },
  CANCELLED: {
    label: CONTRACT_STATUS_LABEL.CANCELLED,
    color: "bg-red-500",
    textColor: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-50 dark:bg-red-950",
    icon: AlertCircle,
  },
  REFUNDED: {
    label: CONTRACT_STATUS_LABEL.REFUNDED,
    color: "bg-red-500",
    textColor: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-50 dark:bg-red-950",
    icon: AlertCircle,
  },
};

export default function BillingPage() {
  const [items, setItems] = useState<ContractItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/client/contracts");
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Ошибка загрузки");
    setItems(data.items || []);
  }, []);

  useEffect(() => {
    load()
      .catch((e) => toast.error(e.message || "Ошибка загрузки"))
      .finally(() => setLoading(false));
  }, [load]);

  const totals = useMemo(() => {
    const pending = items.filter((i) =>
      ["SENT", "SIGNED"].includes(i.status)
    );
    const paid = items.filter((i) => i.status === "PAID");
    return {
      pendingRub: pending.reduce((a, i) => a + i.amountRub, 0),
      paidRub: paid.reduce((a, i) => a + i.amountRub, 0),
      count: items.length,
    };
  }, [items]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "RUB",
      minimumFractionDigits: 0,
    }).format(amount);

  const act = async (id: string, action: "sign" | "confirm_paid") => {
    setActingId(id);
    try {
      const res = await fetch("/api/client/contracts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ошибка");
      toast.success(
        action === "sign"
          ? "Договор подписан"
          : "Оплата подтверждена. Комиссии начислены партнёрам."
      );
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setActingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-light tracking-tight">Оплата</h1>
        <p className="text-muted-foreground mt-1">
          Договоры с юристами: подписание и подтверждение оплаты
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">К оплате</p>
            <p className="text-3xl font-light tracking-tight mt-1">
              {formatCurrency(totals.pendingRub)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Оплачено</p>
            <p className="text-3xl font-light tracking-tight mt-1">
              {formatCurrency(totals.paidRub)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Всего договоров</p>
            <p className="text-3xl font-light tracking-tight mt-1">
              {totals.count}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-medium flex items-center gap-2">
          <Receipt className="h-5 w-5" />
          Договоры
        </h2>

        {items.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              Договоров пока нет. Когда юрист отправит вам договор, он появится
              здесь.
            </CardContent>
          </Card>
        ) : (
          items.map((item, index) => {
            const ui = statusUi[item.status] || statusUi.DRAFT;
            const StatusIcon = ui.icon;
            const canSign = item.status === "SENT";
            const canPay =
              item.status === "SENT" || item.status === "SIGNED";

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="hover:border-foreground/20 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-xl ${ui.bgColor} flex items-center justify-center shrink-0`}
                      >
                        <StatusIcon className={`h-6 w-6 ${ui.textColor}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <p className="font-medium">{item.title}</p>
                          <Badge variant="outline" className="text-xs">
                            {ui.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {item.lawyer.displayName}
                          {item.lawyer.specialization
                            ? ` · ${item.lawyer.specialization}`
                            : ""}
                          {" · "}
                          {new Date(item.createdAt).toLocaleDateString("ru-RU")}
                        </p>
                        {item.description && (
                          <p className="text-sm mt-2 text-muted-foreground">
                            {item.description}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col sm:items-end gap-2 shrink-0">
                        <p className="text-xl font-medium">
                          {item.amountLabel}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {canSign && (
                            <Button
                              variant="outline"
                              className="rounded-full"
                              disabled={actingId === item.id}
                              onClick={() => act(item.id, "sign")}
                            >
                              {actingId === item.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <>
                                  <FileSignature className="h-4 w-4 mr-1.5" />
                                  Подписать
                                </>
                              )}
                            </Button>
                          )}
                          {canPay && (
                            <Button
                              className="rounded-full"
                              disabled={actingId === item.id}
                              onClick={() => act(item.id, "confirm_paid")}
                            >
                              {actingId === item.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                "Подтвердить оплату"
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Как это работает</CardTitle>
          <CardDescription>
            Пока без эквайринга: оплата вне платформы, статус фиксируется здесь
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>1. Юрист создаёт договор и отправляет вам.</p>
          <p>2. Вы подписываете (фиксируем согласие).</p>
          <p>
            3. После реальной оплаты нажимаете «Подтвердить оплату» — или это
            делает юрист. Тогда начисляются комиссии платформы и рефералов.
          </p>
          <p>ЮKassa / онлайн-оплата — следующий этап.</p>
        </CardContent>
      </Card>
    </div>
  );
}
