import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth/middleware";

const ALLOWED_ROLES = ["ADMIN", "MUNICIPAL_MANAGER", "SCHOOL_MANAGER"] as const;

export const POST = withAuth(
  async (_request, _decodedTokenPayload) => {
    const schoolRequestBody = await _request.json();
    const { municipalityId, name, inepCode } = schoolRequestBody;

    if (!municipalityId || !name || !inepCode) {
      return NextResponse.json(
        { error: "municipalityId, name, and inepCode are required" },
        { status: 400 },
      );
    }

    const existingMunicipality = await prisma.municipality.findFirst({
      where: { id: municipalityId, deletedAt: null },
    });

    if (!existingMunicipality) {
      return NextResponse.json(
        { error: "Municipality not found" },
        { status: 404 },
      );
    }

    try {
      const createdSchool = await prisma.school.create({
        data: { municipalityId, name, inepCode },
      });

      return NextResponse.json(createdSchool, { status: 201 });
    } catch (createError: unknown) {
      if (
        typeof createError === "object" &&
        createError !== null &&
        "code" in createError &&
        (createError as { code: string }).code === "P2002"
      ) {
        return NextResponse.json(
          { error: "School with this INEP code already exists" },
          { status: 409 },
        );
      }
      throw createError;
    }
  },
  { allowedRoles: [...ALLOWED_ROLES] },
);

export const GET = withAuth(
  async (listRequest) => {
    const requestUrl = new URL(listRequest.url);
    const municipalityIdFilter = requestUrl.searchParams.get("municipalityId");
    const searchFilter = requestUrl.searchParams.get("search");
    const pageParam = parseInt(requestUrl.searchParams.get("page") || "1", 10);
    const perPageParam = parseInt(
      requestUrl.searchParams.get("perPage") || "20",
      10,
    );

    const whereClause: Record<string, unknown> = { deletedAt: null };

    if (municipalityIdFilter) {
      whereClause.municipalityId = municipalityIdFilter;
    }

    if (searchFilter) {
      whereClause.name = { contains: searchFilter, mode: "insensitive" };
    }

    const [schools, totalSchools] = await Promise.all([
      prisma.school.findMany({
        where: whereClause,
        skip: (pageParam - 1) * perPageParam,
        take: perPageParam,
        orderBy: { name: "asc" },
      }),
      prisma.school.count({ where: whereClause }),
    ]);

    return NextResponse.json({
      data: schools,
      total: totalSchools,
      page: pageParam,
      perPage: perPageParam,
    });
  },
  { allowedRoles: [...ALLOWED_ROLES] },
);
