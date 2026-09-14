import { describe, expect, it, vi } from "vitest";
import {
  buildLeadAssignedNotification,
  deliverLeadAssignedNotification,
} from "@/lib/platform/lead-notify";

describe("lead assigned notifications", () => {
  it("builds message for lawyer email", () => {
    const note = buildLeadAssignedNotification({
      lawyerDisplayName: "Анна",
      lawyerEmail: "anna@example.com",
      lead: {
        id: "lead1",
        name: "Игорь",
        phone: "+7999",
        email: "igor@ex.com",
        service: "Консультация",
        message: "Нужна помощь",
      },
    });
    expect(note.channel).toBe("email");
    expect(note.recipient).toBe("anna@example.com");
    expect(note.subject).toContain("Игорь");
    expect(note.body).toContain("+7999");
    expect(note.body).toContain("/lawyer/leads");
  });

  it("falls back to log without email", () => {
    const note = buildLeadAssignedNotification({
      lawyerDisplayName: "Анна",
      lawyerEmail: null,
      lead: { id: "l2", name: "Клиент", phone: "1" },
    });
    expect(note.channel).toBe("log");
  });

  it("deliverLeadAssignedNotification logs and emails", async () => {
    const log = vi.fn();
    const sendEmail = vi.fn(async () => ({ sent: true, provider: "custom" as const }));
    const result = await deliverLeadAssignedNotification(
      {
        channel: "email",
        subject: "Новая заявка",
        body: "body",
        recipient: "anna@example.com",
      },
      { log, sendEmail }
    );
    expect(result.delivered).toBe(true);
    expect(result.channel).toContain("email");
    expect(log).toHaveBeenCalledOnce();
    expect(sendEmail).toHaveBeenCalledOnce();
  });
});
