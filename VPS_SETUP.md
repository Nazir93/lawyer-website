# Настройка VPS сервера (REG.RU / любой VPS)

Инструкция по развёртыванию сайта юриста на VPS сервере с PostgreSQL.

## Требования к VPS

- **ОС**: Ubuntu 22.04 LTS (рекомендуется)
- **RAM**: минимум 2 GB
- **CPU**: 1-2 ядра
- **Диск**: 20+ GB SSD
- **Порты**: 22 (SSH), 80 (HTTP), 443 (HTTPS), 5432 (PostgreSQL)

---

## Шаг 1: Подключение к VPS

```bash
ssh root@YOUR_VPS_IP
```

---

## Шаг 2: Первоначальная настройка

```bash
# Обновление системы
apt update && apt upgrade -y

# Установка необходимых пакетов
apt install -y curl wget git nginx certbot python3-certbot-nginx ufw

# Настройка файрвола
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw enable
```

---

## Шаг 3: Установка Node.js

```bash
# Установка Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Проверка версии
node -v
npm -v
```

---

## Шаг 4: Установка PostgreSQL

```bash
# Установка PostgreSQL
apt install -y postgresql postgresql-contrib

# Запуск и автозагрузка
systemctl start postgresql
systemctl enable postgresql
ssh root@130.49.150.220
r1FkwCi85EQ1icOO

# Создание базы данных
sudo -u postgres psql << EOF
CREATE USER lawyer_user WITH PASSWORD 'ВАША_СИЛЬНАЯ_ПАРОЛЬ';
CREATE DATABASE lawyer_db OWNER lawyer_user;
GRANT ALL PRIVILEGES ON DATABASE lawyer_db TO lawyer_user;
EOF
```

---

## Шаг 5: Настройка PostgreSQL для внешних подключений (опционально)

Если нужен доступ извне:

```bash
# Редактируем конфиг
nano /etc/postgresql/14/main/postgresql.conf

# Найти и изменить:
listen_addresses = 'localhost'  # или '*' для внешнего доступа

# Редактируем pg_hba.conf
nano /etc/postgresql/14/main/pg_hba.conf

# Добавить строку для локального доступа:
host    lawyer_db    lawyer_user    127.0.0.1/32    scram-sha-256

# Перезапуск PostgreSQL
systemctl restart postgresql
```

---

## Шаг 6: Загрузка проекта

```bash
# Создаём директорию для проекта
mkdir -p /var/www
cd /var/www

# Клонируем репозиторий (замените на ваш)
git clone https://github.com/YOUR_REPO/lawyer-website.git
cd lawyer-website

# Или загружаем через SCP с локального компьютера:
# scp -r ./lawyer-website root@YOUR_VPS_IP:/var/www/
```

---

## Шаг 7: Настройка переменных окружения

```bash
cd /var/www/lawyer-website

# Создаём .env.local
cat > .env.local << EOF
# База данных
DATABASE_URL="postgresql://lawyer_user:ВАША_ПАРОЛЬ@localhost:5432/lawyer_db"

# NextAuth
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
NEXTAUTH_URL="https://ваш-домен.ru"

# Хранилище файлов (локальное)
UPLOAD_DIR="/var/www/lawyer-website/public/uploads"

# Telegram уведомления
TELEGRAM_BOT_TOKEN="ваш-токен-бота"
TELEGRAM_CHAT_ID="ваш-chat-id"
EOF
```

---

## Шаг 8: Сборка проекта

```bash
cd /var/www/lawyer-website

# Установка зависимостей
npm install

# Генерация Prisma клиента
npx prisma generate

# Применение миграций к БД
npx prisma db push

# Сборка проекта
npm run build
```

---

## Шаг 9: Настройка PM2 (Process Manager)

```bash
# Установка PM2
npm install -g pm2

# Запуск приложения
pm2 start npm --name "lawyer-website" -- start

# Автозапуск при перезагрузке
pm2 startup
pm2 save

# Полезные команды:
# pm2 logs lawyer-website  - логи
# pm2 restart lawyer-website  - перезапуск
# pm2 status  - статус
```

