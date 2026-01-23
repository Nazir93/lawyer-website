"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, XCircle, Loader2, ExternalLink, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

interface ConnectionStatus {
  success: boolean;
  message?: string;
  database?: string;
  storage?: string;
  error?: string;
  hint?: string;
}

export default function SetupPage() {
  const [status, setStatus] = useState<ConnectionStatus | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const checkConnection = async () => {
    setIsChecking(true);
    try {
      const response = await fetch("/api/test-connection");
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      setStatus({
        success: false,
        error: "Не удалось подключиться к API",
      });
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    toast.success(`Скопировано: ${label}`);
    setTimeout(() => setCopied(null), 2000);
  };

  const steps = [
    {
      number: 1,
      title: "Создайте проект в Supabase",
      description: "Перейдите на supabase.com и создайте новый проект",
      link: "https://supabase.com",
      linkText: "Открыть Supabase",
    },
    {
      number: 2,
      title: "Скопируйте ключи API",
      description: "Settings → API → скопируйте Project URL и ключи",
      code: `NEXT_PUBLIC_SUPABASE_URL=ваш-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=ваш-anon-ключ
SUPABASE_SERVICE_ROLE_KEY=ваш-service-ключ`,
    },
    {
      number: 3,
      title: "Создайте .env.local",
      description: "В корне проекта создайте файл .env.local с ключами",
    },
    {
      number: 4,
      title: "Запустите SQL схему",
      description: "SQL Editor → скопируйте содержимое supabase/schema.sql → Run",
    },
    {
      number: 5,
      title: "Создайте Storage bucket",
      description: "Storage → Create bucket → имя: 'media' → Public: включено",
    },
    {
      number: 6,
      title: "Проверьте подключение",
      description: "Нажмите кнопку ниже для проверки",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Настройка Supabase</h1>
        <p className="text-muted-foreground">
          Пошаговая инструкция по подключению базы данных
        </p>
      </div>

      {/* Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Статус подключения
            {isChecking && <Loader2 className="h-4 w-4 animate-spin" />}
          </CardTitle>
          <CardDescription>
            Проверка подключения к Supabase
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {status && (
            <>
              <div className="flex items-center gap-2">
                {status.success ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-600">
                      {status.message || "Подключение работает!"}
                    </span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-red-600" />
                    <span className="font-medium text-red-600">
                      Ошибка подключения
                    </span>
                  </>
                )}
              </div>

              {status.database && (
                <div className="flex items-center gap-2 text-sm">
                  <span>База данных:</span>
                  <Badge variant={status.database.includes("✅") ? "default" : "destructive"}>
                    {status.database}
                  </Badge>
                </div>
              )}

              {status.storage && (
                <div className="flex items-center gap-2 text-sm">
                  <span>Storage:</span>
                  <Badge variant={status.storage.includes("✅") ? "default" : "destructive"}>
                    {status.storage}
                  </Badge>
                </div>
              )}

              {status.error && (
                <div className="p-3 bg-destructive/10 rounded-lg text-sm text-destructive">
                  <strong>Ошибка:</strong> {status.error}
                </div>
              )}

              {status.hint && (
                <div className="p-3 bg-muted rounded-lg text-sm">
                  💡 <strong>Подсказка:</strong> {status.hint}
                </div>
              )}

              <Button onClick={checkConnection} variant="outline" className="w-full">
                Проверить снова
              </Button>
            </>
          )}

          {!status && !isChecking && (
            <div className="text-center py-4 text-muted-foreground">
              Нажмите "Проверить подключение" для проверки
            </div>
          )}
        </CardContent>
      </Card>

      {/* Steps */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Пошаговая инструкция</h2>
        {steps.map((step, index) => (
          <Card key={step.number}>
            <CardContent className="p-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    {step.number}
                  </div>
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-foreground">{step.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {step.description}
                      </p>
                    </div>
                    {step.link && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={step.link} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="mr-2 h-4 w-4" />
                          {step.linkText}
                        </a>
                      </Button>
                    )}
                  </div>

                  {step.code && (
                    <div className="mt-4">
                      <div className="relative">
                        <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                          <code>{step.code}</code>
                        </pre>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2"
                          onClick={() => copyToClipboard(step.code, "Код")}
                        >
                          {copied === `code-${step.number}` ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle>Полезные ссылки</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-4">
            <Button variant="outline" asChild>
              <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                Supabase Dashboard
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a
                href="https://supabase.com/docs/guides/storage"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Документация Storage
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Files Info */}
      <Card>
        <CardHeader>
          <CardTitle>Файлы проекта</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div>
            <strong>SQL схема:</strong> <code className="bg-muted px-2 py-1 rounded">supabase/schema.sql</code>
          </div>
          <div>
            <strong>Переменные окружения:</strong> <code className="bg-muted px-2 py-1 rounded">.env.local</code>
          </div>
          <div>
            <strong>Подробная инструкция:</strong> <code className="bg-muted px-2 py-1 rounded">SUPABASE_SETUP.md</code>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

