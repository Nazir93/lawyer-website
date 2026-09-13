import { prisma } from "@/lib/db";
import { getReferrerChain } from "@/lib/platform/referral";
import type { CommissionType, Prisma } from "@prisma/client";

export type PlatformFeeConfig = {
  platformFeePercent: number;
  referralLevel1Percent: number;
  referralLevel2Percent: number;
  maxReferralDepth: number;
  minContractAmount: number;
};

const DEFAULTS: PlatformFeeConfig = {
  platformFeePercent: 10,
  referralLevel1Percent: 5,
  referralLevel2Percent: 2,
  maxReferralDepth: 2,
  minContractAmount: 0,
};

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

  const created = await prisma.platformSettings.create({ data: DEFAULTS });
  return {
    platformFeePercent: created.platformFeePercent,
    referralLevel1Percent: created.referralLevel1Percent,
    referralLevel2Percent: created.referralLevel2Percent,
    maxReferralDepth: created.maxReferralDepth,
    minContractAmount: created.minContractAmount,
  };
}

function percentOf(amount: number, percent: number): number {
  return Math.round((amount * percent) / 100);
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
  if (contract.amount < settings.minContractAmount) {
    return { created: 0, skipped: true as const, reason: "below_minimum" as const };
  }

  const rows: Prisma.CommissionCreateManyInput[] = [];

  const platformAdmin = await prisma.user.findFirst({
    where: { role: "ADMIN" },
    select: { id: true },
    orderBy: { createdAt: "asc" },
  });
  const platformBeneficiaryId = platformAdmin?.id ?? contract.lawyer.userId;

  rows.push({
    contractId,
    beneficiaryId: platformBeneficiaryId,
    type: "PLATFORM" satisfies CommissionType,
    level: 0,
    percent: settings.platformFeePercent,
    amount: percentOf(contract.amount, settings.platformFeePercent),
    status: "PENDING",
    note: "Комиссия платформы с договора",
  });

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

  for (const ref of levels) {
    if (ref.level === 1) {
      rows.push({
        contractId,
        beneficiaryId: ref.id,
        type: "REFERRAL_L1",
        level: 1,
        percent: settings.referralLevel1Percent,
        amount: percentOf(contract.amount, settings.referralLevel1Percent),
        status: "PENDING",
        note: "Реферальное вознаграждение 1 уровня",
      });
    } else if (ref.level === 2) {
      rows.push({
        contractId,
        beneficiaryId: ref.id,
        type: "REFERRAL_L2",
        level: 2,
        percent: settings.referralLevel2Percent,
        amount: percentOf(contract.amount, settings.referralLevel2Percent),
        status: "PENDING",
        note: "Реферальное вознаграждение 2 уровня",
      });
    }
  }

  await prisma.commission.createMany({ data: rows });
  return { created: rows.length, skipped: false as const };
}

export { formatRubFromKopecks, rubToKopecks } from "@/lib/platform/money";

// Aliases for older call sites
export const getPlatformFeeConfig = getPlatformSettings;
export const accrueCommissions = accrueCommissionsForContract;
