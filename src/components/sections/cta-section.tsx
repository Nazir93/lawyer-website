"use client";

import { motion, useInView } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useRef } from "react";

export function CTASection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      ref={ref}
      className="py-24 lg:py-32 bg-background text-foreground relative overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:64px_64px]" />

      {/* Gradient Orbs */}
      <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-gradient-to-r from-violet-500/20 to-purple-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl" />

      <div className="container mx-auto px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight mb-6">
              Нужна юридическая
              <br />
              <span className="font-serif italic">помощь?</span>
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Получите бесплатную первичную консультацию. Мы оценим вашу
              ситуацию и предложим оптимальный план действий.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                className="rounded-full px-8 h-14 text-base bg-foreground text-background hover:bg-foreground/90"
                asChild
              >
                <Link href="/contacts">
                  Получить консультацию
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full px-8 h-14 text-base border-foreground/20 text-foreground hover:bg-foreground/10"
                asChild
              >
                <a href="tel:+79001234567">+7 (900) 123-45-67</a>
              </Button>
            </div>

            {/* Response time */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.3 }}
              className="mt-10 inline-flex items-center gap-2 text-sm text-muted-foreground"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400"></span>
              </span>
              Ответим в течение 1 часа
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
