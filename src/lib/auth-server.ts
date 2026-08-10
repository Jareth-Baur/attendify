import { headers } from "next/headers";

import { auth } from "@/lib/auth";

export const authorizedRoles = ["ADMIN", "TEACHER"] as const;

export type AuthorizedRole = (typeof authorizedRoles)[number];

export async function getCurrentSession() {
  return auth.api.getSession({
    headers: await headers(),
  });
}

export async function getCurrentUser() {
  const session = await getCurrentSession();

  return session?.user ?? null;
}

export async function getAuthorizedUser() {
  const user = await getCurrentUser();

  return user && hasRole(user.role, authorizedRoles) ? user : null;
}

export function hasRole(
  role: unknown,
  allowedRoles: readonly AuthorizedRole[],
) {
  return typeof role === "string" && allowedRoles.includes(role as AuthorizedRole);
}
