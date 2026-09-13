"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Copy, Loader2, Users, Wallet, Briefcase, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { formatRubFromKopecks } from "@/lib/platform/money";

type Overview = {
  profile: {
    status: string;
    displayName: string;
    slug: string;
    specialization: string | null;
    city: string | null;
  } | null;
  referralCode: string | null;
  inviteUrl: string;
  stats: {
    referrals: number;
    contracts: number;
    earnedKopecks: number;
    pendingKopecks: number;
  };
  fees: {
    platformFeePercent: number;
    referralLevel1Percent: number;
    referralLevel2Percent: number;
    maxReferralDepth: number;
  };
};

export default function LawyerHomePage() {
  const [data, setData] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/lawyer/overview")
      .then((r) => r.json())
      .then((json) => setData(json))
      .catch(() => toast.error("Не удалось загрузить кабинет"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data) {
    return <p className="text-muted-foreground">Нет данных</p>;
  }

  const statusLabel: Record<string, string> = {
    PENDING: "На модерации",
    ACTIVE: "Активен",
    SUSPENDED: "Приостановлен",
    REJECTED: "Отклонён",
  };

  const copyInvite = async () => {
    try {
      await navigator.clipboard.writeText(data.inviteUrl);
      toast.success("Ссылка скопирована");
    } catch {
      toast.error("Не удалось скопировать");
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-light tracking-tight">
          Кабинет <span className="font-serif italic">юриста</span>
        </h1>
        <p className="text-muted-foreground mt-2">
          {data.profile?.displayName || "Профиль"}
          {data.profile?.status
            ? ` · ${statusLabel[data.profile.status] || data.profile.status}`
            : ""}
        </p>
      </div>

      {data.profile?.status === "PENDING" && (
        <div className="rounded-2xl border border-border bg-secondary/40 p-4 text-sm">
          Заявка на проверке. Пока доступны реферальная ссылка и профиль; полный
          приём клиентов откроется после модерации.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Рефералы",
            value: String(data.stats.referrals),
            icon: Users,
            href: "/lawyer/referrals",
          },
          {
            label: "Договоры",
            value: String(data.stats.contracts),
            icon: Briefcase,
            href: "/lawyer/contracts",
          },
          {
            label: "Начислено",
            value: formatRubFromKopecks(data.stats.earnedKopecks),
            icon: Wallet,
            href: "/lawyer/earnings",
          },
          {
            label: "К выплате",
            value: formatRubFromKopecks(data.stats.pendingKopecks),
            icon: Wallet,
            href: "/lawyer/earnings",
          },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.label}
              href={card.href}
              className="rounded-2xl border border-border p-5 hover:bg-secondary/30 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">{card.label}</span>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-2xl font-medium tracking-tight">{card.value}</p>
            </Link>
          );
        })}
      </div>

      <div className="rounded-2xl border border-border p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Link2 className="h-4 w-4" />
          <h2 className="text-lg font-medium">Реферальная ссылка</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Код: <span className="font-mono text-foreground">{data.referralCode || "—"}</span>
          . Платформа: {data.fees.platformFeePercent}% · L1:{" "}
          {data.fees.referralLevel1Percent}% · L2:{" "}
          {data.fees.referralLevel2Percent}% (с оплаченного договора).
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <code className="flex-1 rounded-xl bg-secondary/50 px-4 py-3 text-sm break-all">
            {data.inviteUrl}
          </code>
          <Button onClick={copyInvite} className="rounded-full shrink-0">
            <Copy className="h-4 w-4 mr-2" />
            Копировать
          </Button>
        </div>
      </div>
    </div>
  );
}
