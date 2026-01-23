# 🏛️ Сайт Юриста / Адвоката

Современный сайт для юридической практики на Next.js 15 с личным кабинетом клиента, админ-панелью и интеграцией с Telegram.

## ✨ Возможности

- 🎨 **Современный дизайн** — адаптивный, с тёмной темой
- 📱 **Мобильная версия** — оптимизировано для всех устройств
- 👤 **Личный кабинет клиента** — документы, сообщения, консультации
- 🔐 **Авторизация** — вход по email или телефону
- 📊 **Админ-панель** — управление контентом и заявками
- 📞 **Telegram уведомления** — мгновенные оповещения о заявках
- 🔒 **ФЗ-152** — хранение данных на российских серверах

## 🛠️ Технологии

- **Frontend**: Next.js 15, React 19, TypeScript
- **Стили**: Tailwind CSS, shadcn/ui
- **База данных**: PostgreSQL + Prisma ORM
- **Аутентификация**: NextAuth.js
- **Анимации**: Framer Motion

## 🚀 Быстрый старт

### 1. Клонирование

```bash
git clone <your-repo>
cd lawyer-website
```

### 2. Установка зависимостей

```bash
npm install
```

### 3. Настройка переменных окружения

```bash
cp env.example .env.local
# Отредактируйте .env.local
```

### 4. Настройка базы данных

```bash
# Генерация Prisma клиента
npx prisma generate

# Применение схемы к БД
npx prisma db push
```

### 5. Запуск

```bash
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000)

## 📁 Структура проекта

```
src/
├── app/                    # Next.js App Router
│   ├── (admin)/           # Админ-панель
│   ├── (dashboard)/       # Личный кабинет
│   ├── (public)/          # Публичные страницы
│   └── api/               # API endpoints
├── components/            # React компоненты
├── hooks/                 # Custom hooks
└── lib/                   # Утилиты
    ├── auth/             # NextAuth конфигурация
    ├── db/               # Prisma клиент
    └── storage/          # Хранилище файлов
```

## 🌐 Развёртывание

### VPS (REG.RU, Timeweb и др.)

Смотрите подробную инструкцию в [VPS_SETUP.md](./VPS_SETUP.md)

### Vercel

```bash
npm run build
# Деплой через Vercel CLI или GitHub интеграцию
```

## 📝 API Endpoints

| Endpoint | Метод | Описание |
|----------|-------|----------|
| `/api/services` | GET/POST | Услуги |
| `/api/cases` | GET/POST | Кейсы |
| `/api/news` | GET/POST | Новости |
| `/api/leads` | GET/POST | Заявки |
| `/api/reviews` | GET/POST | Отзывы |
| `/api/settings` | GET/PUT | Настройки |
| `/api/auth/register` | POST | Регистрация |

## 🔧 Команды

```bash
npm run dev        # Разработка
npm run build      # Сборка
npm run start      # Продакшен
npm run lint       # Проверка кода
npx prisma studio  # Просмотр БД
```

## 📄 Лицензия

MIT
