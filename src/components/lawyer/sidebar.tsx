"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Wallet,
  Link2,
  Settings,
  Briefcase,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

const navigation = [
  { title: "Обзор", href: "/lawyer", icon: LayoutDashboard },
  { title: "Рефералы", href: "/lawyer/referrals", icon: Users },
  { title: "Начисления", href: "/lawyer/earnings", icon: Wallet },
  { title: "Договоры", href: "/lawyer/contracts", icon: Briefcase },
  { title: "Профиль", href: "/lawyer/profile", icon: Settings },
];

export function LawyerSidebar() {
  const pathname = usePathname();
  const { profile } = useAuth();

  const initials =
    profile?.name
      ?.split(" ")
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "ЮР";

  return (
    <aside className="fixed left-0 top-14 z-30 hidden h-[calc(100vh-3.5rem)] w-64 border-r border-border bg-background lg:block">
      <div className="flex h-full flex-col">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-foreground text-background flex items-center justify-center text-sm font-medium">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {profile?.name || "Юрист"}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                Кабинет юриста
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== "/lawyer" && pathname.startsWith(item.href));
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
                  {isActive && <ChevronRight className="h-4 w-4" />}
                </Link>
              );
            })}
          </div>

          <div className="mt-8 pt-4 border-t border-border px-3">
            <div className="flex items-start gap-2 text-xs text-muted-foreground">
              <Link2 className="h-3.5 w-3.5 mt-0.5 shrink-0" />
              <p>
                Делитесь реферальной ссылкой: приглашённые клиенты и юристы
                закрепляются за вами.
              </p>
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
}
