import { describe, expect, it } from "vitest";
import { slugifyName } from "@/lib/platform/referral-code";
import { toPublicLawyer } from "@/lib/platform/fees";

/** Правила публичного каталога юристов (без БД). */
function isListedInCatalog(status: string): boolean {
  return status === "ACTIVE";
}

function buildLawyerPath(slug: string): string {
  return `/lawyers/${slug}`;
}

describe("public lawyers catalog rules", () => {
  it("lists only ACTIVE lawyers", () => {
    expect(isListedInCatalog("ACTIVE")).toBe(true);
    expect(isListedInCatalog("PENDING")).toBe(false);
    expect(isListedInCatalog("REJECTED")).toBe(false);
  });

  it("builds public profile path from slug", () => {
    expect(buildLawyerPath(slugifyName("Анна Смирнова"))).toBe(
      "/lawyers/anna-smirnova"
    );
  });

  it("toPublicLawyer strips private fields for catalog cards", () => {
    const card = toPublicLawyer({
      id: "p1",
      displayName: "Анна",
      slug: "anna",
      bio: "Текст",
      specialization: "Трудовое",
      city: "Казань",
      photoUrl: null,
      phone: "+7999",
      barNumber: "77/1",
      status: "ACTIVE",
      verifiedAt: null,
      userId: "secret",
    });
    expect(card?.slug).toBe("anna");
    expect(card).not.toHaveProperty("phone");
    expect(card).not.toHaveProperty("barNumber");
  });
});
