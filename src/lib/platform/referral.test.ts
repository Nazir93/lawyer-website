import { describe, expect, it } from "vitest";
import {
  generateReferralCode,
  slugifyName,
} from "@/lib/platform/referral-code";

describe("referral-code helpers", () => {
  it("generateReferralCode uses prefix and 6-char body", () => {
    const code = generateReferralCode("LAW");
    expect(code).toMatch(/^LAW-[A-Z2-9]{6}$/);
  });

  it("slugifyName transliterates russian names", () => {
    expect(slugifyName("Иван Петров")).toBe("ivan-petrov");
    expect(slugifyName("  А.  ")).toBe("a");
  });

  it("slugifyName falls back for empty input", () => {
    expect(slugifyName("!!!")).toBe("lawyer");
  });
});
