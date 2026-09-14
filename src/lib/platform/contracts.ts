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
 * Отмечает договор оплаченным, пишет Payment(manual) и начисляет комиссии.
 * Идемпотентно по статусу PAID.
 */
export async function markContractPaid(params: {
  contractId: string;
  provider?: string;
}) {
  const contract = await prisma.contract.findUnique({
    where: { id: params.contractId },
  });

  if (!contract) {
    throw new Error("Contract not found");
  }

  if (contract.status === "PAID") {
    const commissions = await accrueCommissionsForContract(contract.id);
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

  const commissions = await accrueCommissionsForContract(contract.id);
  return { contract: updated, commissions, alreadyPaid: false as const };
}
