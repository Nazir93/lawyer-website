export type LawyerStatus =
  | "PENDING"
  | "ACTIVE"
  | "SUSPENDED"
  | "REJECTED";

export type ModerationEvent = {
  lawyerId: string;
  displayName: string;
  email: string | null;
  previousStatus: LawyerStatus | null;
  nextStatus: LawyerStatus;
};

export type ModerationNotification = {
  channel: "log" | "email" | "telegram";
  subject: string;
  body: string;
  recipient: string | null;
};

const STATUS_RU: Record<LawyerStatus, string> = {
  PENDING: "на модерации",
  ACTIVE: "одобрен",
  SUSPENDED: "приостановлен",
  REJECTED: "отклонён",
};

/** Текст уведомления юристу о смене статуса (без отправки). */
export function buildModerationNotification(
  event: ModerationEvent
): ModerationNotification {
  const statusLabel = STATUS_RU[event.nextStatus];
  const subject = `Статус заявки юриста: ${statusLabel}`;

  let body = `Здравствуйте${event.displayName ? `, ${event.displayName}` : ""}!\n\n`;
  body += `Статус вашей заявки на платформе: «${statusLabel}».\n`;

  if (event.nextStatus === "ACTIVE") {
    body +=
      "Профиль активирован. Теперь вы можете принимать клиентов и создавать договоры.\n";
  } else if (event.nextStatus === "REJECTED") {
    body +=
      "Заявка отклонена. Свяжитесь с поддержкой платформы, если нужна помощь.\n";
  } else if (event.nextStatus === "SUSPENDED") {
    body += "Доступ временно ограничен модератором.\n";
  } else {
    body += "Заявка ожидает проверки.\n";
  }

  body += `\nID профиля: ${event.lawyerId}`;

  return {
    channel: event.email ? "email" : "log",
    subject,
    body,
    recipient: event.email,
  };
}

/**
 * Доставка уведомления.
 * Пока без внешних провайдеров оплаты/SMTP: пишем в лог.
 * Если задан TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID — дублируем админу.
 */
export async function deliverModerationNotification(
  notification: ModerationNotification,
  deps?: {
    log?: (msg: string) => void;
    sendTelegram?: (text: string) => Promise<void>;
  }
): Promise<{ delivered: boolean; channel: string }> {
  const log = deps?.log ?? console.log;
  log(
    `[moderation] ${notification.subject} → ${notification.recipient || "log-only"}\n${notification.body}`
  );

  if (deps?.sendTelegram) {
    await deps.sendTelegram(
      `${notification.subject}\n\n${notification.body}`
    );
    return { delivered: true, channel: "telegram+log" };
  }

  return {
    delivered: true,
    channel: notification.channel,
  };
}
