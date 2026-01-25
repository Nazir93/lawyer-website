"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Calendar,
  FileText,
  MessageSquare,
  Briefcase,
  Scale,
  Gavel,
  Download,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatDateShort, formatDateTime } from "@/lib/utils/date";

interface CaseDetail {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  content: string | null;
  category: string | null;
  status: string;
  status_label: string;
  progress: number;
  next_action: string | null;
  next_action_date: string | null;
  start_date: string;
  result: string | null;
  duration: string | null;
  updated_at: string;
  documents: Array<{
    id: string;
    title: string | null;
    filename: string;
    file_url: string;
    category: string;
    created_at: string;
  }>;
  messages: Array<{
    id: string;
    text: string;
    sender_id: string;
    is_me: boolean;
    created_at: string;
  }>;
  appointments: Array<{
    id: string;
    title: string;
    date: string;
    status: string;
    type: string;
  }>;
}

const statusConfig: Record<string, { color: string; textColor: string; bgColor: string; icon: React.ElementType }> = {
  consultation: {
    color: "bg-purple-500",
    textColor: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-50 dark:bg-purple-950",
    icon: Briefcase,
  },
  in_progress: {
    color: "bg-blue-500",
    textColor: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-950",
    icon: Loader2,
  },
  pending: {
    color: "bg-yellow-500",
    textColor: "text-yellow-600 dark:text-yellow-400",
    bgColor: "bg-yellow-50 dark:bg-yellow-950",
    icon: Clock,
  },
  court: {
    color: "bg-orange-500",
    textColor: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-50 dark:bg-orange-950",
    icon: Gavel,
  },
  appeal: {
    color: "bg-indigo-500",
    textColor: "text-indigo-600 dark:text-indigo-400",
    bgColor: "bg-indigo-50 dark:bg-indigo-950",
    icon: Scale,
  },
  completed: {
    color: "bg-green-500",
    textColor: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-50 dark:bg-green-950",
    icon: CheckCircle2,
  },
  cancelled: {
    color: "bg-red-500",
    textColor: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-50 dark:bg-red-950",
    icon: AlertCircle,
  },
};

export default function CaseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [caseData, setCaseData] = useState<CaseDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) {
      loadCase(params.id as string);
    }
  }, [params.id]);

  const loadCase = async (id: string) => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/dashboard/cases/${id}`);
      const data = await res.json();
      
      if (res.ok) {
        setCaseData(data.data);
      } else {
        setError(data.error || "Дело не найдено");
      }
    } catch (err) {
      setError("Ошибка загрузки дела");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !caseData) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
        <p className="text-muted-foreground mb-4">{error || "Дело не найдено"}</p>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Назад
        </Button>
      </div>
    );
  }

  const status = statusConfig[caseData.status] || statusConfig.in_progress;
  const StatusIcon = status.icon;

  return (
    <div className="space-y-8">
      {/* Back Button */}
      <Button variant="ghost" className="gap-2" onClick={() => router.back()}>
        <ArrowLeft className="h-4 w-4" />
        Назад к делам
      </Button>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-start gap-6"
      >
        <div className="flex-1">
          <div className="flex items-start gap-4 mb-4">
            <div className={`w-12 h-12 rounded-full ${status.bgColor} flex items-center justify-center shrink-0`}>
              <StatusIcon className={`h-6 w-6 ${status.textColor}`} />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-light tracking-tight mb-2">
                {caseData.title}
              </h1>
              <div className="flex flex-wrap items-center gap-2">
                {caseData.category && (
                  <Badge variant="secondary">{caseData.category}</Badge>
                )}
                <Badge variant="outline" className={`${status.textColor} border-current`}>
                  {caseData.status_label}
                </Badge>
              </div>
            </div>
          </div>

          {caseData.description && (
            <p className="text-muted-foreground">{caseData.description}</p>
          )}
        </div>

        {/* Progress Card */}
        {caseData.status !== "completed" && caseData.status !== "cancelled" && (
          <Card className="lg:w-80">
            <CardContent className="p-6">
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Прогресс</span>
                  <span className="text-lg font-medium">{caseData.progress}%</span>
                </div>
                <div className="h-3 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-foreground rounded-full transition-all"
                    style={{ width: `${caseData.progress}%` }}
                  />
                </div>
              </div>

              {caseData.next_action && (
                <div className="pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground mb-1">Следующее действие</p>
                  <p className="font-medium">{caseData.next_action}</p>
                  {caseData.next_action_date && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {formatDateShort(caseData.next_action_date)}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {caseData.status === "completed" && caseData.result && (
          <Card className="lg:w-80 border-green-200 dark:border-green-800">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-2">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-medium">Дело завершено</span>
              </div>
              <p className="text-sm">{caseData.result}</p>
              {caseData.duration && (
                <p className="text-sm text-muted-foreground mt-2">
                  Длительность: {caseData.duration}
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </motion.div>

      {/* Info Cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Дата начала</p>
              <p className="font-medium">{formatDateShort(caseData.start_date)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Последнее обновление</p>
              <p className="font-medium">{formatDateShort(caseData.updated_at)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <MessageSquare className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Сообщений</p>
              <p className="font-medium">{caseData.messages.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Content */}
      {caseData.content && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Описание дела</CardTitle>
            </CardHeader>
            <CardContent>
              <div 
                className="prose dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: caseData.content }}
              />
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Documents */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Документы</CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/documents">
                Все документы
                <ExternalLink className="ml-2 h-3 w-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {caseData.documents.length > 0 ? (
              <div className="space-y-2">
                {caseData.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-sm">{doc.title || doc.filename}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDateShort(doc.created_at)}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" asChild>
                      <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                        <Download className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                Нет документов по этому делу
              </p>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Messages */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Последние сообщения</CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/messages">
                Все сообщения
                <ExternalLink className="ml-2 h-3 w-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {caseData.messages.length > 0 ? (
              <div className="space-y-3">
                {caseData.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-3 rounded-lg ${
                      msg.is_me ? "bg-foreground text-background ml-8" : "bg-secondary mr-8"
                    }`}
                  >
                    <p className="text-sm">{msg.text}</p>
                    <p className={`text-xs mt-1 ${msg.is_me ? "text-background/60" : "text-muted-foreground"}`}>
                      {formatDateTime(msg.created_at)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                Нет сообщений по этому делу
              </p>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Appointments */}
      {caseData.appointments.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Записи</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {caseData.appointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border"
                  >
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-sm">{apt.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDateTime(apt.date)}
                        </p>
                      </div>
                    </div>
                    <Badge variant={apt.status === "COMPLETED" ? "default" : "secondary"}>
                      {apt.status === "COMPLETED" ? "Завершено" : "Запланировано"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}

