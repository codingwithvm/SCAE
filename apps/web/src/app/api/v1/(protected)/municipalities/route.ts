import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth/middleware";

const ALLOWED_ROLES = ["ADMIN", "MUNICIPAL_MANAGER"] as const;

export const POST = withAuth(
  async (_request, _) => {
    const municipalityRequestBody = await _request.json();
    const { name, state, ibgeCode } = municipalityRequestBody;

    if (!name || !state || !ibgeCode) {
      return NextResponse.json(
        { error: "name, state, and ibgeCode are required" },
        { status: 400 },
      );
    }

    if (typeof state !== "string" || state.length !== 2) {
      return NextResponse.json(
        { error: "state must be exactly 2 characters" },
        { status: 400 },
      );
    }

    try {
      const createdMunicipality = await prisma.municipality.create({
        data: {
          name,
          state: state.toUpperCase(),
          ibgeCode,
        },
      });

      return NextResponse.json(createdMunicipality, { status: 201 });
    } catch (createError: unknown) {
      if (
        typeof createError === "object" &&
        createError !== null &&
        "code" in createError &&
        (createError as { code: string }).code === "P2002"
      ) {
        return NextResponse.json(
          { error: "Municipality with this IBGE code already exists" },
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
    const stateFilter = requestUrl.searchParams.get("state");
    const searchFilter = requestUrl.searchParams.get("search");
    const pageParam = parseInt(requestUrl.searchParams.get("page") || "1", 10);
    const perPageParam = parseInt(
      requestUrl.searchParams.get("perPage") || "20",
      10,
    );

    const whereClause: Record<string, unknown> = { deletedAt: null };

    if (stateFilter) {
      whereClause.state = stateFilter.toUpperCase();
    }

    if (searchFilter) {
      whereClause.name = { contains: searchFilter, mode: "insensitive" };
    }

    const [municipalities, totalMunicipalities] = await Promise.all([
      prisma.municipality.findMany({
        where: whereClause,
        skip: (pageParam - 1) * perPageParam,
        take: perPageParam,
        orderBy: { name: "asc" },
      }),
      prisma.municipality.count({ where: whereClause }),
    ]);

    return NextResponse.json({
      data: municipalities,
      total: totalMunicipalities,
      page: pageParam,
      perPage: perPageParam,
    });
  },
  { allowedRoles: [...ALLOWED_ROLES] },
);
