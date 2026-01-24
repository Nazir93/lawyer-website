"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowUpRight, Folder, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

interface Subsection {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  icon: string | null;
  href: string;
}

interface Service {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  price_from: number | null;
  price_to: number | null;
  price_text: string | null;
  href: string;
}

interface SectionData {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  icon: string | null;
  children: Subsection[];
  services: Service[];
}

export default function SectionPage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [section, setSection] = useState<SectionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSection() {
      try {
        const res = await fetch(`/api/public/sections/${slug}`);
        const data = await res.json();
        
        if (!res.ok) {
          setError(data.error || "Раздел не найден");
          return;
        }
        
        setSection(data.data);
      } catch (err) {
        setError("Ошибка загрузки раздела");
      } finally {
        setIsLoading(false);
      }
    }

    if (slug) {
      fetchSection();
    }
  }, [slug]);

  if (isLoading) {
    return (
      <>
        <Header />
        <main className="min-h-screen pt-20">
          <div className="container mx-auto px-6 py-16 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (error || !section) {
    return (
      <>
        <Header />
        <main className="min-h-screen pt-20">
          <div className="container mx-auto px-6 py-16 text-center">
            <h1 className="text-3xl font-light mb-4">Раздел не найден</h1>
            <p className="text-muted-foreground mb-8">{error}</p>
            <Button asChild>
              <Link href="/services">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Все услуги
              </Link>
            </Button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen pt-20">
        {/* Hero Section */}
        <section className="py-16 lg:py-24 border-b border-border">
          <div className="container mx-auto px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
                <Link href="/" className="hover:text-foreground transition-colors">
                  Главная
                </Link>
                <span>/</span>
                <Link href="/services" className="hover:text-foreground transition-colors">
                  Услуги
                </Link>
                <span>/</span>
                <span className="text-foreground">{section.name}</span>
              </div>

              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div>
                  {section.icon && (
                    <span className="text-5xl mb-6 block">{section.icon}</span>
                  )}
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight mb-6">
                    {section.name}
                  </h1>
                  {section.description && (
                    <p className="text-xl text-muted-foreground leading-relaxed">
                      {section.description}
                    </p>
                  )}
                  <div className="mt-8 flex gap-4">
                    <Button size="lg" className="rounded-full px-8" asChild>
                      <Link href="/contacts">
                        Получить консультацию
                        <ArrowUpRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
                
                {section.image_url && (
                  <div className="aspect-[4/3] rounded-2xl overflow-hidden">
                    <img
                      src={section.image_url}
                      alt={section.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Subsections */}
        {section.children.length > 0 && (
          <section className="py-16 lg:py-24">
            <div className="container mx-auto px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-3xl sm:text-4xl font-light tracking-tight mb-12">
                  Подразделы
                </h2>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {section.children.map((child, index) => (
                    <motion.div
                      key={child.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <Link href={child.href} className="block group">
                        <div className="p-6 rounded-2xl border border-border hover:border-foreground/20 hover:bg-secondary/50 transition-all duration-300">
                          <div className="flex items-start gap-4 mb-4">
                            {child.icon ? (
                              <span className="text-3xl">{child.icon}</span>
                            ) : (
                              <div className="p-2 rounded-lg bg-secondary">
                                <Folder className="h-5 w-5" />
                              </div>
                            )}
                          </div>
                          <h3 className="text-xl font-medium mb-2 group-hover:text-foreground transition-colors">
                            {child.name}
                          </h3>
                          {child.description && (
                            <p className="text-muted-foreground text-sm line-clamp-2">
                              {child.description}
                            </p>
                          )}
                          <div className="mt-4 flex items-center gap-2 text-sm font-medium">
                            <span className="group-hover:underline underline-offset-4">
                              Подробнее
                            </span>
                            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </section>
        )}

        {/* Services in this section */}
        {section.services.length > 0 && (
          <section className="py-16 lg:py-24 bg-secondary/30">
            <div className="container mx-auto px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-3xl sm:text-4xl font-light tracking-tight mb-12">
                  Услуги
                </h2>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {section.services.map((service, index) => (
                    <motion.div
                      key={service.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <Link href={service.href} className="block group h-full">
                        <div className="p-6 rounded-2xl border border-border bg-background hover:border-foreground/20 transition-all duration-300 h-full flex flex-col">
                          {service.image_url && (
                            <div className="aspect-video rounded-lg overflow-hidden mb-4">
                              <img
                                src={service.image_url}
                                alt={service.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <h3 className="text-lg font-medium mb-2 group-hover:text-foreground transition-colors">
                            {service.title}
                          </h3>
                          {service.description && (
                            <p className="text-muted-foreground text-sm line-clamp-2 flex-1">
                              {service.description}
                            </p>
                          )}
                          {(service.price_from || service.price_text) && (
                            <div className="mt-4 pt-4 border-t border-border">
                              <span className="text-sm font-medium">
                                {service.price_text || (service.price_from && `от ${service.price_from.toLocaleString()} ₽`)}
                              </span>
                            </div>
                          )}
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="py-16 border-t border-border">
          <div className="container mx-auto px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-light tracking-tight mb-4">
              Нужна консультация?
            </h2>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              Свяжитесь с нами для получения профессиональной юридической помощи
            </p>
            <Button size="lg" className="rounded-full px-8" asChild>
              <Link href="/contacts">
                Связаться
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

