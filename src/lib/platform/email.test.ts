import { describe, expect, it, vi } from "vitest";
import { sendPlatformEmail } from "@/lib/platform/email";

describe("sendPlatformEmail", () => {
  it("uses custom send when provided", async () => {
    const send = vi.fn(async () => {});
    const result = await sendPlatformEmail(
      { to: "a@b.c", subject: "Hi", text: "Body" },
      { send }
    );
    expect(result).toEqual({ sent: true, provider: "custom" });
    expect(send).toHaveBeenCalledOnce();
  });

  it("falls back to log without providers", async () => {
    const log = vi.fn();
    const result = await sendPlatformEmail(
      { to: "a@b.c", subject: "Hi", text: "Body" },
      { log, env: {} }
    );
    expect(result.provider).toBe("log");
    expect(result.sent).toBe(true);
    expect(log).toHaveBeenCalledOnce();
  });

  it("sends via resend when API key set", async () => {
    const fetchFn = vi.fn(async () => new Response("{}", { status: 200 }));
    const result = await sendPlatformEmail(
      { to: "a@b.c", subject: "Hi", text: "Body" },
      {
        env: { RESEND_API_KEY: "re_test", EMAIL_FROM: "from@test.ru" },
        fetchFn: fetchFn as unknown as typeof fetch,
      }
    );
    expect(result).toEqual({ sent: true, provider: "resend" });
    expect(fetchFn).toHaveBeenCalledOnce();
  });

  it("skips empty recipient", async () => {
    const log = vi.fn();
    const result = await sendPlatformEmail(
      { to: "  ", subject: "Hi", text: "Body" },
      { log, env: {} }
    );
    expect(result.sent).toBe(false);
  });
});
