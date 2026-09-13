"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

type Profile = {
  displayName: string;
  bio: string | null;
  specialization: string | null;
  city: string | null;
  phone: string | null;
  barNumber: string | null;
  status: string;
  slug: string;
};

export default function LawyerProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    displayName: "",
    bio: "",
    specialization: "",
    city: "",
    phone: "",
    barNumber: "",
    status: "",
    slug: "",
  });

  useEffect(() => {
    fetch("/api/lawyer/profile")
      .then((r) => r.json())
      .then((json) => {
        const p = json.profile as Profile | null;
        if (p) {
          setForm({
            displayName: p.displayName || "",
            bio: p.bio || "",
            specialization: p.specialization || "",
            city: p.city || "",
            phone: p.phone || "",
            barNumber: p.barNumber || "",
            status: p.status || "",
            slug: p.slug || "",
          });
        }
      })
      .catch(() => toast.error("Не удалось загрузить профиль"))
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/lawyer/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Ошибка сохранения");
        return;
      }
      toast.success("Профиль сохранён");
    } catch {
      toast.error("Ошибка соединения");
    } finally {
      setSaving(false);
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
    <div className="space-y-8 max-w-xl">
      <div>
        <h1 className="text-3xl font-light tracking-tight">Профиль</h1>
        <p className="text-muted-foreground mt-2">
          Статус: {form.status || "—"} · slug: {form.slug || "—"}
        </p>
      </div>

      <div className="space-y-4 rounded-2xl border border-border p-6">
        {(
          [
            ["displayName", "Отображаемое имя"],
            ["specialization", "Специализация"],
            ["city", "Город"],
            ["phone", "Телефон"],
            ["barNumber", "Удостоверение / реестр"],
          ] as const
        ).map(([key, label]) => (
          <div key={key} className="space-y-2">
            <Label className="text-sm text-muted-foreground">{label}</Label>
            <Input
              value={form[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              className="h-11 rounded-xl"
            />
          </div>
        ))}

        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">О себе</Label>
          <textarea
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            className="w-full min-h-28 rounded-xl border border-input bg-background px-3 py-2 text-sm"
          />
        </div>

        <Button onClick={save} disabled={saving} className="rounded-full">
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Сохранение...
            </>
          ) : (
            "Сохранить"
          )}
        </Button>
      </div>
    </div>
  );
}
