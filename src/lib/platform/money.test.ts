import { describe, expect, it } from "vitest";
import { formatRubFromKopecks, rubToKopecks } from "@/lib/platform/money";

describe("money", () => {
  it("rubToKopecks converts rubles to kopecks", () => {
    expect(rubToKopecks(100)).toBe(10000);
    expect(rubToKopecks(50.5)).toBe(5050);
    expect(rubToKopecks(0)).toBe(0);
  });

  it("formatRubFromKopecks formats currency", () => {
    const label = formatRubFromKopecks(100000);
    expect(label).toContain("1");
    expect(label).toMatch(/₽|RUB/);
  });
});
