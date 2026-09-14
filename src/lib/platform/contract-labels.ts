import type { ContractStatus } from "@prisma/client";

export const CONTRACT_STATUS_LABEL: Record<ContractStatus, string> = {
  DRAFT: "Черновик",
  SENT: "Отправлен клиенту",
  SIGNED: "Подписан",
  PAID: "Оплачен",
  CANCELLED: "Отменён",
  REFUNDED: "Возврат",
};
