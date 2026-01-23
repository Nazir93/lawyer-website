"use client";

import { motion, useInView } from "framer-motion";
import Link from "next/link";
import { ArrowUpRight, CheckCircle2, Trophy, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRef, useEffect, useState } from "react";
import type { Case as CaseType } from "@/lib/db/types";

export function CasesPreview() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [cases, setCases] = useState<CaseType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchCases() {
      try {
        const response = await fetch("/api/cases?active=true&limit=3");
        const data = await response.json();
        setCases(data.data || []);
      } catch (error) {
        console.error("Error fetching cases:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCases();
  }, []);

  // Если нет кейсов, не показываем секцию
  if (!isLoading && cases.length === 0) {
    return null;
  }

  return (
    <section ref={ref} className="py-24 lg:py-32">
      <div className="container mx-auto px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16"
        >
          <div>
            <span className="text-sm text-muted-foreground uppercase tracking-widest mb-4 block">
              Кейсы
            </span>
            <h2 className="text-4xl sm:text-5xl font-light tracking-tight">
              Успешные
              <br />
              <span className="font-serif italic">дела</span>
            </h2>
          </div>
          <Button
            variant="outline"
            className="rounded-full px-6 border-foreground/20 hover:bg-foreground hover:text-background self-start md:self-auto"
            asChild
          >
            <Link href="/cases">
              Все кейсы
              <ArrowUpRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </motion.div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Cases Grid */}
        {!isLoading && (
          <div className="space-y-4">
            {cases.map((caseItem, index) => (
              <motion.div
                key={caseItem.id}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.15 }}
              >
                <Link href={`/cases/${caseItem.slug}`} className="block group">
                  <div className="relative p-6 md:p-8 rounded-2xl border border-border transition-all duration-500 hover:border-foreground/20 hover:bg-secondary/30">
                    <div className="flex flex-col md:flex-row md:items-center gap-6">
                      {/* Left: Image */}
                      <div className="w-full md:w-32 h-32 md:h-24 rounded-xl bg-gradient-to-br from-secondary to-muted flex items-center justify-center shrink-0 overflow-hidden">
                        {caseItem.imageUrl ? (
                          <img
                            src={caseItem.imageUrl}
                            alt={caseItem.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Trophy className="h-8 w-8 text-muted-foreground/30" />
                        )}
                      </div>

                      {/* Middle: Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-sm text-muted-foreground">
                            {caseItem.category || "Юридический кейс"}
                          </span>
                          <span className="text-muted-foreground/30">•</span>
                          <span className="text-sm text-muted-foreground">
                            {caseItem.year}
                          </span>
                        </div>
                        <h3 className="text-xl md:text-2xl font-light tracking-tight mb-3 group-hover:underline underline-offset-4 decoration-foreground/30">
                          {caseItem.title}
                        </h3>
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          <span className="text-green-600 dark:text-green-400 font-medium">
                            {caseItem.result}
                          </span>
                        </div>
                      </div>

                      {/* Right: Arrow */}
                      <div className="flex items-center gap-6 md:gap-8">
                        {caseItem.duration && (
                          <div className="text-right">
                            <div className="text-lg font-light tracking-tight">
                              {caseItem.duration}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              срок работы
                            </div>
                          </div>
                        )}
                        <div className="w-12 h-12 rounded-full border border-border flex items-center justify-center group-hover:bg-foreground group-hover:text-background transition-all duration-300">
                          <ArrowUpRight className="h-5 w-5 transition-transform group-hover:rotate-45" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
