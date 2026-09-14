"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

type Item = {
  id: string;
  type: string;
  level: number;
  percent: number;
  amountLabel: string;
  status: string;
  createdAt: string;
  contract: { title: string };
  contractAmountLabel: string;
};

type Summary = {
  status: string;
  count: number;
  amountLabel: string;
};

export default function LawyerEarningsPage() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Item[]>([]);
  const [summary, setSummary] = useState<Summary[]>([]);

  useEffect(() => {
    fetch("/api/lawyer/earnings")
      .then((r) => r.json())
      .then((json) => {
        setItems(json.items || []);
        setSummary(json.summary || []);
      })
      .catch(() => toast.error("Не удалось загрузить начисления"))
      .finally(() => setLoading(false));
  }, []);

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
        <h1 className="text-3xl font-light tracking-tight">Начисления</h1>
        <p className="text-muted-foreground mt-2">
          Комиссии с оплаченных договоров по реферальной программе.
        </p>
      </div>

      {summary.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-3">
          {summary.map((s) => (
            <div key={s.status} className="rounded-2xl border border-border p-4">
              <p className="text-sm text-muted-foreground">{s.status}</p>
              <p className="text-xl font-medium mt-1">{s.amountLabel}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.count} шт.</p>
            </div>
          ))}
        </div>
      )}

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Начислений пока нет. Они появятся после оплаты договоров
          приглашённых клиентов.
        </p>
      ) : (
        <div className="rounded-2xl border border-border divide-y divide-border">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4"
            >
              <div>
                <p className="font-medium">{item.contract.title}</p>
                <p className="text-sm text-muted-foreground">
                  {item.type} · {item.percent}% от {item.contractAmountLabel} ·{" "}
                  {item.status}
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium">{item.amountLabel}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(item.createdAt).toLocaleDateString("ru-RU")}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
