import {
  sendPlatformEmail,
  type EmailMessage,
  type EmailSendResult,
} from "@/lib/platform/email";

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
 * Лог всегда. Email — если есть recipient (Resend / webhook / log).
 * Telegram — опционально через deps.sendTelegram.
 */
export async function deliverModerationNotification(
  notification: ModerationNotification,
  deps?: {
    log?: (msg: string) => void;
    sendTelegram?: (text: string) => Promise<void>;
    sendEmail?: (message: EmailMessage) => Promise<EmailSendResult | void>;
  }
): Promise<{ delivered: boolean; channel: string }> {
  const log = deps?.log ?? console.log;
  log(
    `[moderation] ${notification.subject} → ${notification.recipient || "log-only"}\n${notification.body}`
  );

  const channels: string[] = ["log"];

  if (notification.recipient) {
    const send =
      deps?.sendEmail ??
      ((message: EmailMessage) => sendPlatformEmail(message, { log }));
    await send({
      to: notification.recipient,
      subject: notification.subject,
      text: notification.body,
    });
    channels.push("email");
  }

  if (deps?.sendTelegram) {
    await deps.sendTelegram(
      `${notification.subject}\n\n${notification.body}`
    );
    channels.push("telegram");
  }

  return {
    delivered: true,
    channel: channels.join("+"),
  };
}
