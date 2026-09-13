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
