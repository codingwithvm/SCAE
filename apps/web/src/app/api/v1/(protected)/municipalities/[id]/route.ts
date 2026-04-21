import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth/middleware";

const ALLOWED_ROLES = ["ADMIN", "MUNICIPAL_MANAGER"] as const;

interface MunicipalityRouteContext {
  params: Promise<{ id: string }>;
}

export const GET = withAuth(
  async (_request, _decodedTokenPayload, routeContext) => {
    const { id: municipalityId } = await (
      routeContext as unknown as MunicipalityRouteContext
    ).params;

    const foundMunicipality = await prisma.municipality.findFirst({
      where: { id: municipalityId, deletedAt: null },
    });

    if (!foundMunicipality) {
      return NextResponse.json(
        { error: "Municipality not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(foundMunicipality);
  },
  { allowedRoles: [...ALLOWED_ROLES] },
);

export const PUT = withAuth(
  async (updateRequest, _decodedTokenPayload, routeContext) => {
    const { id: municipalityId } = await (
      routeContext as unknown as MunicipalityRouteContext
    ).params;

    const existingMunicipality = await prisma.municipality.findFirst({
      where: { id: municipalityId, deletedAt: null },
    });

    if (!existingMunicipality) {
      return NextResponse.json(
        { error: "Municipality not found" },
        { status: 404 },
      );
    }

    const updateRequestBody = await updateRequest.json();
    const { name, state, ibgeCode } = updateRequestBody;

    if (!name && !state && !ibgeCode) {
      return NextResponse.json(
        { error: "At least one field (name, state, or ibgeCode) is required" },
        { status: 400 },
      );
    }

    if (state && (typeof state !== "string" || state.length !== 2)) {
      return NextResponse.json(
        { error: "state must be exactly 2 characters" },
        { status: 400 },
      );
    }

    const updateData: Record<string, string> = {};
    if (name) updateData.name = name;
    if (state) updateData.state = state.toUpperCase();
    if (ibgeCode) updateData.ibgeCode = ibgeCode;

    try {
      const updatedMunicipality = await prisma.municipality.update({
        where: { id: municipalityId },
        data: updateData,
      });

      return NextResponse.json(updatedMunicipality);
    } catch (updateError: unknown) {
      if (
        typeof updateError === "object" &&
        updateError !== null &&
        "code" in updateError &&
        (updateError as { code: string }).code === "P2002"
      ) {
        return NextResponse.json(
          { error: "Municipality with this IBGE code already exists" },
          { status: 409 },
        );
      }
      throw updateError;
    }
  },
  { allowedRoles: [...ALLOWED_ROLES] },
);

export const DELETE = withAuth(
  async (_request, _decodedTokenPayload, routeContext) => {
    const { id: municipalityId } = await (
      routeContext as unknown as MunicipalityRouteContext
    ).params;

    const existingMunicipality = await prisma.municipality.findFirst({
      where: { id: municipalityId, deletedAt: null },
    });

    if (!existingMunicipality) {
      return NextResponse.json(
        { error: "Municipality not found" },
        { status: 404 },
      );
    }

    await prisma.municipality.update({
      where: { id: municipalityId },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ message: "Municipality deleted" });
  },
  { allowedRoles: [...ALLOWED_ROLES] },
);
