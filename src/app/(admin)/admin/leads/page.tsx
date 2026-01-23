"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  MoreVertical,
  Phone,
  Mail,
  MessageSquare,
  CheckCircle,
  Clock,
  XCircle,
  Trash2,
  Download,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useApi } from "@/hooks/use-api";
import type { Lead } from "@prisma/client";

const statusConfig = {
  NEW: {
    label: "Новая",
    color: "bg-blue-500",
    icon: Clock,
    badgeVariant: "default" as const,
  },
  CONTACTED: {
    label: "Связались",
    color: "bg-yellow-500",
    icon: Phone,
    badgeVariant: "secondary" as const,
  },
  CONSULTATION: {
    label: "Консультация",
    color: "bg-purple-500",
    icon: MessageSquare,
    badgeVariant: "outline" as const,
  },
  DONE: {
    label: "Завершена",
    color: "bg-green-500",
    icon: CheckCircle,
    badgeVariant: "secondary" as const,
  },
  REJECTED: {
    label: "Отклонена",
    color: "bg-red-500",
    icon: XCircle,
    badgeVariant: "destructive" as const,
  },
};

export default function AdminLeadsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: leads, isLoading, update, remove, fetchData } = useApi<Lead>({
    url: "/api/leads",
  });

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.phone.includes(searchQuery);
    const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    await update(id, { status: newStatus.toUpperCase() as Lead["status"] });
  };

  const handleDelete = async () => {
    if (deleteId) {
      await remove(deleteId);
      setDeleteId(null);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const stats = {
    total: leads.length,
    new: leads.filter((l) => l.status === "NEW").length,
    inProgress: leads.filter((l) =>
      ["CONTACTED", "CONSULTATION"].includes(l.status)
    ).length,
    done: leads.filter((l) => l.status === "DONE").length,
  };

  if (isLoading && leads.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Заявки</h1>
          <p className="text-muted-foreground">Управление входящими заявками</p>
        </div>
        <Button variant="outline" onClick={() => fetchData()}>
          <Download className="mr-2 h-4 w-4" />
          Обновить
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Всего</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Новые</p>
            <p className="text-2xl font-bold text-blue-600">{stats.new}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">В работе</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.inProgress}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Завершено</p>
            <p className="text-2xl font-bold text-green-600">{stats.done}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск по имени или телефону..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Статус" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все статусы</SelectItem>
                <SelectItem value="new">Новые</SelectItem>
                <SelectItem value="contacted">Связались</SelectItem>
                <SelectItem value="consultation">Консультация</SelectItem>
                <SelectItem value="done">Завершено</SelectItem>
                <SelectItem value="rejected">Отклонено</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Leads List */}
      {leads.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">Заявок пока нет</p>
          <p className="text-sm text-muted-foreground mt-1">
            Они появятся здесь, когда клиенты отправят форму на сайте
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredLeads.map((lead, index) => {
            const status = statusConfig[lead.status as keyof typeof statusConfig];
            return (
              <motion.div
                key={lead.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
              >
                <Card
                  className={`cursor-pointer hover:border-foreground/20 transition-colors ${
                    lead.status === "NEW" ? "border-blue-500/50" : ""
                  }`}
                  onClick={() => setSelectedLead(lead)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-medium text-foreground truncate">
                            {lead.name}
                          </h3>
                          <Badge variant={status.badgeVariant} className="gap-1">
                            <span className={`w-1.5 h-1.5 rounded-full ${status.color}`} />
                            {status.label}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Phone className="h-3.5 w-3.5" />
                            {lead.phone}
                          </span>
                          {lead.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="h-3.5 w-3.5" />
                              {lead.email}
                            </span>
                          )}
                          {lead.service && (
                            <>
                              <span>•</span>
                              <span>{lead.service}</span>
                            </>
                          )}
                        </div>
                        {lead.message && (
                          <p className="mt-2 text-sm text-muted-foreground line-clamp-1">
                            {lead.message}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatDate(lead.createdAt.toISOString())}
                        </span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUpdateStatus(lead.id, "CONTACTED");
                              }}
                            >
                              <Phone className="mr-2 h-4 w-4" />
                              Связались
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUpdateStatus(lead.id, "CONSULTATION");
                              }}
                            >
                              <MessageSquare className="mr-2 h-4 w-4" />
                              Консультация
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUpdateStatus(lead.id, "DONE");
                              }}
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Завершить
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteId(lead.id);
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Удалить
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {filteredLeads.length === 0 && leads.length > 0 && (
        <div className="text-center py-12">
          <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">Заявки не найдены</p>
        </div>
      )}

      {/* Lead Detail Dialog */}
      <Dialog open={!!selectedLead} onOpenChange={() => setSelectedLead(null)}>
        <DialogContent className="max-w-lg">
          {selectedLead && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  {selectedLead.name}
                  <Badge
                    variant={
                      statusConfig[selectedLead.status as keyof typeof statusConfig]
                        .badgeVariant
                    }
                  >
                    {statusConfig[selectedLead.status as keyof typeof statusConfig].label}
                  </Badge>
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Телефон</p>
                    <a
                      href={`tel:${selectedLead.phone}`}
                      className="text-foreground hover:underline"
                    >
                      {selectedLead.phone}
                    </a>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <a
                      href={`mailto:${selectedLead.email}`}
                      className="text-foreground hover:underline"
                    >
                      {selectedLead.email || "—"}
                    </a>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Услуга</p>
                    <p className="text-foreground">{selectedLead.service || "—"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Источник</p>
                    <p className="text-foreground">{selectedLead.source}</p>
                  </div>
                </div>
                {selectedLead.message && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Сообщение</p>
                    <p className="text-foreground p-3 bg-muted rounded-lg">
                      {selectedLead.message}
                    </p>
                  </div>
                )}
                <div className="flex gap-2 pt-4">
                  <Button className="flex-1" asChild>
                    <a href={`tel:${selectedLead.phone}`}>
                      <Phone className="mr-2 h-4 w-4" />
                      Позвонить
                    </a>
                  </Button>
                  <Button variant="outline" className="flex-1" asChild>
                    <a
                      href={`https://wa.me/${selectedLead.phone.replace(/\D/g, "")}`}
                      target="_blank"
                    >
                      <MessageSquare className="mr-2 h-4 w-4" />
                      WhatsApp
                    </a>
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить заявку?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие нельзя отменить. Заявка будет удалена навсегда.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
