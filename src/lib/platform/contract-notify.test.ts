import { describe, expect, it, vi } from "vitest";
import {
  buildContractSentNotification,
  deliverContractSentNotification,
} from "@/lib/platform/contract-notify";

describe("contract-notify", () => {
  it("builds client notification with amount and billing link", () => {
    const n = buildContractSentNotification({
      clientName: "Иван",
      clientEmail: "ivan@example.com",
      lawyerDisplayName: "Адвокат Петров",
      contract: {
        id: "c1",
        title: "Консультация",
        amountKopecks: 5000000,
      },
    });

    expect(n.channel).toBe("email");
    expect(n.recipient).toBe("ivan@example.com");
    expect(n.subject).toContain("Консультация");
    expect(n.body).toContain("Иван");
    expect(n.body).toContain("Адвокат Петров");
    expect(n.body).toContain("50");
    expect(n.body).toContain("/dashboard/billing");
    expect(n.body).toContain("c1");
  });

  it("falls back to log channel without email", () => {
    const n = buildContractSentNotification({
      clientName: null,
      clientEmail: null,
      lawyerDisplayName: "Юрист",
      contract: { id: "c2", title: "Договор", amountKopecks: 10000 },
    });
    expect(n.channel).toBe("log");
    expect(n.recipient).toBeNull();
  });

  it("delivers email when recipient present", async () => {
    const sendEmail = vi.fn(async () => ({ sent: true, provider: "log" as const }));
    const n = buildContractSentNotification({
      clientName: "Анна",
      clientEmail: "anna@test.ru",
      lawyerDisplayName: "Юрист",
      contract: { id: "c3", title: "Услуга", amountKopecks: 100000 },
    });
    const result = await deliverContractSentNotification(n, {
      log: () => {},
      sendEmail,
    });
    expect(result.delivered).toBe(true);
    expect(result.channel).toContain("email");
    expect(sendEmail).toHaveBeenCalledOnce();
  });
});
