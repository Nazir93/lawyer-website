import { describe, expect, it, beforeEach } from "vitest";
import {
  checkRateLimit,
  resetRateLimitStore,
} from "@/lib/security/rate-limit";

describe("checkRateLimit", () => {
  beforeEach(() => {
    resetRateLimitStore();
  });

  it("allows up to limit within window", () => {
    const key = "t1";
    expect(checkRateLimit({ key, limit: 3, windowMs: 60_000 }).allowed).toBe(
      true
    );
    expect(checkRateLimit({ key, limit: 3, windowMs: 60_000 }).allowed).toBe(
      true
    );
    expect(checkRateLimit({ key, limit: 3, windowMs: 60_000 }).allowed).toBe(
      true
    );
    expect(checkRateLimit({ key, limit: 3, windowMs: 60_000 }).allowed).toBe(
      false
    );
  });

  it("resets after window", () => {
    const key = "t2";
    const t0 = 1_000_000;
    checkRateLimit({ key, limit: 1, windowMs: 1000, now: t0 });
    expect(
      checkRateLimit({ key, limit: 1, windowMs: 1000, now: t0 + 500 }).allowed
    ).toBe(false);
    expect(
      checkRateLimit({ key, limit: 1, windowMs: 1000, now: t0 + 1000 }).allowed
    ).toBe(true);
  });
});
