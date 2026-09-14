"use client";

import { useEffect, useState } from "react";
import { Loader2, Percent, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

type FeeSettings = {
  platformFeePercent: number;
  referralLevel1Percent: number;
  referralLevel2Percent: number;
  maxReferralDepth: number;
  minContractAmount: number;
};

export default function PlatformSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<FeeSettings>({
    platformFeePercent: 10,
    referralLevel1Percent: 5,
    referralLevel2Percent: 2,
    maxReferralDepth: 2,
    minContractAmount: 0,
  });

  useEffect(() => {
    fetch("/api/admin/platform-settings")
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || "Ошибка загрузки");
        setForm(data.settings);
      })
      .catch((e) => toast.error(e.message || "Ошибка"))
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/platform-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platformFeePercent: Number(form.platformFeePercent),
          referralLevel1Percent: Number(form.referralLevel1Percent),
          referralLevel2Percent: Number(form.referralLevel2Percent),
          maxReferralDepth: Number(form.maxReferralDepth),
          minContractAmount: Number(form.minContractAmount),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Не удалось сохранить");
      setForm(data.settings);
      toast.success("Настройки комиссий сохранены");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="text-3xl font-light tracking-tight flex items-center gap-3">
          <Percent className="h-7 w-7" />
          Комиссии платформы
        </h1>
        <p className="text-muted-foreground mt-2">
          Доли с оплаченного договора. Оплату не меняем — только правила
          начисления.
        </p>
      </div>

      <div className="rounded-2xl border border-border p-6 space-y-4">
        {(
          [
            ["platformFeePercent", "Доля платформы, %"],
            ["referralLevel1Percent", "Реферал L1, %"],
            ["referralLevel2Percent", "Реферал L2, %"],
            ["maxReferralDepth", "Глубина (0–2)"],
            ["minContractAmount", "Мин. сумма договора, копейки"],
          ] as const
        ).map(([key, label]) => (
          <div key={key} className="space-y-2">
            <Label>{label}</Label>
            <Input
              type="number"
              value={form[key]}
              onChange={(e) =>
                setForm({ ...form, [key]: Number(e.target.value) })
              }
              className="h-11 rounded-xl"
            />
          </div>
        ))}

        <Button className="rounded-full" onClick={save} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Сохранение...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Сохранить
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
