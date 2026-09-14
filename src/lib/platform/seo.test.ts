import { describe, expect, it } from "vitest";
import {
  buildLawyerProfileSeo,
  buildLawyersIndexSeo,
} from "@/lib/platform/seo";

describe("lawyer SEO", () => {
  it("builds profile title with specialization and city", () => {
    const seo = buildLawyerProfileSeo({
      displayName: "Анна Смирнова",
      specialization: "Семейное право",
      city: "Казань",
      bio: "Помогаю в сложных семейных спорах более 10 лет.",
      slug: "anna-smirnova",
    });

    expect(seo.title).toContain("Анна Смирнова");
    expect(seo.title).toContain("Семейное право");
    expect(seo.title).toContain("Казань");
    expect(seo.canonicalPath).toBe("/lawyers/anna-smirnova");
    expect(seo.description.length).toBeGreaterThan(20);
    expect(seo.description.length).toBeLessThanOrEqual(160);
  });

  it("falls back when bio is empty", () => {
    const seo = buildLawyerProfileSeo({
      displayName: "Иван",
      specialization: null,
      city: null,
      bio: null,
      slug: "ivan",
    });
    expect(seo.description).toContain("Иван");
    expect(seo.canonicalPath).toBe("/lawyers/ivan");
  });

  it("builds index seo", () => {
    const seo = buildLawyersIndexSeo(12);
    expect(seo.title).toContain("12");
    expect(seo.canonicalPath).toBe("/lawyers");
  });
});
