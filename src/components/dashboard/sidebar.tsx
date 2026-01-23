"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  Calendar,
  CreditCard,
  Settings,
  Bell,
  HelpCircle,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const navigation = [
  {
    title: "Обзор",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Мои дела",
    href: "/dashboard/cases",
    icon: FileText,
    badge: "2",
  },
  {
    title: "Сообщения",
    href: "/dashboard/messages",
    icon: MessageSquare,
    badge: "3",
  },
  {
    title: "Записи",
    href: "/dashboard/appointments",
    icon: Calendar,
  },
  {
    title: "Документы",
    href: "/dashboard/documents",
    icon: FileText,
  },
  {
    title: "Оплата",
    href: "/dashboard/billing",
    icon: CreditCard,
  },
];

const secondaryNavigation = [
  {
    title: "Уведомления",
    href: "/dashboard/notifications",
    icon: Bell,
  },
  {
    title: "Настройки",
    href: "/dashboard/settings",
    icon: Settings,
  },
  {
    title: "Помощь",
    href: "/dashboard/help",
    icon: HelpCircle,
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-14 z-30 hidden h-[calc(100vh-3.5rem)] w-64 border-r border-border bg-background lg:block">
      <div className="flex h-full flex-col">
        {/* User Info */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-foreground text-background flex items-center justify-center text-sm font-medium">
              ИП
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">Иван Петров</p>
              <p className="text-xs text-muted-foreground truncate">
                ivan@example.com
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                    isActive
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="flex-1">{item.title}</span>
                  {item.badge && (
                    <Badge
                      variant="secondary"
                      className="h-5 px-1.5 text-xs bg-foreground text-background"
                    >
                      {item.badge}
                    </Badge>
                  )}
                  {isActive && <ChevronRight className="h-4 w-4" />}
                </Link>
              );
            })}
          </div>

          <div className="mt-8 pt-4 border-t border-border">
            <p className="text-xs uppercase tracking-widest text-muted-foreground px-3 mb-3">
              Настройки
            </p>
            <div className="space-y-1">
              {secondaryNavigation.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                      isActive
                        ? "bg-secondary text-foreground"
                        : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border">
          <div className="p-4 rounded-lg bg-secondary/50">
            <p className="text-sm font-medium mb-1">Нужна помощь?</p>
            <p className="text-xs text-muted-foreground mb-3">
              Свяжитесь с вашим юристом
            </p>
            <Link
              href="/dashboard/messages"
              className="inline-flex items-center text-xs font-medium hover:underline"
            >
              Написать сообщение
              <ChevronRight className="h-3 w-3 ml-1" />
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
}

