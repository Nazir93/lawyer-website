import { describe, expect, it, vi } from "vitest";
import {
  buildModerationNotification,
  deliverModerationNotification,
} from "@/lib/platform/moderation";

describe("moderation notifications", () => {
  it("builds approval message for lawyer email", () => {
    const note = buildModerationNotification({
      lawyerId: "lp1",
      displayName: "Анна",
      email: "anna@example.com",
      previousStatus: "PENDING",
      nextStatus: "ACTIVE",
    });
    expect(note.channel).toBe("email");
    expect(note.recipient).toBe("anna@example.com");
    expect(note.subject).toContain("одобрен");
    expect(note.body).toContain("активирован");
  });

  it("falls back to log channel without email", () => {
    const note = buildModerationNotification({
      lawyerId: "lp2",
      displayName: "Иван",
      email: null,
      previousStatus: "PENDING",
      nextStatus: "REJECTED",
    });
    expect(note.channel).toBe("log");
    expect(note.body).toContain("отклон");
  });

  it("deliverModerationNotification logs and emails recipient", async () => {
    const log = vi.fn();
    const sendEmail = vi.fn(async () => ({ sent: true, provider: "custom" as const }));
    const result = await deliverModerationNotification(
      {
        channel: "email",
        subject: "test",
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
