import { describe, expect, it } from "vitest";
import {
  buildLeadCreateData,
  canLawyerAccessLead,
  leadStatusLabel,
  normalizeLawyerQueryParam,
  parseLeadStatus,
  pickLawyerLeadSource,
  summarizeLeadStats,
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

describe("lawyer lead access and status", () => {
  it("parses lead status", () => {
    expect(parseLeadStatus("new")).toBe("NEW");
    expect(parseLeadStatus(" CONTACTED ")).toBe("CONTACTED");
    expect(parseLeadStatus("unknown")).toBeNull();
    expect(parseLeadStatus(null)).toBeNull();
  });

  it("checks ownership", () => {
    expect(canLawyerAccessLead("lp1", "lp1")).toBe(true);
    expect(canLawyerAccessLead("lp2", "lp1")).toBe(false);
    expect(canLawyerAccessLead(null, "lp1")).toBe(false);
  });

  it("labels and summarizes statuses", () => {
    expect(leadStatusLabel("NEW")).toBe("Новая");
    expect(
      summarizeLeadStats(["NEW", "NEW", "CONTACTED", "CONSULTATION", "DONE"])
    ).toEqual({
      total: 5,
      newCount: 2,
      inProgress: 2,
      done: 1,
    });
  });
});
