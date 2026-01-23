/**
 * Безопасное форматирование даты для SSR/CSR
 * Использует фиксированную локаль для консистентности
 */
export function formatDate(
  date: string | Date,
  options: Intl.DateTimeFormatOptions = {}
): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  
  // Используем фиксированную локаль для консистентности между сервером и клиентом
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...options,
  }).format(dateObj);
}

/**
 * Форматирование даты для отображения в списках
 */
export function formatDateShort(date: string | Date): string {
  return formatDate(date, {
    day: "numeric",
    month: "short",
  });
}

/**
 * Форматирование даты и времени
 */
export function formatDateTime(date: string | Date): string {
  return formatDate(date, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Форматирование времени (часы:минуты)
 */
export function formatTime(date: string | Date): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(dateObj);
}

