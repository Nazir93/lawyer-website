import { prisma } from "@/lib/db";
import { generateReferralCode, slugifyName } from "@/lib/platform/referral-code";

export { generateReferralCode, slugifyName } from "@/lib/platform/referral-code";

export async function createUniqueReferralCode(
  role: "CLIENT" | "LAWYER" | "ADMIN" = "CLIENT"
): Promise<string> {
  const prefix = role === "LAWYER" ? "LAW" : "REF";

  for (let attempt = 0; attempt < 12; attempt++) {
    const code = generateReferralCode(prefix);
    const existing = await prisma.user.findUnique({
      where: { referralCode: code },
      select: { id: true },
    });
    if (!existing) return code;
  }

  return `${prefix}-${Date.now().toString(36).toUpperCase()}`;
}

export async function createUniqueLawyerSlug(
  displayName: string
): Promise<string> {
  const base = slugifyName(displayName) || "lawyer";

  for (let i = 0; i < 20; i++) {
    const slug = i === 0 ? base : `${base}-${i + 1}`;
    const existing = await prisma.lawyerProfile.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!existing) return slug;
  }

  return `${base}-${Date.now().toString(36)}`;
}

/** Находит пригласившего по коду (без учёта регистра). */
export async function findReferrerByCode(code: string | null | undefined) {
  if (!code || typeof code !== "string") return null;
  const normalized = code.trim().toUpperCase();
  if (!normalized) return null;

  return prisma.user.findFirst({
    where: { referralCode: { equals: normalized, mode: "insensitive" } },
    select: {
      id: true,
      name: true,
      role: true,
      referralCode: true,
    },
  });
}

/** Цепочка рефереров вверх: [L1, L2, ...] до maxDepth */
export async function getReferrerChain(userId: string, maxDepth = 2) {
  const chain: { id: string; name: string | null; level: number }[] = [];
  let currentId: string | null = userId;

  for (let level = 1; level <= maxDepth; level++) {
    if (!currentId) break;
    const row: {
      referredById: string | null;
      referredBy: { id: string; name: string | null } | null;
    } | null = await prisma.user.findUnique({
      where: { id: currentId },
      select: {
        referredById: true,
        referredBy: { select: { id: true, name: true } },
      },
    });
    if (!row?.referredBy) break;
    chain.push({
      id: row.referredBy.id,
      name: row.referredBy.name,
      level,
    });
    currentId = row.referredBy.id;
  }

  return chain;
}
