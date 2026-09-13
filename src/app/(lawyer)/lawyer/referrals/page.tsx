"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

type Referral = {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  createdAt: string;
  lawyerProfile?: { status: string } | null;
  referredBy?: { name: string | null } | null;
  _count?: { referrals: number };
};

export default function LawyerReferralsPage() {
  const [loading, setLoading] = useState(true);
  const [level1, setLevel1] = useState<Referral[]>([]);
  const [level2, setLevel2] = useState<Referral[]>([]);

  useEffect(() => {
    fetch("/api/lawyer/referrals")
      .then((r) => r.json())
      .then((json) => {
        setLevel1(json.level1 || []);
        setLevel2(json.level2 || []);
      })
      .catch(() => toast.error("Не удалось загрузить рефералов"))
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
        <h1 className="text-3xl font-light tracking-tight">Рефералы</h1>
        <p className="text-muted-foreground mt-2">
          Уровень 1 — кого пригласили вы. Уровень 2 — кого пригласили они.
        </p>
      </div>

      <Section title={`Уровень 1 · ${level1.length}`} items={level1} />
      <Section
        title={`Уровень 2 · ${level2.length}`}
        items={level2}
        showParent
      />
    </div>
  );
}

function Section({
  title,
  items,
  showParent,
}: {
  title: string;
  items: Referral[];
  showParent?: boolean;
}) {
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-medium">{title}</h2>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">Пока пусто</p>
      ) : (
        <div className="rounded-2xl border border-border divide-y divide-border">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4"
            >
              <div>
                <p className="font-medium">{item.name || "Без имени"}</p>
                <p className="text-sm text-muted-foreground">
                  {item.email} · {item.role === "LAWYER" ? "Юрист" : "Клиент"}
                  {item.lawyerProfile?.status
                    ? ` · ${item.lawyerProfile.status}`
                    : ""}
                  {showParent && item.referredBy?.name
                    ? ` · через ${item.referredBy.name}`
                    : ""}
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                {new Date(item.createdAt).toLocaleDateString("ru-RU")}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
