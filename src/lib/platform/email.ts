/** Отправка email платформы: log / Resend / webhook (без SMTP-зависимости). */

export type EmailMessage = {
  to: string;
  subject: string;
  text: string;
};

export type EmailSendResult = {
  sent: boolean;
  provider: "log" | "resend" | "webhook" | "custom";
};

export type EmailEnv = {
  RESEND_API_KEY?: string;
  EMAIL_FROM?: string;
  EMAIL_WEBHOOK_URL?: string;
};

function readEnv(override?: EmailEnv): EmailEnv {
  return {
    RESEND_API_KEY: override?.RESEND_API_KEY ?? process.env.RESEND_API_KEY,
    EMAIL_FROM:
      override?.EMAIL_FROM ??
      process.env.EMAIL_FROM ??
      "noreply@localhost",
    EMAIL_WEBHOOK_URL:
      override?.EMAIL_WEBHOOK_URL ?? process.env.EMAIL_WEBHOOK_URL,
  };
}

/**
 * Доставка письма.
 * Приоритет: custom send → Resend → webhook → log.
 */
export async function sendPlatformEmail(
  message: EmailMessage,
  deps?: {
    log?: (msg: string) => void;
    send?: (message: EmailMessage) => Promise<void>;
    env?: EmailEnv;
    fetchFn?: typeof fetch;
  }
): Promise<EmailSendResult> {
  const log = deps?.log ?? console.log;
  const env = readEnv(deps?.env);
  const fetchFn = deps?.fetchFn ?? fetch;

  if (!message.to?.trim()) {
    log(`[email] skip: empty recipient · ${message.subject}`);
    return { sent: false, provider: "log" };
  }

  if (deps?.send) {
    await deps.send(message);
    return { sent: true, provider: "custom" };
  }

  if (env.RESEND_API_KEY) {
    const res = await fetchFn("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: env.EMAIL_FROM,
        to: [message.to],
        subject: message.subject,
        text: message.text,
      }),
    });
    if (!res.ok) {
      const errText = await res.text();
      log(`[email] resend error: ${res.status} ${errText}`);
      return { sent: false, provider: "resend" };
    }
    return { sent: true, provider: "resend" };
  }

  if (env.EMAIL_WEBHOOK_URL) {
    const res = await fetchFn(env.EMAIL_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: message.to,
        subject: message.subject,
        text: message.text,
      }),
    });
    if (!res.ok) {
      const errText = await res.text();
      log(`[email] webhook error: ${res.status} ${errText}`);
      return { sent: false, provider: "webhook" };
    }
    return { sent: true, provider: "webhook" };
  }

  log(
    `[email:log] to=${message.to} subject=${message.subject}\n${message.text}`
  );
  return { sent: true, provider: "log" };
}
