"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { ArrowUpRight, Building2, Users, Sparkles, Briefcase, Loader2, Folder, LucideIcon } from "lucide-react";

// Маппинг иконок по slug
const iconMap: Record<string, LucideIcon> = {
  business: Building2,
  individual: Users,
  special: Sparkles,
};

// Дефолтные разделы
const defaultSections = [
  {
    id: "1",
    title: "Юридическим лицам",
    description: "Сопровождение бизнеса, арбитраж, банкротство, корпоративные споры",
    href: "/services/business",
    slug: "business",
  },
  {
    id: "2",
    title: "Физическим лицам",
    description: "Семейное право, наследство, недвижимость, трудовые споры",
    href: "/services/individual",
    slug: "individual",
  },
  {
    id: "3",
    title: "Спецпредложения",
    description: "VIP-сопровождение, абонентское обслуживание, медиация",
    href: "/services/special",
    slug: "special",
  },
];

interface Section {
  id: string;
  title: string;
  description: string | null;
  href: string;
  slug?: string;
}

export function ServicesGrid() {
  const [sections, setSections] = useState<Section[]>(defaultSections);
  const [casesCount, setCasesCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [sectionsRes, casesRes] = await Promise.all([
          fetch("/api/public/sections"),
          fetch("/api/cases?active=true"),
        ]);

        const sectionsData = await sectionsRes.json();
        const casesData = await casesRes.json();

        if (sectionsData.data && sectionsData.data.length > 0) {
          setSections(sectionsData.data);
        }

        setCasesCount(casesData.count || 0);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  // Добавляем блок "Кейсы" в конец
  const displaySections = [
    ...sections.map((s, index) => ({
      ...s,
      icon: iconMap[s.slug || ""] || Folder,
      featured: index === 0,
      count: "Услуги",
    })),
    {
      id: "cases",
      title: "Кейсы",
      description: "Успешно завершённые дела и реальные результаты",
      href: "/cases",
      slug: "cases",
      icon: Briefcase,
      featured: false,
      count: casesCount > 0 ? `${casesCount}+ кейсов` : "Кейсы",
    },
  ];

  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [80, -80]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);

  return (
    <section ref={sectionRef} className="py-24 lg:py-32">
      <motion.div style={{ y, opacity }} className="container mx-auto px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16"
        >
          <div>
            <span className="text-sm text-muted-foreground uppercase tracking-widest mb-4 block">
              Услуги
            </span>
            <h2 className="text-4xl sm:text-5xl font-light tracking-tight">
              Чем мы можем
              <br />
              <span className="font-serif italic">помочь</span>
            </h2>
          </div>
          <p className="text-muted-foreground max-w-md text-lg">
            Полный спектр юридических услуг для физических и юридических лиц
          </p>
        </motion.div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 gap-4">
          {displaySections.map((section, index) => {
            const Icon = section.icon;
            return (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link href={section.href} className="block group">
                  <div
                    className={`
                      relative p-8 rounded-2xl border border-border 
                      transition-all duration-500 
                      hover:border-foreground/20 hover:bg-secondary/50
                      ${section.featured ? "md:row-span-2" : ""}
                    `}
                  >
                    {/* Top Row */}
                    <div className="flex items-start justify-between mb-8">
                      <div className="p-3 rounded-xl bg-secondary">
                        <Icon className="h-6 w-6" />
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {isLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          section.count
                        )}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="space-y-4">
                      <h3 className="text-2xl font-light tracking-tight group-hover:text-foreground transition-colors">
                        {section.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {section.description}
                      </p>
                    </div>

                    {/* Arrow */}
                    <div className="mt-8 flex items-center gap-2 text-sm font-medium">
                      <span className="group-hover:underline underline-offset-4">
                        Подробнее
                      </span>
                      <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </div>

                    {/* Hover gradient */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-transparent via-transparent to-foreground/[0.02] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
}
