import { describe, expect, it } from "vitest";
import {
  DEFAULT_PLATFORM_FEES,
  buildCommissionPlan,
  percentOf,
  toPublicLawyer,
  validatePlatformFeeInput,
} from "@/lib/platform/fees";

describe("percentOf", () => {
  it("rounds to nearest kopeck", () => {
    expect(percentOf(10000, 10)).toBe(1000);
    expect(percentOf(10001, 10)).toBe(1000);
    expect(percentOf(3333, 10)).toBe(333);
  });
});

describe("buildCommissionPlan", () => {
  const settings = { ...DEFAULT_PLATFORM_FEES };

  it("returns platform + L1 + L2 for full chain", () => {
    const plan = buildCommissionPlan({
      amountKopecks: 100_000_00,
      settings,
      platformBeneficiaryId: "admin",
      referrers: [
        { id: "r1", name: "A", level: 1 },
        { id: "r2", name: "B", level: 2 },
      ],
    });

    expect(plan).toHaveLength(3);
    expect(plan[0]).toMatchObject({
      type: "PLATFORM",
      amount: 1_000_000,
      beneficiaryId: "admin",
    });
    expect(plan[1]).toMatchObject({ type: "REFERRAL_L1", amount: 500_000 });
    expect(plan[2]).toMatchObject({ type: "REFERRAL_L2", amount: 200_000 });
  });

  it("skips when amount below minimum", () => {
    const plan = buildCommissionPlan({
      amountKopecks: 100,
      settings: { ...settings, minContractAmount: 1000 },
      platformBeneficiaryId: "admin",
      referrers: [{ id: "r1", name: "A", level: 1 }],
    });
    expect(plan).toEqual([]);
  });

  it("respects maxReferralDepth=1", () => {
    const plan = buildCommissionPlan({
      amountKopecks: 10_000_00,
      settings: { ...settings, maxReferralDepth: 1 },
      platformBeneficiaryId: "admin",
      referrers: [
        { id: "r1", name: "A", level: 1 },
        { id: "r2", name: "B", level: 2 },
      ],
    });
    expect(plan.map((r) => r.type)).toEqual(["PLATFORM", "REFERRAL_L1"]);
  });
});

describe("validatePlatformFeeInput", () => {
  it("accepts valid partial update", () => {
    const result = validatePlatformFeeInput(
      { platformFeePercent: 12 },
      DEFAULT_PLATFORM_FEES
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.platformFeePercent).toBe(12);
      expect(result.value.referralLevel1Percent).toBe(5);
    }
  });

  it("rejects percent > 100", () => {
    const result = validatePlatformFeeInput(
      { platformFeePercent: 101 },
      DEFAULT_PLATFORM_FEES
    );
    expect(result.ok).toBe(false);
  });

  it("rejects total over 100%", () => {
    const result = validatePlatformFeeInput(
      {
        platformFeePercent: 90,
        referralLevel1Percent: 8,
        referralLevel2Percent: 5,
      },
      DEFAULT_PLATFORM_FEES
    );
    expect(result.ok).toBe(false);
  });

  it("rejects invalid maxReferralDepth", () => {
    const result = validatePlatformFeeInput(
      { maxReferralDepth: 3 },
      DEFAULT_PLATFORM_FEES
    );
    expect(result.ok).toBe(false);
  });
});

describe("toPublicLawyer", () => {
  const base = {
    id: "1",
    displayName: "Иван",
    slug: "ivan",
    bio: "bio",
    specialization: "Семейное",
    city: "Москва",
    photoUrl: null,
    phone: "+7",
    barNumber: "123",
    verifiedAt: new Date("2024-01-01T00:00:00.000Z"),
    userId: "u1",
  };

  it("hides non-active lawyers", () => {
    expect(toPublicLawyer({ ...base, status: "PENDING" })).toBeNull();
    expect(toPublicLawyer({ ...base, status: "SUSPENDED" })).toBeNull();
  });

  it("maps active lawyer without private fields", () => {
    const pub = toPublicLawyer({ ...base, status: "ACTIVE" });
    expect(pub).toEqual({
      id: "1",
      displayName: "Иван",
      slug: "ivan",
      bio: "bio",
      specialization: "Семейное",
      city: "Москва",
      photoUrl: null,
      verifiedAt: "2024-01-01T00:00:00.000Z",
    });
    expect(pub).not.toHaveProperty("phone");
    expect(pub).not.toHaveProperty("barNumber");
    expect(pub).not.toHaveProperty("userId");
  });
});
