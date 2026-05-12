import "server-only";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth/jwt";
import type { Role } from "@/generated/prisma/client";

interface DecodedTokenPayload {
  userId: string;
  role: Role;
  iat: number;
  exp: number;
}

interface RouteAuthorizationOptions {
  allowedRoles?: Role[];
}

type ProtectedRouteHandler = (
  request: Request,
  decodedTokenPayload: DecodedTokenPayload,
  routeContext?: unknown,
) => Promise<Response>;

export function withAuth(
  protectedRouteHandler: ProtectedRouteHandler,
  authorizationOptions?: RouteAuthorizationOptions,
) {
  return async (
    incomingRequest: Request,
    routeContext?: unknown,
  ): Promise<Response> => {
    const authorizationHeader = incomingRequest.headers.get("Authorization");

    let bearerToken: string | undefined;

    if (authorizationHeader && authorizationHeader.startsWith("Bearer ")) {
      bearerToken = authorizationHeader.slice(7);
    } else {
      const cookieStore = await cookies();
      bearerToken = cookieStore.get("auth_token")?.value;
    }

    if (!bearerToken) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    let decodedTokenPayload: DecodedTokenPayload;

    try {
      decodedTokenPayload = verifyToken(bearerToken) as DecodedTokenPayload;
    } catch {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 },
      );
    }

    if (
      authorizationOptions?.allowedRoles &&
      !authorizationOptions.allowedRoles.includes(decodedTokenPayload.role)
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return protectedRouteHandler(
      incomingRequest,
      decodedTokenPayload,
      routeContext,
    );
  };
}
