"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  FileText,
  Briefcase,
  Newspaper,
  ArrowRight,
  Loader2,
  TrendingUp,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface SearchResult {
  id: string;
  title: string;
  description?: string;
  type: "service" | "case" | "news";
  href: string;
}

interface SearchDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export function SearchDropdown({ isOpen, onClose, className }: SearchDropdownProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [popularItems, setPopularItems] = useState<SearchResult[]>([]);
  const [showPopular, setShowPopular] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Загружаем популярные элементы при открытии
  useEffect(() => {
    if (isOpen && popularItems.length === 0) {
      loadPopularItems();
    }
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Поиск при изменении запроса
  useEffect(() => {
    if (query.trim().length > 0) {
      setShowPopular(false);
      const debounceTimer = setTimeout(() => {
        performSearch(query);
      }, 300);
      return () => clearTimeout(debounceTimer);
    } else {
      setShowPopular(true);
      setResults([]);
    }
  }, [query]);

  const loadPopularItems = async () => {
    try {
      const [servicesRes, casesRes, newsRes] = await Promise.all([
        fetch("/api/services?active=true&limit=3"),
        fetch("/api/cases?active=true&limit=3"),
        fetch("/api/news?published=true&limit=3"),
      ]);

      const [servicesData, casesData, newsData] = await Promise.all([
        servicesRes.json(),
        casesRes.json(),
        newsRes.json(),
      ]);

      const popular: SearchResult[] = [
        ...(servicesData.data || []).slice(0, 2).map((s: any) => ({
          id: s.id,
          title: s.title,
          description: s.description,
          type: "service" as const,
          href: `/services/${s.slug}`,
        })),
        ...(casesData.data || []).slice(0, 2).map((c: any) => ({
          id: c.id,
          title: c.title,
          description: c.description,
          type: "case" as const,
          href: `/cases/${c.slug}`,
        })),
        ...(newsData.data || []).slice(0, 2).map((n: any) => ({
          id: n.id,
          title: n.title,
          description: n.description,
          type: "news" as const,
          href: `/news/${n.slug}`,
        })),
      ];

      setPopularItems(popular);
    } catch (error) {
      console.error("Error loading popular items:", error);
    }
  };

  const performSearch = async (searchQuery: string) => {
    if (searchQuery.trim().length < 2) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const [servicesRes, casesRes, newsRes] = await Promise.all([
        fetch(`/api/services?active=true&search=${encodeURIComponent(searchQuery)}`),
        fetch(`/api/cases?active=true&search=${encodeURIComponent(searchQuery)}`),
        fetch(`/api/news?published=true&search=${encodeURIComponent(searchQuery)}`),
      ]);

      const [servicesData, casesData, newsData] = await Promise.all([
        servicesRes.json(),
        casesRes.json(),
        newsRes.json(),
      ]);

      const searchResults: SearchResult[] = [
        ...(servicesData.data || []).slice(0, 5).map((s: any) => ({
          id: s.id,
          title: s.title,
          description: s.description || s.content?.substring(0, 100),
          type: "service" as const,
          href: `/services/${s.slug}`,
        })),
        ...(casesData.data || []).slice(0, 5).map((c: any) => ({
          id: c.id,
          title: c.title,
          description: c.description || c.content?.substring(0, 100),
          type: "case" as const,
          href: `/cases/${c.slug}`,
        })),
        ...(newsData.data || []).slice(0, 5).map((n: any) => ({
          id: n.id,
          title: n.title,
          description: n.description || n.content?.substring(0, 100),
          type: "news" as const,
          href: `/news/${n.slug}`,
        })),
      ];

      setResults(searchResults);
    } catch (error) {
      console.error("Error performing search:", error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResultClick = (href: string) => {
    router.push(href);
    onClose();
    setQuery("");
  };

  const getTypeIcon = (type: SearchResult["type"]) => {
    switch (type) {
      case "service":
        return <FileText className="h-4 w-4" />;
      case "case":
        return <Briefcase className="h-4 w-4" />;
      case "news":
        return <Newspaper className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: SearchResult["type"]) => {
    switch (type) {
      case "service":
        return "Услуга";
      case "case":
        return "Кейс";
      case "news":
        return "Новость";
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className={cn(
            "absolute top-20 left-1/2 -translate-x-1/2 w-full max-w-2xl mx-4",
            className
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-background border border-border rounded-2xl shadow-2xl overflow-hidden">
            {/* Search Input */}
            <div className="relative p-4 border-b border-border">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                ref={inputRef}
                type="search"
                placeholder="Поиск услуг, кейсов, новостей..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-12 pr-4 h-12 text-base bg-secondary/50 border-0 rounded-lg"
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    onClose();
                  } else if (e.key === "Enter" && results.length > 0) {
                    handleResultClick(results[0].href);
                  }
                }}
              />
            </div>

            {/* Results */}
            <div className="max-h-[500px] overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : showPopular && popularItems.length > 0 ? (
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
                    <TrendingUp className="h-4 w-4" />
                    <span>Популярное</span>
                  </div>
                  <div className="space-y-2">
                    {popularItems.map((item) => (
                      <Link
                        key={item.id}
                        href={item.href}
                        onClick={() => handleResultClick(item.href)}
                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-secondary transition-colors group"
                      >
                        <div className="mt-0.5 text-muted-foreground group-hover:text-foreground transition-colors">
                          {getTypeIcon(item.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-medium truncate">{item.title}</p>
                            <span className="text-xs text-muted-foreground">
                              {getTypeLabel(item.type)}
                            </span>
                          </div>
                          {item.description && (
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {item.description}
                            </p>
                          )}
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    ))}
                  </div>
                </div>
              ) : results.length > 0 ? (
                <div className="p-4">
                  <div className="text-sm text-muted-foreground mb-4">
                    Найдено результатов: {results.length}
                  </div>
                  <div className="space-y-2">
                    {results.map((item) => (
                      <Link
                        key={item.id}
                        href={item.href}
                        onClick={() => handleResultClick(item.href)}
                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-secondary transition-colors group"
                      >
                        <div className="mt-0.5 text-muted-foreground group-hover:text-foreground transition-colors">
                          {getTypeIcon(item.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-medium truncate">{item.title}</p>
                            <span className="text-xs text-muted-foreground">
                              {getTypeLabel(item.type)}
                            </span>
                          </div>
                          {item.description && (
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {item.description}
                            </p>
                          )}
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    ))}
                  </div>
                </div>
              ) : query.trim().length > 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Search className="h-8 w-8 text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground">
                    Ничего не найдено по запросу "{query}"
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

