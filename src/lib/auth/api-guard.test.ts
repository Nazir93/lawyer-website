import { describe, expect, it } from "vitest";
import { publicSiteSettings } from "@/lib/auth/api-guard";

describe("publicSiteSettings", () => {
  it("redacts telegram secrets", () => {
    const safe = publicSiteSettings({
      siteTitle: "Test",
      phone: "+7",
      telegramBotToken: "secret-token",
      telegramChatId: "123",
    });

    expect(safe).not.toHaveProperty("telegramBotToken");
    expect(safe).not.toHaveProperty("telegramChatId");
    expect(safe.hasTelegramBot).toBe(true);
    expect(safe.hasTelegramChat).toBe(true);
    expect(safe.siteTitle).toBe("Test");
  });
});
