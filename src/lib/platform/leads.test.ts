import { describe, expect, it } from "vitest";
import {
  buildLeadCreateData,
  normalizeLawyerQueryParam,
  pickLawyerLeadSource,
} from "@/lib/platform/leads";

describe("lead lawyer binding", () => {
  it("normalizes valid lawyer slug", () => {
    expect(normalizeLawyerQueryParam(" Anna-Smirnova ")).toBe("anna-smirnova");
    expect(normalizeLawyerQueryParam("BAD SLUG")).toBeNull();
    expect(normalizeLawyerQueryParam("")).toBeNull();
    expect(normalizeLawyerQueryParam(null)).toBeNull();
  });

  it("sets source to lawyer_profile when lawyer bound", () => {
    expect(
      pickLawyerLeadSource({ lawyerId: "lp1", explicitSource: "website" })
    ).toBe("lawyer_profile");
    expect(pickLawyerLeadSource({ lawyerId: null })).toBe("website");
  });

  it("buildLeadCreateData attaches lawyerId", () => {
    const data = buildLeadCreateData({
      name: " Клиент ",
      phone: " +7999 ",
      lawyerId: "lawyer-1",
      consent: true,
    });
    expect(data.lawyerId).toBe("lawyer-1");
    expect(data.source).toBe("lawyer_profile");
    expect(data.name).toBe("Клиент");
    expect(data.status).toBe("NEW");
    expect(data.consentGiven).toBe(true);
  });
});
