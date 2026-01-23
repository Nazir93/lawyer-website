"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Briefcase,
  MessageSquare,
  Users,
  Settings,
  FolderTree,
  Newspaper,
  LogOut,
  Scale,
  ChevronRight,
  Database,
  Image as ImageIcon,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/theme-toggle";

const navigation = [
  {
    title: "Главное",
    items: [
      {
        title: "Дашборд",
        href: "/admin",
        icon: LayoutDashboard,
      },
      {
        title: "Заявки",
        href: "/admin/leads",
        icon: MessageSquare,
        badge: "5",
      },
      {
        title: "Сообщения",
        href: "/admin/messages",
        icon: MessageSquare,
      },
      {
        title: "Календарь",
        href: "/admin/calendar",
        icon: Calendar,
      },
      {
        title: "Пользователи",
        href: "/admin/users",
        icon: Users,
      },
    ],
  },
  {
    title: "Контент",
    items: [
      {
        title: "Hero (Главный экран)",
        href: "/admin/hero",
        icon: ImageIcon,
      },
      {
        title: "Разделы",
        href: "/admin/sections",
        icon: FolderTree,
      },
      {
        title: "Услуги",
        href: "/admin/services",
        icon: FileText,
      },
      {
        title: "Кейсы",
        href: "/admin/cases",
        icon: Briefcase,
      },
      {
        title: "Новости",
        href: "/admin/news",
        icon: Newspaper,
      },
      {
        title: "Отзывы",
        href: "/admin/reviews",
        icon: Users,
      },
    ],
  },
  {
    title: "Настройки",
    items: [
      {
        title: "Настройка Supabase",
        href: "/admin/setup",
        icon: Database,
      },
      {
        title: "Настройки сайта",
        href: "/admin/settings",
        icon: Settings,
      },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-card">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-border px-6">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Scale className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-semibold text-foreground">Админ панель</h1>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-6">
            {navigation.map((section) => (
              <div key={section.title}>
                <h2 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {section.title}
                </h2>
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        <span className="flex-1">{item.title}</span>
                        {item.badge && (
                          <span
                            className={cn(
                              "rounded-full px-2 py-0.5 text-xs",
                              isActive
                                ? "bg-primary-foreground/20 text-primary-foreground"
                                : "bg-primary/10 text-primary"
                            )}
                          >
                            {item.badge}
                          </span>
                        )}
                        {!item.badge && isActive && (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </nav>

        {/* Footer */}
        <div className="border-t border-border p-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-muted-foreground">Тема</span>
            <ThemeToggle />
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:text-foreground"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Выйти
          </Button>
        </div>
      </div>
    </aside>
  );
}

