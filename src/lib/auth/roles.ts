import type { UserRole } from "@prisma/client";

export function isStaffRole(role: UserRole | string | null | undefined): boolean {
  return role === "ADMIN" || role === "LAWYER";
}

export function isPlatformAdmin(role: UserRole | string | null | undefined): boolean {
  return role === "ADMIN";
}

export function isLawyer(role: UserRole | string | null | undefined): boolean {
  return role === "LAWYER";
}

/** Куда отправить пользователя после входа */
export function getPostLoginPath(role: UserRole | string | null | undefined): string {
  if (role === "ADMIN") return "/gasanov";
  if (role === "LAWYER") return "/lawyer";
  return "/dashboard";
}
