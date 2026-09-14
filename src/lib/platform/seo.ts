import type { PublicLawyer } from "@/lib/platform/fees";

export type LawyerSeoInput = {
  displayName: string;
  specialization: string | null;
  city: string | null;
  bio: string | null;
  slug: string;
};

export type PageSeo = {
  title: string;
  description: string;
  canonicalPath: string;
};

/** SEO для карточки юриста */
export function buildLawyerProfileSeo(lawyer: LawyerSeoInput): PageSeo {
  const specialization = lawyer.specialization?.trim();
  const city = lawyer.city?.trim();

  const titleParts = [lawyer.displayName, "юрист"];
  if (specialization) titleParts.push(specialization);
  if (city) titleParts.push(city);

  const title = `${titleParts.join(" — ")} | Платформа`;

  const bio = lawyer.bio?.replace(/\s+/g, " ").trim();
  let description =
    bio && bio.length > 0
      ? bio.slice(0, 160)
      : `${lawyer.displayName} — юрист на платформе`;
  if (specialization) {
    description = `${description}. Специализация: ${specialization}`.slice(
      0,
      160
    );
  }
  if (city && description.length < 140) {
    description = `${description}. ${city}`.slice(0, 160);
  }

  return {
    title,
    description,
    canonicalPath: `/lawyers/${lawyer.slug}`,
  };
}

/** SEO для каталога */
export function buildLawyersIndexSeo(count?: number): PageSeo {
  const countPart =
    typeof count === "number" && count > 0 ? ` · ${count} специалистов` : "";
  return {
    title: `Юристы платформы${countPart}`,
    description:
      "Каталог проверенных юристов платформы. Выберите специалиста и оставьте заявку.",
    canonicalPath: "/lawyers",
  };
}

export function seoFromPublicLawyer(lawyer: PublicLawyer): PageSeo {
  return buildLawyerProfileSeo(lawyer);
}