---

## Шаг 10: Настройка Nginx

```bash
# Создаём конфиг
cat > /etc/nginx/sites-available/lawyer << 'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name ваш-домен.ru www.ваш-домен.ru;

    # Логи
    access_log /var/log/nginx/lawyer-access.log;
    error_log /var/log/nginx/lawyer-error.log;

    # Максимальный размер загружаемых файлов
    client_max_body_size 50M;

    # Проксирование на Next.js приложение
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Таймауты
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Статические файлы
    location /_next/static {
        proxy_pass http://localhost:3000;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    location /uploads {
        alias /var/www/lawyer-website/public/uploads;
        add_header Cache-Control "public, max-age=86400";
    }

    # Блокировка доступа к скрытым файлам
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
}
EOF

# Активация сайта
ln -s /etc/nginx/sites-available/lawyer /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Проверка конфига
nginx -t

# Перезапуск Nginx
systemctl restart nginx

# Открытие портов в файрволе
ufw allow 'Nginx Full'

---

## Шаг 11: SSL сертификат (Let's Encrypt)

**⚠️ Перед получением SSL убедитесь, что домен работает по HTTP!**

```bash
# Установка Certbot (если не установлен)
apt install -y certbot python3-certbot-nginx

# Получение SSL сертификата
certbot --nginx -d ваш-домен.ru -d www.ваш-домен.ru

# Следуйте инструкциям:
# - Введите email для уведомлений
# - Согласитесь с условиями (A)
# - Выберите редирект HTTP на HTTPS (2)

# Автообновление (добавляется автоматически)
# Проверить: systemctl status certbot.timer
```

**После получения SSL обновите NEXTAUTH_URL в .env.local:**
```bash
nano /var/www/lawyer-website/.env.local
# Измените: NEXTAUTH_URL="https://ваш-домен.ru"
pm2 restart lawyer-website
```

---

## Шаг 12: Создание папки для загрузок

```bash
mkdir -p /var/www/lawyer-website/public/uploads
chown -R www-data:www-data /var/www/lawyer-website/public/uploads
chmod 755 /var/www/lawyer-website/public/uploads
```

---

## Полезные команды

```bash
# Перезапуск приложения после изменений
cd /var/www/lawyer-website
git pull
npm install
npm run build
pm2 restart lawyer-website

# Просмотр логов
pm2 logs lawyer-website

# Подключение к БД
sudo -u postgres psql -d lawyer_db

# Бэкап базы данных
pg_dump -U lawyer_user lawyer_db > backup_$(date +%Y%m%d).sql
```

---

## Установка n8n (опционально)

```bash
# Установка n8n глобально
npm install -g n8n

# Запуск через PM2
pm2 start n8n --name "n8n"

# Или через Docker
docker run -d --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```

Настройка Nginx для n8n:

```bash
cat > /etc/nginx/sites-available/n8n << 'EOF'
server {
    listen 80;
    server_name n8n.ваш-домен.ru;

    location / {
        proxy_pass http://localhost:5678;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

ln -s /etc/nginx/sites-available/n8n /etc/nginx/sites-enabled/
nginx -t && systemctl restart nginx
certbot --nginx -d n8n.ваш-домен.ru
```

---

## Безопасность

```bash
# Смена SSH порта (опционально)
nano /etc/ssh/sshd_config
# Port 2222

# Отключение входа по паролю root
# PermitRootLogin prohibit-password

# Установка fail2ban
apt install -y fail2ban
systemctl enable fail2ban
systemctl start fail2ban
```

---

## Структура файлов на сервере

```
/var/www/lawyer-website/
├── .env.local          # Переменные окружения
├── .next/              # Скомпилированное приложение
├── node_modules/       # Зависимости
├── prisma/             # Схема базы данных
├── public/
│   └── uploads/        # Загруженные файлы
├── src/                # Исходный код
└── package.json
```

