"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

type Contract = {
  id: string;
  title: string;
  status: string;
  amountLabel: string;
  createdAt: string;
  client: { name: string | null; email: string | null };
  commissions: { type: string; amount: number; status: string }[];
};

export default function LawyerContractsPage() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Contract[]>([]);

  useEffect(() => {
    fetch("/api/lawyer/contracts")
      .then((r) => r.json())
      .then((json) => setItems(json.items || []))
      .catch(() => toast.error("Не удалось загрузить договоры"))
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
        <h1 className="text-3xl font-light tracking-tight">Договоры</h1>
        <p className="text-muted-foreground mt-2">
          Договоры ваших клиентов. Комиссии считаются после статуса PAID.
        </p>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Договоров пока нет. Следующий шаг платформы — создание и оплата
          договоров в кабинете.
        </p>
      ) : (
        <div className="rounded-2xl border border-border divide-y divide-border">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4"
            >
              <div>
                <p className="font-medium">{item.title}</p>
                <p className="text-sm text-muted-foreground">
                  {item.client.name || item.client.email} · {item.status}
                </p>
              </div>
              <p className="font-medium">{item.amountLabel}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
