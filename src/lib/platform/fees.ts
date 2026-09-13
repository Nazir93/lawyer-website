/** Конфиг комиссий платформы (без зависимости от Prisma). */
export type PlatformFeeConfig = {
  platformFeePercent: number;
  referralLevel1Percent: number;
  referralLevel2Percent: number;
  maxReferralDepth: number;
  minContractAmount: number;
};

export const DEFAULT_PLATFORM_FEES: PlatformFeeConfig = {
  platformFeePercent: 10,
  referralLevel1Percent: 5,
  referralLevel2Percent: 2,
  maxReferralDepth: 2,
  minContractAmount: 0,
};

export type ReferrerLevel = {
  id: string;
  name: string | null;
  level: number;
};

export type CommissionPlanRow = {
  beneficiaryId: string;
  type: "PLATFORM" | "REFERRAL_L1" | "REFERRAL_L2";
  level: number;
  percent: number;
  amount: number;
  note: string;
};

/** Доля в копейках (округление до целых копеек). */
export function percentOf(amountKopecks: number, percent: number): number {
  return Math.round((amountKopecks * percent) / 100);
}

/**
 * Чистый расчёт комиссий без БД.
 * Если сумма ниже минимума — возвращает [].
 */
export function buildCommissionPlan(input: {
  amountKopecks: number;
  settings: PlatformFeeConfig;
  platformBeneficiaryId: string;
  referrers: ReferrerLevel[];
}): CommissionPlanRow[] {
  const { amountKopecks, settings, platformBeneficiaryId, referrers } = input;

  if (amountKopecks < settings.minContractAmount) {
    return [];
  }

  const rows: CommissionPlanRow[] = [
    {
      beneficiaryId: platformBeneficiaryId,
      type: "PLATFORM",
      level: 0,
      percent: settings.platformFeePercent,
      amount: percentOf(amountKopecks, settings.platformFeePercent),
      note: "Комиссия платформы с договора",
    },
  ];

  for (const ref of referrers) {
    if (ref.level === 1 && settings.maxReferralDepth >= 1) {
      rows.push({
        beneficiaryId: ref.id,
        type: "REFERRAL_L1",
        level: 1,
        percent: settings.referralLevel1Percent,
        amount: percentOf(amountKopecks, settings.referralLevel1Percent),
        note: "Реферальное вознаграждение 1 уровня",
      });
    } else if (ref.level === 2 && settings.maxReferralDepth >= 2) {
      rows.push({
        beneficiaryId: ref.id,
        type: "REFERRAL_L2",
        level: 2,
        percent: settings.referralLevel2Percent,
        amount: percentOf(amountKopecks, settings.referralLevel2Percent),
        note: "Реферальное вознаграждение 2 уровня",
      });
    }
  }

  return rows;
}

export type PlatformFeeInput = Partial<PlatformFeeConfig>;

export type FeeValidationResult =
  | { ok: true; value: PlatformFeeConfig }
  | { ok: false; error: string };

/** Валидация настроек комиссий платформы. */
export function validatePlatformFeeInput(
  input: PlatformFeeInput,
  current: PlatformFeeConfig
): FeeValidationResult {
  const next: PlatformFeeConfig = {
    platformFeePercent:
      input.platformFeePercent ?? current.platformFeePercent,
    referralLevel1Percent:
      input.referralLevel1Percent ?? current.referralLevel1Percent,
    referralLevel2Percent:
      input.referralLevel2Percent ?? current.referralLevel2Percent,
    maxReferralDepth: input.maxReferralDepth ?? current.maxReferralDepth,
    minContractAmount: input.minContractAmount ?? current.minContractAmount,
  };

  const percents = [
    ["platformFeePercent", next.platformFeePercent],
    ["referralLevel1Percent", next.referralLevel1Percent],
    ["referralLevel2Percent", next.referralLevel2Percent],
  ] as const;

  for (const [key, value] of percents) {
    if (typeof value !== "number" || Number.isNaN(value)) {
      return { ok: false, error: `${key}: ожидается число` };
    }
    if (value < 0 || value > 100) {
      return { ok: false, error: `${key}: должно быть от 0 до 100` };
    }
  }

  if (
    !Number.isInteger(next.maxReferralDepth) ||
    next.maxReferralDepth < 0 ||
    next.maxReferralDepth > 2
  ) {
    return {
      ok: false,
      error: "maxReferralDepth: допустимо 0, 1 или 2",
    };
  }

  if (
    !Number.isInteger(next.minContractAmount) ||
    next.minContractAmount < 0
  ) {
    return {
      ok: false,
      error: "minContractAmount: целое число ≥ 0 (копейки)",
    };
  }

  const referralTotal =
    (next.maxReferralDepth >= 1 ? next.referralLevel1Percent : 0) +
    (next.maxReferralDepth >= 2 ? next.referralLevel2Percent : 0);

  if (next.platformFeePercent + referralTotal > 100) {
    return {
      ok: false,
      error: "Сумма долей платформы и рефералов не может превышать 100%",
    };
  }

  return { ok: true, value: next };
}

/** Публичное представление юриста (без внутренних полей). */
export type PublicLawyer = {
  id: string;
  displayName: string;
  slug: string;
  bio: string | null;
  specialization: string | null;
  city: string | null;
  photoUrl: string | null;
  verifiedAt: string | null;
};

export function toPublicLawyer(profile: {
  id: string;
  displayName: string;
  slug: string;
  bio: string | null;
  specialization: string | null;
  city: string | null;
  photoUrl: string | null;
  phone?: string | null;
  barNumber?: string | null;
  status: string;
  verifiedAt: Date | null;
  userId?: string;
}): PublicLawyer | null {
  if (profile.status !== "ACTIVE") return null;
  return {
    id: profile.id,
    displayName: profile.displayName,
    slug: profile.slug,
    bio: profile.bio,
    specialization: profile.specialization,
    city: profile.city,
    photoUrl: profile.photoUrl,
    verifiedAt: profile.verifiedAt
      ? profile.verifiedAt.toISOString()
      : null,
  };
}
