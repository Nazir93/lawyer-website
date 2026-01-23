"use client";

import { motion } from "framer-motion";
import {
  CreditCard,
  Download,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  Receipt,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// Временные данные
const invoices = [
  {
    id: "INV-001",
    description: "Консультация по семейному праву",
    amount: 5000,
    date: "20 января 2024",
    dueDate: "25 января 2024",
    status: "pending",
  },
  {
    id: "INV-002",
    description: "Подготовка искового заявления",
    amount: 15000,
    date: "15 декабря 2023",
    dueDate: "20 декабря 2023",
    status: "paid",
  },
  {
    id: "INV-003",
    description: "Представительство в суде (первая инстанция)",
    amount: 30000,
    date: "1 декабря 2023",
    dueDate: "10 декабря 2023",
    status: "paid",
  },
];

const statusConfig = {
  pending: {
    label: "К оплате",
    color: "bg-yellow-500",
    textColor: "text-yellow-600 dark:text-yellow-400",
    bgColor: "bg-yellow-50 dark:bg-yellow-950",
    icon: Clock,
  },
  paid: {
    label: "Оплачено",
    color: "bg-green-500",
    textColor: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-50 dark:bg-green-950",
    icon: CheckCircle2,
  },
  overdue: {
    label: "Просрочено",
    color: "bg-red-500",
    textColor: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-50 dark:bg-red-950",
    icon: AlertCircle,
  },
};

export default function BillingPage() {
  const totalPending = invoices
    .filter((i) => i.status === "pending")
    .reduce((acc, i) => acc + i.amount, 0);
  const totalPaid = invoices
    .filter((i) => i.status === "paid")
    .reduce((acc, i) => acc + i.amount, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "RUB",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-light tracking-tight">Оплата</h1>
        <p className="text-muted-foreground mt-1">
          Управление счетами и платежами
        </p>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">К оплате</p>
                <p className="text-3xl font-light tracking-tight mt-1">
                  {formatCurrency(totalPending)}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Оплачено всего</p>
                <p className="text-3xl font-light tracking-tight mt-1">
                  {formatCurrency(totalPaid)}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Всего счетов</p>
                <p className="text-3xl font-light tracking-tight mt-1">
                  {invoices.length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                <Receipt className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Invoices */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-medium">Счета</h2>
          </div>

          {invoices.map((invoice, index) => {
            const status = statusConfig[invoice.status as keyof typeof statusConfig];
            const StatusIcon = status.icon;
            return (
              <motion.div
                key={invoice.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:border-foreground/20 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-xl ${status.bgColor} flex items-center justify-center shrink-0`}
                      >
                        <StatusIcon className={`h-6 w-6 ${status.textColor}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium">{invoice.description}</p>
                          <Badge variant="outline" className="text-xs">
                            {invoice.id}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                          <span>Выставлен: {invoice.date}</span>
                          <span>•</span>
                          <span>Оплатить до: {invoice.dueDate}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-xl font-medium">
                            {formatCurrency(invoice.amount)}
                          </p>
                          <Badge
                            variant="secondary"
                            className={`${status.textColor} gap-1`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${status.color}`} />
                            {status.label}
                          </Badge>
                        </div>
                        {invoice.status === "pending" ? (
                          <Button className="rounded-full">Оплатить</Button>
                        ) : (
                          <Button variant="outline" size="icon" className="rounded-full">
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Payment Methods */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Способы оплаты</CardTitle>
              <CardDescription>Сохранённые карты</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-xl border border-border">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-blue-400 rounded flex items-center justify-center text-white text-xs font-bold">
                    VISA
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">•••• 4242</p>
                    <p className="text-sm text-muted-foreground">12/25</p>
                  </div>
                  <Badge variant="secondary">Основная</Badge>
                </div>
              </div>

              <Button variant="outline" className="w-full rounded-full">
                <CreditCard className="mr-2 h-4 w-4" />
                Добавить карту
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Быстрая оплата</CardTitle>
              <CardDescription>Оплата по реквизитам</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-xl bg-secondary/50">
                <p className="text-sm font-medium mb-2">Реквизиты для оплаты:</p>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>Получатель: ИП Иванов И.И.</p>
                  <p>ИНН: 123456789012</p>
                  <p>Р/с: 40802810000000000000</p>
                  <p>Банк: ПАО Сбербанк</p>
                  <p>БИК: 044525225</p>
                </div>
              </div>

              <Button variant="outline" className="w-full rounded-full gap-2">
                Скачать реквизиты
                <Download className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-foreground to-foreground/80 text-background">
            <CardContent className="p-6">
              <p className="text-sm opacity-80 mb-2">Есть вопросы?</p>
              <p className="font-medium mb-4">
                Свяжитесь с нами для уточнения деталей оплаты
              </p>
              <Button
                variant="secondary"
                className="rounded-full gap-2 text-foreground"
              >
                Написать
                <ArrowUpRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

