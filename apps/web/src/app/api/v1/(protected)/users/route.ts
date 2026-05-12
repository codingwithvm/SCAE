import { NextResponse } from "next/server";
import type { Role } from "@/generated/prisma/client";
import { withAuth } from "@/lib/auth/middleware";
import { hashPassword } from "@/lib/auth/password";
import { prisma } from "@/lib/prisma";

const ALLOWED_ROLES = ["ADMIN", "SCHOOL_MANAGER"] as const;
const VALID_ROLES: Role[] = [
  "STUDENT",
  "TEACHER",
  "SCHOOL_MANAGER",
  "MUNICIPAL_MANAGER",
  "ADMIN",
];

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

export const POST = withAuth(
  async (createRequest, decodedTokenPayload) => {
    const createRequestBody = await createRequest.json();
    const {
      role,
      name,
      email,
      registrationNumber,
      birthDate,
      password,
      schoolId,
      municipalityId,
    } = createRequestBody;

    if (!role || !name) {
      return NextResponse.json(
        { error: "role and name are required" },
        { status: 400 },
      );
    }

    if (!isValidRole(role)) {
      return NextResponse.json(
        { error: "role must be a valid system role" },
        { status: 400 },
      );
    }

    if (
      decodedTokenPayload.role === "SCHOOL_MANAGER" &&
      role !== "TEACHER" &&
      role !== "STUDENT"
    ) {
      return NextResponse.json(
        { error: "School managers can only create teachers and students" },
        { status: 403 },
      );
    }

    let resolvedSchoolId: string | null = schoolId ?? null;
    let resolvedMunicipalityId: string | null = municipalityId ?? null;

    if (decodedTokenPayload.role === "SCHOOL_MANAGER") {
      const manager = await prisma.user.findUnique({
        where: { id: decodedTokenPayload.userId },
        select: {
          schoolId: true,
          school: { select: { municipalityId: true } },
        },
      });

      resolvedSchoolId = manager?.schoolId ?? null;
      resolvedMunicipalityId = manager?.school?.municipalityId ?? null;
    }

    let parsedBirthDate: Date | null = null;
    let passwordHash: string | null = null;

    if (role === "STUDENT") {
      if (!registrationNumber || !birthDate) {
        return NextResponse.json(
          {
            error: "registrationNumber and birthDate are required for students",
          },
          { status: 400 },
        );
      }

      parsedBirthDate = parseBirthDate(birthDate);

      if (!parsedBirthDate) {
        return NextResponse.json(
          { error: "birthDate must be a valid date" },
          { status: 400 },
        );
      }
    } else {
      if (!email || !password) {
        return NextResponse.json(
          { error: "email and password are required for non-student users" },
          { status: 400 },
        );
      }

      passwordHash = await hashPassword(password);
    }

    if (resolvedSchoolId) {
      const existingSchool = await ensureSchoolExists(resolvedSchoolId);

      if (!existingSchool) {
        return NextResponse.json(
          { error: "School not found" },
          { status: 404 },
        );
      }
    }

    if (resolvedMunicipalityId) {
      const existingMunicipality = await ensureMunicipalityExists(
        resolvedMunicipalityId,
      );

      if (!existingMunicipality) {
        return NextResponse.json(
          { error: "Municipality not found" },
          { status: 404 },
        );
      }
    }

    try {
      const createdUser = await prisma.user.create({
        data: {
          role,
          name,
          email: email ?? null,
          registrationNumber: registrationNumber ?? null,
          birthDate: parsedBirthDate,
          passwordHash,
          schoolId: resolvedSchoolId,
          municipalityId: resolvedMunicipalityId,
        },
      });

      return NextResponse.json(sanitizeUserRecord(createdUser), {
        status: 201,
      });
    } catch (createError: unknown) {
      if (
        typeof createError === "object" &&
        createError !== null &&
        "code" in createError &&
        (createError as { code: string }).code === "P2002"
      ) {
        const uniqueFieldTarget =
          typeof createError === "object" &&
          createError !== null &&
          "meta" in createError &&
          typeof (createError as { meta?: { target?: string[] } }).meta ===
            "object" &&
          (createError as { meta?: { target?: string[] } }).meta !== null
            ? (createError as { meta?: { target?: string[] } }).meta?.target
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

      throw createError;
    }
  },
  { allowedRoles: [...ALLOWED_ROLES] },
);

export const GET = withAuth(
  async (listRequest, decodedTokenPayload) => {
    const requestUrl = new URL(listRequest.url);
    const roleFilter = requestUrl.searchParams.get("role");
    const schoolIdFilter = requestUrl.searchParams.get("schoolId");
    const classIdFilter = requestUrl.searchParams.get("classId");
    const pageParam = parseInt(requestUrl.searchParams.get("page") || "1", 10);
    const perPageParam = parseInt(
      requestUrl.searchParams.get("perPage") || "20",
      10,
    );

    const whereClause: Record<string, unknown> = { deletedAt: null };

    if (decodedTokenPayload.role === "SCHOOL_MANAGER") {
      const manager = await prisma.user.findUnique({
        where: { id: decodedTokenPayload.userId },
        select: { schoolId: true },
      });
      if (manager?.schoolId) {
        whereClause.schoolId = manager.schoolId;
      }
    } else if (decodedTokenPayload.role === "MUNICIPAL_MANAGER") {
      const manager = await prisma.user.findUnique({
        where: { id: decodedTokenPayload.userId },
        select: { municipalityId: true },
      });
      if (manager?.municipalityId) {
        whereClause.school = { municipalityId: manager.municipalityId };
      }
    }

    if (roleFilter && isValidRole(roleFilter)) {
      whereClause.role = roleFilter;
    }

    if (schoolIdFilter) {
      whereClause.schoolId = schoolIdFilter;
    }

    if (classIdFilter) {
      whereClause.OR = [
        { taughtClasses: { some: { classId: classIdFilter } } },
        { enrolledClasses: { some: { classId: classIdFilter } } },
      ];
    }

    const userSelection = {
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
    };

    const [users, totalUsers] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        select: userSelection,
        skip: (pageParam - 1) * perPageParam,
        take: perPageParam,
        orderBy: { name: "asc" },
      }),
      prisma.user.count({ where: whereClause }),
    ]);

    const safeUsers = users.map((userRecord) => sanitizeUserRecord(userRecord));

    return NextResponse.json({
      data: safeUsers,
      total: totalUsers,
      page: pageParam,
      perPage: perPageParam,
    });
  },
  { allowedRoles: ["ADMIN", "SCHOOL_MANAGER", "MUNICIPAL_MANAGER"] },
);
