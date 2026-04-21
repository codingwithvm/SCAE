import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth/middleware";

const ALLOWED_ROLES = ["ADMIN", "MUNICIPAL_MANAGER", "SCHOOL_MANAGER"] as const;

interface SchoolRouteContext {
  params: Promise<{ id: string }>;
}

export const GET = withAuth(
  async (_request, _decodedTokenPayload, routeContext) => {
    const { id: schoolId } = await (
      routeContext as unknown as SchoolRouteContext
    ).params;

    const foundSchool = await prisma.school.findFirst({
      where: { id: schoolId, deletedAt: null },
    });

    if (!foundSchool) {
      return NextResponse.json({ error: "School not found" }, { status: 404 });
    }

    return NextResponse.json(foundSchool);
  },
  { allowedRoles: [...ALLOWED_ROLES] },
);

export const PUT = withAuth(
  async (updateRequest, _decodedTokenPayload, routeContext) => {
    const { id: schoolId } = await (
      routeContext as unknown as SchoolRouteContext
    ).params;

    const existingSchool = await prisma.school.findFirst({
      where: { id: schoolId, deletedAt: null },
    });

    if (!existingSchool) {
      return NextResponse.json({ error: "School not found" }, { status: 404 });
    }

    const updateRequestBody = await updateRequest.json();
    const { name, inepCode, municipalityId } = updateRequestBody;

    if (!name && !inepCode && !municipalityId) {
      return NextResponse.json(
        {
          error:
            "At least one field (name, inepCode, or municipalityId) is required",
        },
        { status: 400 },
      );
    }

    if (municipalityId) {
      const existingMunicipality = await prisma.municipality.findFirst({
        where: { id: municipalityId, deletedAt: null },
      });

      if (!existingMunicipality) {
        return NextResponse.json(
          { error: "Municipality not found" },
          { status: 404 },
        );
      }
    }

    const updateData: Record<string, string> = {};
    if (name) updateData.name = name;
    if (inepCode) updateData.inepCode = inepCode;
    if (municipalityId) updateData.municipalityId = municipalityId;

    try {
      const updatedSchool = await prisma.school.update({
        where: { id: schoolId },
        data: updateData,
      });

      return NextResponse.json(updatedSchool);
    } catch (updateError: unknown) {
      if (
        typeof updateError === "object" &&
        updateError !== null &&
        "code" in updateError &&
        (updateError as { code: string }).code === "P2002"
      ) {
        return NextResponse.json(
          { error: "School with this INEP code already exists" },
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
    const { id: schoolId } = await (
      routeContext as unknown as SchoolRouteContext
    ).params;

    const existingSchool = await prisma.school.findFirst({
      where: { id: schoolId, deletedAt: null },
    });

    if (!existingSchool) {
      return NextResponse.json({ error: "School not found" }, { status: 404 });
    }

    await prisma.school.update({
      where: { id: schoolId },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ message: "School deleted" });
  },
  { allowedRoles: [...ALLOWED_ROLES] },
);
