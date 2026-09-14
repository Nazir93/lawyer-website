import { describe, expect, it } from "vitest";
import { stripHtml } from "@/lib/security/sanitize";

describe("stripHtml", () => {
  it("removes tags and scripts", () => {
    expect(stripHtml('<p>Hi</p><script>alert(1)</script>')).toBe("Hi");
  });

  it("handles empty", () => {
    expect(stripHtml(null)).toBe("");
  });
});
