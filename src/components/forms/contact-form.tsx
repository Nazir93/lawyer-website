"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowUpRight, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Link from "next/link";
import { toast } from "sonner";
import { normalizeLawyerQueryParam } from "@/lib/platform/leads";

interface ServiceOption {
  id: string;
  title: string;
}

const formSchema = z.object({
  name: z.string().min(2, "Введите ваше имя"),
  phone: z.string().min(10, "Введите корректный номер телефона"),
  email: z.string().email("Введите корректный email").optional().or(z.literal("")),
  service: z.string().optional(),
  message: z.string().optional(),
  consent: z.boolean().refine((val) => val === true, {
    message: "Необходимо согласие на обработку данных",
  }),
});

type FormData = z.infer<typeof formSchema>;

export function ContactForm() {
  const searchParams = useSearchParams();
  const lawyerSlug = normalizeLawyerQueryParam(searchParams.get("lawyer"));
  const [lawyerLabel, setLawyerLabel] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [services, setServices] = useState<ServiceOption[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(true);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      service: "",
      message: "",
      consent: false,
    },
  });

  useEffect(() => {
    async function loadServices() {
      try {
        // Загружаем и услуги, и разделы
        const [servicesRes, sectionsRes] = await Promise.all([
          fetch("/api/services?active=true"),
          fetch("/api/public/sections"),
        ]);
        
        const servicesData = await servicesRes.json();
        const sectionsData = await sectionsRes.json();
        
        // Объединяем услуги и разделы
        const allOptions: ServiceOption[] = [];
        
        // Добавляем услуги
        if (servicesData.data) {
          allOptions.push(...servicesData.data.map((s: { id: string; title: string }) => ({
            id: s.id,
            title: s.title,
          })));
        }
        
        // Добавляем разделы (если услуг нет или их мало)
        if (sectionsData.data) {
          sectionsData.data.forEach((section: { id: string; name: string; children?: { id: string; name: string }[] }) => {
            // Добавляем родительский раздел
            allOptions.push({
              id: section.id,
              title: section.name,
            });
            // Добавляем подразделы
            if (section.children) {
              section.children.forEach((child: { id: string; name: string }) => {
                allOptions.push({
                  id: child.id,
                  title: `  → ${child.name}`,
                });
              });
            }
          });
        }
        
        setServices(allOptions);
      } catch (error) {
        console.error("Error loading services:", error);
      } finally {
        setIsLoadingServices(false);
      }
    }

    loadServices();
  }, []);

  useEffect(() => {
    if (!lawyerSlug) {
      setLawyerLabel(null);
      return;
    }
    fetch(`/api/public/lawyers/${lawyerSlug}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.lawyer?.displayName) setLawyerLabel(data.lawyer.displayName);
      })
      .catch(() => setLawyerLabel(null));
  }, [lawyerSlug]);

  async function onSubmit(data: FormData) {
    setIsSubmitting(true);

    try {
      // Находим название выбранной услуги/раздела
      const selectedService = services.find((s) => s.id === data.service);
      const serviceName = selectedService?.title?.replace("  → ", "") || data.service;
      
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          service: data.service ? serviceName : null,
          lawyerSlug: lawyerSlug || undefined,
        }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Ошибка отправки");
      }

      setIsSuccess(true);
      toast.success("Заявка отправлена!");
      form.reset();

      setTimeout(() => setIsSuccess(false), 5000);
    } catch (error: any) {
      toast.error(error.message || "Ошибка. Попробуйте ещё раз.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-8 rounded-2xl border border-border text-center"
      >
        <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-green-500" />
        </div>
        <h3 className="text-2xl font-light tracking-tight mb-2">
          Заявка отправлена
        </h3>
        <p className="text-muted-foreground">
          Мы свяжемся с вами в течение часа
          {lawyerLabel ? ` (юрист: ${lawyerLabel})` : ""}
        </p>
      </motion.div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {lawyerLabel && (
          <div className="rounded-xl border border-border bg-secondary/40 px-4 py-3 text-sm">
            Заявка будет направлена юристу:{" "}
            <span className="font-medium">{lawyerLabel}</span>
          </div>
        )}
        <div className="grid sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm text-muted-foreground">
                  Имя *
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Иван Иванов"
                    className="h-12 rounded-xl border-border bg-transparent"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm text-muted-foreground">
                  Телефон *
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="+7 (900) 123-45-67"
                    className="h-12 rounded-xl border-border bg-transparent"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm text-muted-foreground">
                  Email
                </FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="email@example.com"
                    className="h-12 rounded-xl border-border bg-transparent"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="service"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm text-muted-foreground">
                  Услуга
                </FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-12 rounded-xl border-border bg-transparent">
                      <SelectValue placeholder={isLoadingServices ? "Загрузка..." : "Выберите услугу"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {services.length === 0 && !isLoadingServices ? (
                      <div className="px-2 py-1.5 text-sm text-muted-foreground">
                        Услуги не добавлены
                      </div>
                    ) : (
                      services.map((service) => (
                        <SelectItem key={service.id} value={service.id}>
                          {service.title}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm text-muted-foreground">
                Сообщение
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Опишите вашу ситуацию..."
                  className="min-h-[120px] rounded-xl border-border bg-transparent resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="consent"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className="mt-0.5"
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="text-sm font-normal text-muted-foreground">
                  Я согласен на обработку{" "}
                  <Link
                    href="/privacy"
                    className="underline underline-offset-4 hover:text-foreground"
                    target="_blank"
                  >
                    персональных данных
                  </Link>
                </FormLabel>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        <Button
          type="submit"
          size="lg"
          className="w-full rounded-full h-14 text-base"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Отправка...
            </>
          ) : (
            <>
              Отправить заявку
              <ArrowUpRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}
