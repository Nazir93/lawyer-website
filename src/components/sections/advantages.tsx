"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const advantages = [
  {
    number: "01",
    title: "Конфиденциальность",
    description:
      "Полная защита информации. Адвокатская тайна гарантирована законом.",
  },
  {
    number: "02",
    title: "Оперативность",
    description:
      "Быстрое реагирование на запросы. Первичная консультация в течение часа.",
  },
  {
    number: "03",
    title: "Прозрачность",
    description:
      "Понятный договор и способы оплаты. Никаких скрытых платежей.",
  },
  {
    number: "04",
    title: "Индивидуальный подход",
    description:
      "Персональное соглашение, учитывающее все особенности вашего дела.",
  },
  {
    number: "05",
    title: "Профессионализм",
    description:
      "15+ лет практики, глубокий анализ и квалифицированная помощь.",
  },
  {
    number: "06",
    title: "Гарантия",
    description:
      "Возврат неотработанной части при досрочном расторжении соглашения.",
  },
];

export function Advantages() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-24 lg:py-32 bg-secondary/30">
      <div className="container mx-auto px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mb-16"
        >
          <span className="text-sm text-muted-foreground uppercase tracking-widest mb-4 block">
            Преимущества
          </span>
          <h2 className="text-4xl sm:text-5xl font-light tracking-tight">
            Почему выбирают
            <br />
            <span className="font-serif italic">нас</span>
          </h2>
        </motion.div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
          {advantages.map((advantage, index) => (
            <motion.div
              key={advantage.number}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              <div className="flex items-start gap-6">
                <span className="text-5xl font-light text-muted-foreground/30 group-hover:text-muted-foreground/50 transition-colors">
                  {advantage.number}
                </span>
                <div className="pt-2">
                  <h3 className="text-xl font-medium mb-2">
                    {advantage.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {advantage.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
