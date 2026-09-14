import { prisma } from "@/lib/db";
import { accrueCommissionsForContract } from "@/lib/platform/commission";

export {
  canClientTransition,
  canLawyerTransition,
  isClientContractAction,
  isLawyerContractAction,
  nextStatusForLawyerAction,
  type ClientContractAction,
  type LawyerContractAction,
} from "@/lib/platform/contract-transitions";

export { CONTRACT_STATUS_LABEL } from "@/lib/platform/contract-labels";

/**
 * Отмечает договор оплаченным и пишет Payment.
 * Комиссии начисляются только если accrueCommissions=true
 * (PSP webhook / подтверждение админа) — не по самозаявлению юриста/клиента.
 */
export async function markContractPaid(params: {
  contractId: string;
  provider?: string;
  accrueCommissions?: boolean;
}) {
  const accrue = params.accrueCommissions === true;
  const contract = await prisma.contract.findUnique({
    where: { id: params.contractId },
  });

  if (!contract) {
    throw new Error("Contract not found");
  }

  if (contract.status === "PAID") {
    const commissions = accrue
      ? await accrueCommissionsForContract(contract.id)
      : { created: 0, skipped: true as const, reason: "no_accrue" as const };
    return { contract, commissions, alreadyPaid: true as const };
  }

  if (contract.status === "CANCELLED" || contract.status === "REFUNDED") {
    throw new Error("Cannot pay cancelled or refunded contract");
  }

  const updated = await prisma.contract.update({
    where: { id: contract.id },
    data: {
      status: "PAID",
      paidAt: new Date(),
      signedAt: contract.signedAt ?? new Date(),
    },
  });

  await prisma.payment.create({
    data: {
      contractId: contract.id,
      amount: contract.amount,
      status: "SUCCEEDED",
      provider: params.provider ?? "manual",
      paidAt: new Date(),
    },
  });

  const commissions = accrue
    ? await accrueCommissionsForContract(updated.id)
    : { created: 0, skipped: true as const, reason: "manual_pending_review" as const };

  return { contract: updated, commissions, alreadyPaid: false as const };
}
