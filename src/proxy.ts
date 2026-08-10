import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { hasRole, authorizedRoles } from "@/lib/auth-server";

export async function proxy(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session || !hasRole(session.user.role, authorizedRoles)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
    matcher: [
        "/dashboard/:path*",
    ],
};
