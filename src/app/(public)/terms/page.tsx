"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function TermsPage() {
  const [updateDate, setUpdateDate] = useState<string>("");

  useEffect(() => {
    // Форматируем дату только на клиенте
    setUpdateDate(new Date().toLocaleDateString("ru-RU"));
  }, []);

  return (
    <div className="min-h-screen pt-20">
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-6 lg:px-8 max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-sm text-muted-foreground uppercase tracking-widest mb-4 block">
              Правовая информация
            </span>
            <h1 className="text-4xl sm:text-5xl font-light tracking-tight mb-12">
              Пользовательское
              <br />
              <span className="font-serif italic">соглашение</span>
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="prose prose-neutral dark:prose-invert max-w-none"
          >
            {updateDate && (
              <p className="text-muted-foreground text-sm mb-8">
                Дата последнего обновления: {updateDate}
              </p>
            )}

            <h2>1. Общие положения</h2>
            <p>
              Настоящее Пользовательское соглашение (далее — Соглашение)
              регулирует отношения между владельцем сайта (далее — Администрация)
              и физическим лицом, использующим данный сайт (далее — Пользователь).
            </p>

            <h2>2. Предмет соглашения</h2>
            <p>
              Предметом настоящего Соглашения является предоставление Пользователю
              доступа к содержащимся на сайте информационным материалам и сервисам.
            </p>

            <h2>3. Права и обязанности сторон</h2>
            <h3>3.1. Администрация обязуется:</h3>
            <ul>
              <li>Обеспечивать бесперебойную работу сайта;</li>
              <li>Предоставлять актуальную информацию об услугах;</li>
              <li>Соблюдать конфиденциальность данных Пользователя.</li>
            </ul>

            <h3>3.2. Пользователь обязуется:</h3>
            <ul>
              <li>Не использовать сайт в незаконных целях;</li>
              <li>Не нарушать работоспособность сайта;</li>
              <li>Предоставлять достоверную информацию при заполнении форм.</li>
            </ul>

            <h2>4. Интеллектуальная собственность</h2>
            <p>
              Все материалы сайта являются объектами интеллектуальной собственности
              Администрации. Копирование материалов без письменного разрешения
              запрещено.
            </p>

            <h2>5. Ограничение ответственности</h2>
            <p>
              Информация на сайте носит справочный характер и не является
              юридической консультацией. Для получения консультации обратитесь
              к специалисту.
            </p>

            <h2>6. Разрешение споров</h2>
            <p>
              Споры разрешаются путём переговоров. При недостижении согласия
              спор передаётся в суд по месту нахождения Администрации.
            </p>

            <h2>7. Заключительные положения</h2>
            <p>
              Администрация вправе изменять условия Соглашения без предварительного
              уведомления. Новая редакция вступает в силу с момента публикации.
            </p>

            <div className="mt-12 p-6 rounded-2xl bg-secondary/50">
              <p className="text-sm text-muted-foreground">
                Используя данный сайт, вы подтверждаете, что ознакомились с
                настоящим Соглашением и принимаете его условия в полном объёме.
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

