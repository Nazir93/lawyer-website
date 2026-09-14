import {
  sendPlatformEmail,
  type EmailMessage,
  type EmailSendResult,
} from "@/lib/platform/email";
import { formatRubFromKopecks } from "@/lib/platform/money";

export type ContractSentEvent = {
  clientName: string | null;
  clientEmail: string | null;
  lawyerDisplayName: string;
  contract: {
    id: string;
    title: string;
    amountKopecks: number;
  };
  billingPath?: string;
};

export type ContractSentNotification = {
  channel: "log" | "email";
  subject: string;
  body: string;
  recipient: string | null;
};

/** Текст уведомления клиенту об отправке договора (без отправки). */
export function buildContractSentNotification(
  event: ContractSentEvent
): ContractSentNotification {
  const amount = formatRubFromKopecks(event.contract.amountKopecks);
  const billing = event.billingPath || "/dashboard/billing";
  const subject = `Договор от юриста: ${event.contract.title}`;

  let body = `Здравствуйте${
    event.clientName ? `, ${event.clientName}` : ""
  }!\n\n`;
  body += `${event.lawyerDisplayName} отправил(а) вам договор на подпись и оплату.\n\n`;
  body += `Договор: ${event.contract.title}\n`;
  body += `Сумма: ${amount}\n`;
  body += `\nОткрыть в кабинете: ${billing}\n`;
  body += `ID договора: ${event.contract.id}`;

  return {
    channel: event.clientEmail ? "email" : "log",
    subject,
    body,
    recipient: event.clientEmail,
  };
}

export async function deliverContractSentNotification(
  notification: ContractSentNotification,
  deps?: {
    log?: (msg: string) => void;
    sendEmail?: (message: EmailMessage) => Promise<EmailSendResult | void>;
  }
): Promise<{ delivered: boolean; channel: string }> {
  const log = deps?.log ?? console.log;
  log(
    `[contract] ${notification.subject} → ${notification.recipient || "log-only"}\n${notification.body}`
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
