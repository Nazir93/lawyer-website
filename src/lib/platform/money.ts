/** Форматирование сумм в копейках — безопасно для client components */

export function formatRubFromKopecks(kopecks: number): string {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(kopecks / 100);
}

export function rubToKopecks(rub: number): number {
  return Math.round(rub * 100);
}
