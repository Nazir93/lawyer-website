"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CheckCircle2,
  Loader2,
  Plus,
  Send,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { CONTRACT_STATUS_LABEL } from "@/lib/platform/contract-labels";

type Contract = {
  id: string;
  title: string;
  status: keyof typeof CONTRACT_STATUS_LABEL;
  amountLabel: string;
  createdAt: string;
  client: { name: string | null; email: string | null };
  commissions: { type: string; amount: number; status: string }[];
};

type ClientOption = {
  id: string;
  name: string | null;
  email: string | null;
  isReferral: boolean;
};

export default function LawyerContractsPage() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Contract[]>([]);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [actingId, setActingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    amountRub: "",
    clientId: "",
    description: "",
  });

  const loadContracts = useCallback(async () => {
    const res = await fetch("/api/lawyer/contracts");
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Ошибка загрузки договоров");
    setItems(json.items || []);
  }, []);

  const loadClients = useCallback(async () => {
    const res = await fetch("/api/lawyer/clients");
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Ошибка загрузки клиентов");
    setClients(json.items || []);
  }, []);

  useEffect(() => {
    Promise.all([loadContracts(), loadClients()])
      .catch((e) => toast.error(e.message || "Ошибка загрузки"))
      .finally(() => setLoading(false));
  }, [loadContracts, loadClients]);

  const createContract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.amountRub || !form.clientId) {
      toast.error("Заполните название, сумму и клиента");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/lawyer/contracts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title.trim(),
          amountRub: Number(form.amountRub),
          clientId: form.clientId,
          description: form.description.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Не удалось создать");
      toast.success("Договор создан");
      setForm({ title: "", amountRub: "", clientId: "", description: "" });
      setShowForm(false);
      await loadContracts();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setSaving(false);
    }
  };

  const act = async (
    id: string,
    action: "send" | "mark_paid" | "cancel"
  ) => {
    setActingId(id);
    try {
      const res = await fetch("/api/lawyer/contracts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Не удалось выполнить");
      if (action === "mark_paid") {
        const created = data.commissions?.created;
        toast.success(
          typeof created === "number"
            ? `Оплачено. Начислено комиссий: ${created}`
            : "Договор отмечен как оплаченный"
        );
      } else if (action === "send") {
        toast.success("Договор отправлен клиенту");
      } else {
        toast.success("Договор отменён");
      }
      await loadContracts();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ошибка");
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
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-light tracking-tight">Договоры</h1>
          <p className="text-muted-foreground mt-2">
            Черновик → отправка клиенту → подпись/оплата. Комиссии начисляются
            после статуса PAID.
          </p>
        </div>
        <Button className="rounded-full" onClick={() => setShowForm((v) => !v)}>
          <Plus className="h-4 w-4 mr-2" />
          {showForm ? "Скрыть форму" : "Новый договор"}
        </Button>
      </div>

      {showForm && (
        <form
          onSubmit={createContract}
          className="rounded-2xl border border-border p-6 space-y-4 max-w-xl"
        >
          <div className="space-y-2">
            <Label>Название *</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Договор на консультацию"
              className="h-11 rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label>Сумма, ₽ *</Label>
            <Input
              type="number"
              min="1"
              step="1"
              value={form.amountRub}
              onChange={(e) => setForm({ ...form, amountRub: e.target.value })}
              placeholder="50000"
              className="h-11 rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label>Клиент *</Label>
            {clients.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Нет клиентов. Пусть зарегистрируются по вашей реферальной ссылке
                или как CLIENT.
              </p>
            ) : (
              <Select
                value={form.clientId}
                onValueChange={(v) => setForm({ ...form, clientId: v })}
              >
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue placeholder="Выберите клиента" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name || c.email || c.id}
                      {c.isReferral ? " · ваш реферал" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          <div className="space-y-2">
            <Label>Описание</Label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className="w-full min-h-24 rounded-xl border border-input bg-background px-3 py-2 text-sm"
              placeholder="Кратко о предмете договора"
            />
          </div>
          <Button
            type="submit"
            className="rounded-full"
            disabled={saving || clients.length === 0}
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Создание...
              </>
            ) : (
              "Создать договор"
            )}
          </Button>
        </form>
      )}

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Договоров пока нет. Создайте первый через форму выше.
        </p>
      ) : (
        <div className="rounded-2xl border border-border divide-y divide-border">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">{item.title}</p>
                  <Badge variant="secondary">
                    {CONTRACT_STATUS_LABEL[item.status] || item.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {item.client.name || item.client.email} ·{" "}
                  {new Date(item.createdAt).toLocaleDateString("ru-RU")}
                  {item.commissions.length > 0
                    ? ` · комиссий: ${item.commissions.length}`
                    : ""}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <p className="font-medium mr-1">{item.amountLabel}</p>
                {item.status === "DRAFT" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-full"
                    disabled={actingId === item.id}
                    onClick={() => act(item.id, "send")}
                  >
                    {actingId === item.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-1.5" />
                        Отправить
                      </>
                    )}
                  </Button>
                )}
                {item.status !== "PAID" &&
                  item.status !== "CANCELLED" &&
                  item.status !== "REFUNDED" && (
                    <Button
                      size="sm"
                      className="rounded-full"
                      disabled={actingId === item.id}
                      onClick={() => act(item.id, "mark_paid")}
                    >
                      {actingId === item.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4 mr-1.5" />
                          Оплачен
                        </>
                      )}
                    </Button>
                  )}
                {(item.status === "DRAFT" ||
                  item.status === "SENT" ||
                  item.status === "SIGNED") && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="rounded-full text-destructive"
                    disabled={actingId === item.id}
                    onClick={() => act(item.id, "cancel")}
                  >
                    <XCircle className="h-4 w-4 mr-1.5" />
                    Отмена
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
