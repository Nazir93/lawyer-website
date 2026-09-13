import { prisma } from "@/lib/db";
import { getReferrerChain } from "@/lib/platform/referral";
import {
  buildCommissionPlan,
  DEFAULT_PLATFORM_FEES,
  type PlatformFeeConfig,
} from "@/lib/platform/fees";
import type { Prisma } from "@prisma/client";

export type { PlatformFeeConfig };
export { DEFAULT_PLATFORM_FEES };

export async function getPlatformSettings(): Promise<PlatformFeeConfig> {
  const existing = await prisma.platformSettings.findFirst({
    orderBy: { createdAt: "asc" },
  });

  if (existing) {
    return {
      platformFeePercent: existing.platformFeePercent,
      referralLevel1Percent: existing.referralLevel1Percent,
      referralLevel2Percent: existing.referralLevel2Percent,
      maxReferralDepth: existing.maxReferralDepth,
      minContractAmount: existing.minContractAmount,
    };
  }

  const created = await prisma.platformSettings.create({
    data: DEFAULT_PLATFORM_FEES,
  });
  return {
    platformFeePercent: created.platformFeePercent,
    referralLevel1Percent: created.referralLevel1Percent,
    referralLevel2Percent: created.referralLevel2Percent,
    maxReferralDepth: created.maxReferralDepth,
    minContractAmount: created.minContractAmount,
  };
}

/**
 * Начисляет комиссии после оплаты договора.
 * Платформа + до 2 уровней рефералов (affiliate).
 * Идемпотентно.
 */
export async function accrueCommissionsForContract(contractId: string) {
  const contract = await prisma.contract.findUnique({
    where: { id: contractId },
    include: {
      commissions: { select: { id: true } },
      lawyer: { select: { userId: true } },
    },
  });

  if (!contract) throw new Error("Contract not found");
  if (contract.status !== "PAID") {
    throw new Error("Commissions accrue only for PAID contracts");
  }
  if (contract.commissions.length > 0) {
    return { created: 0, skipped: true as const };
  }

  const settings = await getPlatformSettings();

  const platformAdmin = await prisma.user.findFirst({
    where: { role: "ADMIN" },
    select: { id: true },
    orderBy: { createdAt: "asc" },
  });
  const platformBeneficiaryId = platformAdmin?.id ?? contract.lawyer.userId;

  let levels = await getReferrerChain(
    contract.clientId,
    settings.maxReferralDepth
  );

  if (
    contract.referredById &&
    !levels.some((r) => r.id === contract.referredById)
  ) {
    const direct = await prisma.user.findUnique({
      where: { id: contract.referredById },
      select: { id: true, name: true },
    });
    if (direct) {
      levels = [
        { id: direct.id, name: direct.name, level: 1 },
        ...levels.map((r) => ({ ...r, level: r.level + 1 })),
      ].slice(0, settings.maxReferralDepth);
    }
  }

  const plan = buildCommissionPlan({
    amountKopecks: contract.amount,
    settings,
    platformBeneficiaryId,
    referrers: levels,
  });

  if (plan.length === 0) {
    return {
      created: 0,
      skipped: true as const,
      reason: "below_minimum" as const,
    };
  }

  const rows: Prisma.CommissionCreateManyInput[] = plan.map((row) => ({
    contractId,
    beneficiaryId: row.beneficiaryId,
    type: row.type,
    level: row.level,
    percent: row.percent,
    amount: row.amount,
    status: "PENDING",
    note: row.note,
  }));

  await prisma.commission.createMany({ data: rows });
  return { created: rows.length, skipped: false as const };
}

export { formatRubFromKopecks, rubToKopecks } from "@/lib/platform/money";

export const getPlatformFeeConfig = getPlatformSettings;
export const accrueCommissions = accrueCommissionsForContract;
