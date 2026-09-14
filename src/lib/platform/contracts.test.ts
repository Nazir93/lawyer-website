import { describe, expect, it } from "vitest";
import {
  canClientTransition,
  canLawyerTransition,
  nextStatusForLawyerAction,
} from "@/lib/platform/contract-transitions";

describe("contract transitions", () => {
  it("lawyer can send only drafts", () => {
    expect(canLawyerTransition("DRAFT", "send")).toBe(true);
    expect(canLawyerTransition("SENT", "send")).toBe(false);
    expect(nextStatusForLawyerAction("send")).toBe("SENT");
  });

  it("lawyer can mark paid from draft/sent/signed", () => {
    expect(canLawyerTransition("DRAFT", "mark_paid")).toBe(true);
    expect(canLawyerTransition("SENT", "mark_paid")).toBe(true);
    expect(canLawyerTransition("SIGNED", "mark_paid")).toBe(true);
    expect(canLawyerTransition("PAID", "mark_paid")).toBe(false);
    expect(canLawyerTransition("CANCELLED", "mark_paid")).toBe(false);
  });

  it("client can sign sent and confirm paid when sent/signed", () => {
    expect(canClientTransition("SENT", "sign")).toBe(true);
    expect(canClientTransition("DRAFT", "sign")).toBe(false);
    expect(canClientTransition("SIGNED", "confirm_paid")).toBe(true);
    expect(canClientTransition("SENT", "confirm_paid")).toBe(true);
    expect(canClientTransition("DRAFT", "confirm_paid")).toBe(false);
  });
});
