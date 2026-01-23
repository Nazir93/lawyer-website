"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight, ArrowDown } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useRef, useEffect, useState } from "react";

interface HeroData {
  content_type: 'image' | 'video';
  image_url?: string;
  video_url?: string;
  video_type?: 'youtube' | 'vimeo' | 'file';
  title?: string;
  subtitle?: string;
  description?: string;
  primary_button_text?: string;
  primary_button_link?: string;
  secondary_button_text?: string;
  secondary_button_link?: string;
  badge_text?: string;
  show_badge?: boolean;
  stats?: Array<{ value: string; label: string }>;
  overlay_opacity?: number;
  text_position?: 'left' | 'center' | 'right';
}

export function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [heroData, setHeroData] = useState<HeroData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  useEffect(() => {
    async function fetchHero() {
      try {
        const res = await fetch("/api/hero");
        const result = await res.json();

        if (!res.ok) {
          // Если таблица не существует или нет данных, используем дефолтные значения
          console.warn("Hero data not found, using defaults");
          setIsLoading(false);
          return;
        }

        if (result.data) {
          // Обрабатываем stats - Supabase возвращает JSONB как объект
          // overlay_opacity может быть строкой (DECIMAL), преобразуем в число
          const processedData = {
            ...result.data,
            stats: Array.isArray(result.data.stats) ? result.data.stats : [],
            overlay_opacity: result.data.overlay_opacity 
              ? typeof result.data.overlay_opacity === 'string' 
                ? parseFloat(result.data.overlay_opacity) 
                : result.data.overlay_opacity
              : 0.3,
          };
          setHeroData(processedData);
        }
      } catch (error) {
        console.error("Error fetching hero:", error);
        // При ошибке используем дефолтные значения
      } finally {
        setIsLoading(false);
      }
    }

    fetchHero();
  }, []);

  // Дефолтные значения
  const data = heroData || {
    content_type: 'image' as const,
    title: 'Юридическая защита высшего класса',
    subtitle: 'Гасанов И Адвокат',
    description: '15 лет опыта. 500+ выигранных дел. Персональный подход к каждому клиенту. Решаем сложные юридические вопросы.',
    primary_button_text: 'Получить консультацию',
    primary_button_link: '/contacts',
    secondary_button_text: 'Смотреть кейсы',
    secondary_button_link: '/cases',
    badge_text: 'Бесплатная консультация',
    show_badge: true,
    stats: [
      { value: "500+", label: "Выигранных дел" },
      { value: "15", label: "Лет опыта" },
      { value: "98%", label: "Довольных клиентов" },
      { value: "24/7", label: "Поддержка" },
    ],
    text_position: 'center' as const,
    overlay_opacity: 0.3,
  };

  const getVideoEmbedUrl = (url: string, type: string) => {
    if (type === 'youtube') {
      const videoId = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1];
      return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0` : null;
    }
    if (type === 'vimeo') {
      const videoId = url.match(/vimeo\.com\/(\d+)/)?.[1];
      return videoId ? `https://player.vimeo.com/video/${videoId}?autoplay=1&mute=1&loop=1&background=1` : null;
    }
    return url;
  };

  const textAlignClass = {
    left: 'text-left items-start',
    center: 'text-center items-center',
    right: 'text-right items-end',
  }[data.text_position || 'center'];

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background Media */}
      {data.content_type === 'video' && data.video_url ? (
        <div className="absolute inset-0 z-0">
          {data.video_type === 'youtube' || data.video_type === 'vimeo' ? (
            <iframe
              src={getVideoEmbedUrl(data.video_url, data.video_type) || undefined}
              className="absolute inset-0 w-full h-full object-cover"
              allow="autoplay; encrypted-media"
              allowFullScreen
              style={{ pointerEvents: 'none' }}
            />
          ) : (
            <video
              src={data.video_url}
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
          <div 
            className="absolute inset-0 bg-black"
            style={{ opacity: data.overlay_opacity || 0.3 }}
          />
        </div>
      ) : data.image_url ? (
        <>
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${data.image_url})` }}
          />
          <div 
            className="absolute inset-0 bg-black"
            style={{ opacity: data.overlay_opacity || 0.3 }}
          />
        </>
      ) : (
        <>
          {/* Default Background Grid */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:64px_64px]" />
          {/* Gradient Orbs */}
          <div className="absolute top-1/4 -left-1/4 w-[600px] h-[600px] bg-gradient-to-r from-violet-500/10 to-purple-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 -right-1/4 w-[600px] h-[600px] bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl" />
        </>
      )}

      <motion.div style={{ y, opacity }} className={`container mx-auto px-6 lg:px-8 relative z-10 flex ${textAlignClass}`}>
        <div className="max-w-6xl mx-auto w-full">
          {/* Badge */}
          {data.show_badge && data.badge_text && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className={`flex items-center gap-3 mb-8 ${textAlignClass.includes('center') ? 'justify-center' : textAlignClass.includes('right') ? 'justify-end' : 'justify-start'}`}
            >
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border text-sm text-muted-foreground bg-background/50 backdrop-blur-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                {data.badge_text}
              </span>
            </motion.div>
          )}

          {/* Subtitle */}
          {data.subtitle && (
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-2xl sm:text-3xl font-light tracking-tight mb-4"
            >
              {data.subtitle}
            </motion.h2>
          )}

          {/* Main Heading */}
          {data.title && (
            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light tracking-tight leading-[1.1]"
            >
              {data.title}
            </motion.h1>
          )}

          {/* Description */}
          {data.description && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-10 text-lg sm:text-xl text-muted-foreground max-w-2xl leading-relaxed"
              style={{ marginLeft: textAlignClass.includes('center') ? 'auto' : textAlignClass.includes('right') ? 'auto' : '0', marginRight: textAlignClass.includes('center') ? 'auto' : textAlignClass.includes('right') ? '0' : 'auto' }}
            >
              {data.description}
            </motion.p>
          )}

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className={`mt-12 flex flex-col sm:flex-row gap-4 ${textAlignClass.includes('center') ? 'justify-center' : textAlignClass.includes('right') ? 'justify-end' : 'justify-start'}`}
          >
            {data.primary_button_text && data.primary_button_link && (
              <Button
                size="lg"
                className="rounded-full px-8 h-14 text-base group"
                asChild
              >
                <Link href={data.primary_button_link}>
                  {data.primary_button_text}
                  <ArrowUpRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              </Button>
            )}
            {data.secondary_button_text && data.secondary_button_link && (
              <Button
                variant="outline"
                size="lg"
                className="rounded-full px-8 h-14 text-base border-foreground/20 hover:bg-foreground hover:text-background"
                asChild
              >
                <Link href={data.secondary_button_link}>{data.secondary_button_text}</Link>
              </Button>
            )}
          </motion.div>

          {/* Stats */}
          {data.stats && data.stats.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 border-t border-border pt-12"
            >
              {data.stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 + index * 0.1 }}
                  className="text-center"
                >
                  <div className="text-3xl sm:text-4xl font-light tracking-tight">
                    {stat.value}
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-2 text-muted-foreground"
        >
          <span className="text-xs uppercase tracking-widest">Scroll</span>
          <ArrowDown className="h-4 w-4" />
        </motion.div>
      </motion.div>
    </section>
  );
}
