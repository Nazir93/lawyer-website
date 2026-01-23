"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  ChevronDown,
  Search,
  User,
  LogOut,
  Settings,
  FileText,
  Bell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { SearchDropdown } from "./search-dropdown";
import { useAuth } from "@/hooks/use-auth";

const exploreItems = [
  { title: "Юридическим лицам", href: "/services/business" },
  { title: "Физическим лицам", href: "/services/individual" },
  { title: "Спецпредложения", href: "/services/special" },
];

const navigation = [
  { title: "Кейсы", href: "/cases" },
  { title: "Новости", href: "/news", badge: "New" },
  { title: "Отзывы", href: "/reviews" },
  { title: "Цены", href: "/prices" },
  { title: "Контакты", href: "/contacts" },
];

export function Header() {
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const pathname = usePathname();
  const { isLoggedIn, user, profile, logout, isLoading: authLoading } = useAuth();

  React.useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        suppressHydrationWarning
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b",
          isScrolled
            ? "bg-background/95 backdrop-blur-md border-border"
            : "bg-background border-border"
        )}
      >
        <div className="container mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-between h-14">
            {/* Left: Logo + Nav */}
            <div className="flex items-center gap-8">
              {/* Logo */}
              <Link href="/" className="flex items-center">
                <span className="text-2xl font-bold tracking-tight">А.</span>
              </Link>

              {/* Desktop Navigation */}
              <nav className="hidden lg:flex items-center gap-1">
                {/* Explore Dropdown */}
                {mounted ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-sm font-normal gap-1"
                      >
                        Услуги
                        <ChevronDown className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-48">
                      {exploreItems.map((item) => (
                        <DropdownMenuItem key={item.href} asChild>
                          <Link href={item.href}>{item.title}</Link>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-sm font-normal gap-1"
                    asChild
                  >
                    <Link href="/services">Услуги</Link>
                  </Button>
                )}

                {/* Other Nav Items */}
                {navigation.map((item) => (
                  <Button
                    key={item.href}
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "text-sm font-normal gap-1.5",
                      pathname === item.href && "text-foreground"
                    )}
                    asChild
                  >
                    <Link href={item.href}>
                      {item.title}
                      {item.badge && (
                        <Badge
                          variant="secondary"
                          className="text-[10px] px-1.5 py-0 h-4 bg-foreground text-background"
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  </Button>
                ))}
              </nav>
            </div>

            {/* Center: Search */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                <Input
                  type="search"
                  placeholder="Поиск по сайту"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchOpen(true)}
                  onClick={() => setIsSearchOpen(true)}
                  className="w-full pl-9 h-9 bg-secondary/50 border-0 rounded-full text-sm cursor-pointer"
                />
              </div>
            </div>

            {/* Right: Auth + Actions */}
            <div className="flex items-center gap-2">
              <ThemeToggle />

              {authLoading ? (
                // Показываем кнопки входа/регистрации во время загрузки
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hidden sm:inline-flex text-sm font-normal"
                    asChild
                  >
                    <Link href="/login">Войти</Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hidden sm:inline-flex text-sm font-normal"
                    asChild
                  >
                    <Link href="/register">Регистрация</Link>
                  </Button>
                </>
              ) : isLoggedIn ? (
                <>
                  {/* Notifications */}
                  <Button variant="ghost" size="icon" className="hidden sm:flex">
                    <Bell className="h-4 w-4" />
                  </Button>

                  {/* User Menu */}
                  {mounted ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild suppressHydrationWarning>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-2 hidden sm:flex"
                        >
                          <div className="w-6 h-6 rounded-full bg-foreground text-background flex items-center justify-center text-xs font-medium">
                            {profile?.name?.charAt(0) || user?.email?.charAt(0) || "?"}
                          </div>
                          <span className="text-sm">
                            {profile?.name?.split(" ")[0] || user?.email?.split("@")[0] || "Пользователь"}
                          </span>
                          <ChevronDown className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <div className="px-2 py-1.5">
                          <p className="text-sm font-medium">
                            {profile?.name || user?.email || "Пользователь"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {user?.email || profile?.email || ""}
                          </p>
                        </div>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href="/dashboard">
                            <User className="mr-2 h-4 w-4" />
                            Личный кабинет
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/dashboard/cases">
                            <FileText className="mr-2 h-4 w-4" />
                            Мои дела
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/dashboard/settings">
                            <Settings className="mr-2 h-4 w-4" />
                            Настройки
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={logout} className="text-destructive">
                          <LogOut className="mr-2 h-4 w-4" />
                          Выйти
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-2 hidden sm:flex"
                      asChild
                    >
                      <Link href="/dashboard">
                        <User className="h-4 w-4" />
                        <span className="text-sm">Профиль</span>
                      </Link>
                    </Button>
                  )}
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hidden sm:inline-flex text-sm font-normal"
                    asChild
                  >
                    <Link href="/login">Войти</Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hidden sm:inline-flex text-sm font-normal"
                    asChild
                  >
                    <Link href="/register">Регистрация</Link>
                  </Button>
                </>
              )}

              <Button
                size="sm"
                className="hidden sm:inline-flex rounded-full px-4 h-8 text-sm"
                asChild
              >
                <Link href="/contacts">Консультация</Link>
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="hidden lg:inline-flex rounded-full px-4 h-8 text-sm border-foreground/20"
                asChild
              >
                <Link href="/services">Все услуги</Link>
              </Button>

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 lg:hidden"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            <motion.nav
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ delay: 0.1 }}
              className="relative pt-20 px-6 pb-8"
            >
              {/* Mobile Search */}
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                <Input
                  type="search"
                  placeholder="Поиск"
                  onFocus={() => {
                    setIsSearchOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  onClick={() => {
                    setIsSearchOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full pl-9 h-10 bg-secondary/50 border-0 rounded-full"
                />
              </div>

              <div className="space-y-1">
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3 px-3">
                  Услуги
                </p>
                {exploreItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block py-2 px-3 text-lg hover:bg-secondary rounded-lg transition-colors"
                  >
                    {item.title}
                  </Link>
                ))}
              </div>

              <div className="space-y-1 mt-6">
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3 px-3">
                  Меню
                </p>
                {navigation.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-2 py-2 px-3 text-lg hover:bg-secondary rounded-lg transition-colors"
                  >
                    {item.title}
                    {item.badge && (
                      <Badge variant="secondary" className="text-xs">
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                ))}
              </div>

              <div className="mt-8 space-y-3">
                {authLoading ? (
                  // Показываем кнопки входа/регистрации во время загрузки
                  <>
                    <Button
                      className="w-full rounded-full"
                      onClick={() => setIsMobileMenuOpen(false)}
                      asChild
                    >
                      <Link href="/login">Войти</Link>
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full rounded-full"
                      onClick={() => setIsMobileMenuOpen(false)}
                      asChild
                    >
                      <Link href="/register">Регистрация</Link>
                    </Button>
                  </>
                ) : isLoggedIn ? (
                  <>
                    <Button
                      className="w-full rounded-full"
                      onClick={() => setIsMobileMenuOpen(false)}
                      asChild
                    >
                      <Link href="/dashboard">Личный кабинет</Link>
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full rounded-full"
                      onClick={() => {
                        logout();
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      Выйти
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      className="w-full rounded-full"
                      onClick={() => setIsMobileMenuOpen(false)}
                      asChild
                    >
                      <Link href="/login">Войти</Link>
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full rounded-full"
                      onClick={() => setIsMobileMenuOpen(false)}
                      asChild
                    >
                      <Link href="/register">Регистрация</Link>
                    </Button>
                  </>
                )}
              </div>

              <div className="mt-8 pt-6 border-t border-border text-sm text-muted-foreground">
                <p>+7 (900) 123-45-67</p>
                <p>info@lawyer.ru</p>
              </div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Dropdown */}
      <SearchDropdown
        isOpen={isSearchOpen}
        onClose={() => {
          setIsSearchOpen(false);
          setSearchQuery("");
        }}
      />
    </>
  );
}
