"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Plus,
  Search,
  MoreVertical,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  GripVertical,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import type { Service } from "@prisma/client";

const groupLabels: Record<string, string> = {
  individual: "Физическим лицам",
  business: "Юридическим лицам",
  special: "Спецпредложения",
};

export default function AdminServicesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  const { data: services, isLoading, update, remove } = useApi<Service>({
    url: "/api/services",
  });

  const filteredServices = services.filter((service) =>
    service.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggleActive = async (service: Service) => {
    await update(service.id, { isActive: !service.isActive });
  };

  const handleDelete = async () => {
    if (deleteId) {
      await remove(deleteId);
      setDeleteId(null);
    }
  };

  if (isLoading && services.length === 0) {
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
          <h1 className="text-3xl font-bold text-foreground">Услуги</h1>
          <p className="text-muted-foreground">
            Управление услугами на сайте
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/services/new">
            <Plus className="mr-2 h-4 w-4" />
            Добавить услугу
          </Link>
        </Button>
      </div>

      {/* Search & Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск услуг..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Badge variant="secondary" className="px-3 py-1.5">
                Всего: {services.length}
              </Badge>
              <Badge variant="outline" className="px-3 py-1.5">
                Активных: {services.filter((s) => s.isActive).length}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {services.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">Услуг пока нет</p>
              <Button asChild>
                <Link href="/admin/services/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Добавить первую услугу
                </Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10"></TableHead>
                  <TableHead>Название</TableHead>
                  <TableHead>Группа</TableHead>
                  <TableHead>Цена</TableHead>
                  <TableHead className="text-center">Статус</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredServices.map((service, index) => (
                  <motion.tr
                    key={service.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="group"
                  >
                    <TableCell>
                      <GripVertical className="h-4 w-4 text-muted-foreground/50 cursor-grab" />
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">
                          {service.title}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          /services/{service.slug}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {groupLabels[service.serviceGroup] || service.serviceGroup}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {service.priceText || (service.priceFrom ? `от ${service.priceFrom.toLocaleString()} ₽` : "—")}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Switch
                          checked={service.isActive}
                          onCheckedChange={() => handleToggleActive(service)}
                        />
                        {service.isActive ? (
                          <Eye className="h-4 w-4 text-green-600" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/services/${service.id}`}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Редактировать
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link
                              href={`/services/${service.slug}`}
                              target="_blank"
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              Просмотр
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => setDeleteId(service.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Удалить
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить услугу?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие нельзя отменить. Услуга будет удалена навсегда.
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
