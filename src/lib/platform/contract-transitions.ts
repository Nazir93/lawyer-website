import type { ContractStatus } from "@prisma/client";

const LAWYER_ACTIONS = ["send", "mark_paid", "cancel"] as const;
const CLIENT_ACTIONS = ["sign", "confirm_paid"] as const;

export type LawyerContractAction = (typeof LAWYER_ACTIONS)[number];
export type ClientContractAction = (typeof CLIENT_ACTIONS)[number];

export function isLawyerContractAction(
  action: string
): action is LawyerContractAction {
  return (LAWYER_ACTIONS as readonly string[]).includes(action);
}

export function isClientContractAction(
  action: string
): action is ClientContractAction {
  return (CLIENT_ACTIONS as readonly string[]).includes(action);
}

/** Разрешённые переходы для юриста / админа */
export function canLawyerTransition(
  status: ContractStatus,
  action: LawyerContractAction
): boolean {
  if (action === "send") return status === "DRAFT";
  if (action === "cancel") {
    return status === "DRAFT" || status === "SENT" || status === "SIGNED";
  }
  if (action === "mark_paid") {
    return status === "DRAFT" || status === "SENT" || status === "SIGNED";
  }
  return false;
}

/** Разрешённые переходы для клиента */
export function canClientTransition(
  status: ContractStatus,
  action: ClientContractAction
): boolean {
  if (action === "sign") return status === "SENT";
  if (action === "confirm_paid") {
    return status === "SENT" || status === "SIGNED";
  }
  return false;
}

export function nextStatusForLawyerAction(
  action: LawyerContractAction
): ContractStatus {
  if (action === "send") return "SENT";
  if (action === "cancel") return "CANCELLED";
  return "PAID";
}
