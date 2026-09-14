/** Резолв юриста для заявки по slug / id (чистая логика + тип результата). */

export type LawyerRefInput = {
  lawyerSlug?: string | null;
  lawyerId?: string | null;
};

export type ResolvedLawyerRef = {
  lawyerId: string;
  lawyerSlug: string;
  displayName: string;
};

export const LEAD_STATUSES = [
  "NEW",
  "CONTACTED",
  "CONSULTATION",
  "DONE",
  "REJECTED",
] as const;

export type LeadStatusValue = (typeof LEAD_STATUSES)[number];

const LEAD_STATUS_LABELS: Record<LeadStatusValue, string> = {
  NEW: "Новая",
  CONTACTED: "Связались",
  CONSULTATION: "Консультация",
  DONE: "Завершена",
  REJECTED: "Отклонена",
};

export function normalizeLawyerQueryParam(
  value: string | null | undefined
): string | null {
  if (!value || typeof value !== "string") return null;
  const trimmed = value.trim().toLowerCase();
  if (!trimmed) return null;
  // slug: letters, digits, hyphen
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(trimmed)) return null;
  return trimmed;
}

export function pickLawyerLeadSource(input: {
  lawyerId: string | null;
  explicitSource?: string | null;
}): string {
  if (input.lawyerId) return "lawyer_profile";
  return input.explicitSource?.trim() || "website";
}

export function parseLeadStatus(value: unknown): LeadStatusValue | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toUpperCase();
  return (LEAD_STATUSES as readonly string[]).includes(normalized)
    ? (normalized as LeadStatusValue)
    : null;
}

export function leadStatusLabel(status: LeadStatusValue): string {
  return LEAD_STATUS_LABELS[status];
}

/** Юрист видит только заявки своего профиля. */
export function canLawyerAccessLead(
  leadLawyerId: string | null | undefined,
  profileId: string
): boolean {
  return Boolean(leadLawyerId && leadLawyerId === profileId);
}

export function summarizeLeadStats(
  statuses: Array<LeadStatusValue | string>
): {
  total: number;
  newCount: number;
  inProgress: number;
  done: number;
} {
  let newCount = 0;
  let inProgress = 0;
  let done = 0;
  for (const raw of statuses) {
    const status = parseLeadStatus(raw);
    if (!status) continue;
    if (status === "NEW") newCount += 1;
    else if (status === "CONTACTED" || status === "CONSULTATION")
      inProgress += 1;
    else if (status === "DONE") done += 1;
  }
  return { total: statuses.length, newCount, inProgress, done };
}

export function buildLeadCreateData(input: {
  name: string;
  phone: string;
  email?: string | null;
  service?: string | null;
  message?: string | null;
  consent?: boolean;
  lawyerId?: string | null;
  referredById?: string | null;
  source?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
}) {
  const lawyerId = input.lawyerId || null;
  return {
    name: input.name.trim(),
    phone: input.phone.trim(),
    email: input.email?.trim() || null,
    service: input.service?.trim() || null,
    message: input.message?.trim() || null,
    status: "NEW" as const,
    source: pickLawyerLeadSource({
      lawyerId,
      explicitSource: input.source,
    }),
    utmSource: input.utmSource || null,
    utmMedium: input.utmMedium || null,
    utmCampaign: input.utmCampaign || null,
    consentGiven: Boolean(input.consent),
    consentDate: new Date(),
    lawyerId,
    referredById: input.referredById || null,
  };
}
