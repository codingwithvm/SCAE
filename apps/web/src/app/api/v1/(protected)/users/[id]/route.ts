import { NextResponse } from "next/server";
import type { Role } from "@/generated/prisma/client";
import { withAuth } from "@/lib/auth/middleware";
import { hashPassword } from "@/lib/auth/password";
import { prisma } from "@/lib/prisma";

const ALLOWED_ROLES = ["ADMIN"] as const;
const VALID_ROLES: Role[] = [
  "STUDENT",
  "TEACHER",
  "SCHOOL_MANAGER",
  "MUNICIPAL_MANAGER",
  "ADMIN",
];

interface UserRouteContext {
  params: Promise<{ id: string }>;
}

function isValidRole(roleValue: unknown): roleValue is Role {
  return (
    typeof roleValue === "string" && VALID_ROLES.includes(roleValue as Role)
  );
}

function parseBirthDate(birthDateValue: string) {
  const parsedBirthDate = new Date(birthDateValue);

  if (Number.isNaN(parsedBirthDate.getTime())) {
    return null;
  }

  return parsedBirthDate;
}

function sanitizeUserRecord(userRecord: Record<string, unknown>) {
  const { passwordHash: _passwordHash, ...safeUserRecord } = userRecord;
  return safeUserRecord;
}

async function ensureSchoolExists(schoolId: string) {
  const existingSchool = await prisma.school.findFirst({
    where: { id: schoolId, deletedAt: null },
  });

  return existingSchool;
}

async function ensureMunicipalityExists(municipalityId: string) {
  const existingMunicipality = await prisma.municipality.findFirst({
    where: { id: municipalityId, deletedAt: null },
  });

  return existingMunicipality;
}

export const GET = withAuth(
  async (_request, _decodedTokenPayload, routeContext) => {
    const { id: userId } = await (routeContext as unknown as UserRouteContext)
      .params;

    const foundUser = await prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
      select: {
        id: true,
        role: true,
        name: true,
        email: true,
        registrationNumber: true,
        birthDate: true,
        schoolId: true,
        municipalityId: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
        passwordHash: false,
      },
    });

    if (!foundUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(sanitizeUserRecord(foundUser));
  },
  { allowedRoles: [...ALLOWED_ROLES] },
);

export const PUT = withAuth(
  async (updateRequest, _decodedTokenPayload, routeContext) => {
    const { id: userId } = await (routeContext as unknown as UserRouteContext)
      .params;

    const existingUser = await prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updateRequestBody = await updateRequest.json();
    const {
      role,
      name,
      email,
      registrationNumber,
      birthDate,
      password,
      schoolId,
      municipalityId,
    } = updateRequestBody;

    if (
      role === undefined &&
      !name &&
      email === undefined &&
      registrationNumber === undefined &&
      birthDate === undefined &&
      password === undefined &&
      schoolId === undefined &&
      municipalityId === undefined
    ) {
      return NextResponse.json(
        {
          error:
            "At least one field (role, name, email, registrationNumber, birthDate, password, schoolId, or municipalityId) is required",
        },
        { status: 400 },
      );
    }

    if (role !== undefined && !isValidRole(role)) {
      return NextResponse.json(
        { error: "role must be a valid system role" },
        { status: 400 },
      );
    }

    if (birthDate !== undefined) {
      const parsedBirthDate = parseBirthDate(birthDate);

      if (!parsedBirthDate) {
        return NextResponse.json(
          { error: "birthDate must be a valid date" },
          { status: 400 },
        );
      }
    }

    if (schoolId) {
      const existingSchool = await ensureSchoolExists(schoolId);

      if (!existingSchool) {
        return NextResponse.json(
          { error: "School not found" },
          { status: 404 },
        );
      }
    }

    if (municipalityId) {
      const existingMunicipality =
        await ensureMunicipalityExists(municipalityId);

      if (!existingMunicipality) {
        return NextResponse.json(
          { error: "Municipality not found" },
          { status: 404 },
        );
      }
    }

    const updateData: Record<string, unknown> = {};

    if (role !== undefined) updateData.role = role;
    if (name) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (registrationNumber !== undefined) {
      updateData.registrationNumber = registrationNumber;
    }
    if (birthDate !== undefined) {
      updateData.birthDate = parseBirthDate(birthDate);
    }
    if (schoolId !== undefined) updateData.schoolId = schoolId;
    if (municipalityId !== undefined)
      updateData.municipalityId = municipalityId;

    if (password !== undefined) {
      updateData.passwordHash = await hashPassword(password);
    }

    try {
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: updateData,
      });

      return NextResponse.json(sanitizeUserRecord(updatedUser));
    } catch (updateError: unknown) {
      if (
        typeof updateError === "object" &&
        updateError !== null &&
        "code" in updateError &&
        (updateError as { code: string }).code === "P2002"
      ) {
        const uniqueFieldTarget =
          typeof updateError === "object" &&
          updateError !== null &&
          "meta" in updateError &&
          typeof (updateError as { meta?: { target?: string[] } }).meta ===
            "object" &&
          (updateError as { meta?: { target?: string[] } }).meta !== null
            ? (updateError as { meta?: { target?: string[] } }).meta?.target
            : undefined;

        if (uniqueFieldTarget?.includes("registrationNumber")) {
          return NextResponse.json(
            { error: "User with this registration number already exists" },
            { status: 409 },
          );
        }

        return NextResponse.json(
          { error: "User with this email already exists" },
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
    const { id: userId } = await (routeContext as unknown as UserRouteContext)
      .params;

    const existingUser = await prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await prisma.user.update({
      where: { id: userId },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ message: "User deleted" });
  },
  { allowedRoles: [...ALLOWED_ROLES] },
);
