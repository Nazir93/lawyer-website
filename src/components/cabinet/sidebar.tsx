"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderOpen,
  FileText,
  Calendar,
  MessageSquare,
  CreditCard,
  Settings,
  HelpCircle,
  Phone,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  {
    title: "Главное",
    items: [
      { title: "Обзор", href: "/cabinet", icon: LayoutDashboard },
      { title: "Мои дела", href: "/cabinet/cases", icon: FolderOpen, badge: "3" },
      { title: "Документы", href: "/cabinet/documents", icon: FileText },
    ],
  },
  {
    title: "Активность",
    items: [
      { title: "Календарь", href: "/cabinet/calendar", icon: Calendar },
      { title: "Сообщения", href: "/cabinet/messages", icon: MessageSquare, badge: "2" },
      { title: "Платежи", href: "/cabinet/payments", icon: CreditCard },
    ],
  },
  {
    title: "Прочее",
    items: [
      { title: "Настройки", href: "/cabinet/settings", icon: Settings },
      { title: "Помощь", href: "/cabinet/help", icon: HelpCircle },
    ],
  },
];

export function CabinetSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-14 bottom-0 w-64 border-r border-border bg-background hidden lg:block overflow-y-auto">
      <div className="p-4 space-y-6">
        {navigation.map((section) => (
          <div key={section.title}>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 px-3">
              {section.title}
            </h3>
            <nav className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-foreground text-background"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                    )}
                  >
                    <span className="flex items-center gap-3">
                      <Icon className="h-4 w-4" />
                      {item.title}
                    </span>
                    {item.badge && (
                      <span
                        className={cn(
                          "px-1.5 py-0.5 rounded text-xs",
                          isActive
                            ? "bg-background/20 text-background"
                            : "bg-foreground/10 text-foreground"
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}

        {/* Contact Card */}
        <div className="p-4 rounded-xl bg-secondary/50 border border-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-foreground/10 flex items-center justify-center">
              <Phone className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-medium">Нужна помощь?</p>
              <p className="text-xs text-muted-foreground">Свяжитесь с нами</p>
            </div>
          </div>
          <a
            href="tel:+79001234567"
            className="block w-full text-center py-2 rounded-lg bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors"
          >
            +7 (900) 123-45-67
          </a>
        </div>
      </div>
    </aside>
  );
}

