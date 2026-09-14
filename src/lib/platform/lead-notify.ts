import {
  sendPlatformEmail,
  type EmailMessage,
  type EmailSendResult,
} from "@/lib/platform/email";

export type LeadAssignedEvent = {
  lawyerDisplayName: string;
  lawyerEmail: string | null;
  lead: {
    id: string;
    name: string;
    phone: string;
    email?: string | null;
    service?: string | null;
    message?: string | null;
  };
  cabinetPath?: string;
};

export type LeadAssignedNotification = {
  channel: "log" | "email";
  subject: string;
  body: string;
  recipient: string | null;
};

/** Текст уведомления юристу о новой заявке (без отправки). */
export function buildLeadAssignedNotification(
  event: LeadAssignedEvent
): LeadAssignedNotification {
  const cabinet = event.cabinetPath || "/lawyer/leads";
  const subject = `Новая заявка: ${event.lead.name}`;

  let body = `Здравствуйте${
    event.lawyerDisplayName ? `, ${event.lawyerDisplayName}` : ""
  }!\n\n`;
  body += "На вас назначена новая заявка с сайта.\n\n";
  body += `Клиент: ${event.lead.name}\n`;
  body += `Телефон: ${event.lead.phone}\n`;
  if (event.lead.email) body += `Email: ${event.lead.email}\n`;
  if (event.lead.service) body += `Услуга: ${event.lead.service}\n`;
  if (event.lead.message) body += `\nСообщение:\n${event.lead.message}\n`;
  body += `\nОткрыть в кабинете: ${cabinet}\n`;
  body += `ID заявки: ${event.lead.id}`;

  return {
    channel: event.lawyerEmail ? "email" : "log",
    subject,
    body,
    recipient: event.lawyerEmail,
  };
}

export async function deliverLeadAssignedNotification(
  notification: LeadAssignedNotification,
  deps?: {
    log?: (msg: string) => void;
    sendEmail?: (message: EmailMessage) => Promise<EmailSendResult | void>;
  }
): Promise<{ delivered: boolean; channel: string }> {
  const log = deps?.log ?? console.log;
  log(
    `[lead] ${notification.subject} → ${notification.recipient || "log-only"}\n${notification.body}`
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

  return {
    delivered: true,
    channel: channels.join("+"),
  };
}
