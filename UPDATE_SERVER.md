# 🔄 Обновление проекта на сервере

Инструкция по обновлению проекта на сервере после изменений в git.

---

## 📋 Быстрое обновление

```bash
# Подключитесь к серверу
ssh root@130.49.150.220

# Перейдите в директорию проекта
cd /var/www/lawyer-website

# Получите последние изменения из git
git pull origin main

# Установите новые зависимости (если есть)
npm install

# Пересоберите проект
npm run build

# Перезапустите приложение
pm2 restart lawyer-website

# Проверьте статус
pm2 status
pm2 logs lawyer-website --lines 50
```

---

## 🔍 Проверка изменений

После обновления проверьте:

```bash
# Статус приложения
pm2 status

# Логи приложения
pm2 logs lawyer-website

# Проверка работы сайта
curl http://localhost:3000
```

---

## ⚠️ Если что-то пошло не так

### Откат к предыдущей версии:

```bash
cd /var/www/lawyer-website

# Посмотреть историю коммитов
git log --oneline -5

# Откатиться к предыдущему коммиту (замените COMMIT_HASH)
git reset --hard COMMIT_HASH

# Пересобрать и перезапустить
npm run build
pm2 restart lawyer-website
```

### Или откат к последней рабочей версии:

```bash
cd /var/www/lawyer-website
git pull origin main
npm install
npm run build
pm2 restart lawyer-website
```

---

## 📝 Полный процесс обновления

```bash
# 1. Подключение к серверу
ssh root@130.49.150.220

# 2. Переход в директорию проекта
cd /var/www/lawyer-website

# 3. Проверка текущего статуса
git status

# 4. Получение изменений
git fetch origin
git pull origin main

# 5. Проверка изменений
git log --oneline -3

# 6. Установка зависимостей
npm install

# 7. Обновление Prisma (если были изменения в схеме)
npx prisma generate
# npx prisma db push  # только если нужно обновить БД

# 8. Сборка проекта
npm run build

# 9. Перезапуск приложения
pm2 restart lawyer-website

# 10. Проверка
pm2 status
pm2 logs lawyer-website --lines 20
```

---

## 🚀 Автоматическое обновление (опционально)

Можно создать скрипт для автоматического обновления:

```bash
# Создайте файл update.sh
cat > /root/update-lawyer.sh << 'EOF'
#!/bin/bash
cd /var/www/lawyer-website
git pull origin main
npm install
npm run build
pm2 restart lawyer-website
echo "Обновление завершено!"
pm2 status
EOF

# Сделайте исполняемым
chmod +x /root/update-lawyer.sh

# Использование:
/root/update-lawyer.sh
```

---

## ✅ Чек-лист после обновления

- [ ] `git pull` выполнен успешно
- [ ] `npm install` выполнен (если были новые зависимости)
- [ ] `npm run build` выполнен успешно
- [ ] `pm2 restart lawyer-website` выполнен
- [ ] Приложение работает (проверено через `pm2 status`)
- [ ] Сайт открывается (проверено через `curl` или браузер)
- [ ] Нет ошибок в логах (`pm2 logs`)

