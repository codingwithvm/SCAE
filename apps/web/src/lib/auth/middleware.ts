import { NextResponse } from "next/server";
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
) => Promise<Response>;

export function withAuth(
  protectedRouteHandler: ProtectedRouteHandler,
  authorizationOptions?: RouteAuthorizationOptions,
) {
  return async (incomingRequest: Request): Promise<Response> => {
    const authorizationHeader =
      incomingRequest.headers.get("Authorization");

    if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const bearerToken = authorizationHeader.slice(7);

    let decodedTokenPayload: DecodedTokenPayload;

    try {
      decodedTokenPayload = verifyToken(
        bearerToken,
      ) as DecodedTokenPayload;
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

    return protectedRouteHandler(incomingRequest, decodedTokenPayload);
  };
}
