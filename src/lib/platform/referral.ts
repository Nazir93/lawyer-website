import { prisma } from "@/lib/db";

const REFERRAL_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** Короткий реферальный код, например REF-A3K9M2 */
export function generateReferralCode(prefix = "REF"): string {
  let body = "";
  for (let i = 0; i < 6; i++) {
    body += REFERRAL_ALPHABET[Math.floor(Math.random() * REFERRAL_ALPHABET.length)];
  }
  return `${prefix}-${body}`;
}

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

export function slugifyName(name: string): string {
  const map: Record<string, string> = {
    а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh",
    з: "z", и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o",
    п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "ts",
    ч: "ch", ш: "sh", щ: "sch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu",
    я: "ya",
  };

  return (
    name
      .toLowerCase()
      .split("")
      .map((ch) => map[ch] ?? ch)
      .join("")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || "lawyer"
  );
}

export async function createUniqueLawyerSlug(displayName: string): Promise<string> {
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

