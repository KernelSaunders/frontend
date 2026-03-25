import type { UserRoleResponse } from "@/lib/api";

export type UserRoleName = UserRoleResponse["role"];

/**
 * Role gating for UI elements
 * We use this to only show elems if role is present
 * Consumer < Verifier < Maintainer
 * 
 * Maintainer is able to do everything verifier can do
 * 
 */

const ROLE_LEVELS: Record<UserRoleName, number> = {
  consumer: 0,
  verifier: 1,
  maintainer: 2,
};

export function hasRequiredRole(role: string | null, requiredRole: UserRoleName) {
  if (role === null || !(role in ROLE_LEVELS)) {
    return false;
  }

  return ROLE_LEVELS[role as UserRoleName] >= ROLE_LEVELS[requiredRole];
}

export function hasVerifierAccess(role: string | null) {
  return hasRequiredRole(role, "verifier");
}

export function hasMaintainerAccess(role: string | null) {
  return hasRequiredRole(role, "maintainer");
}
