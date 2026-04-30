import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth/middleware";

const VALID_INSTRUMENTS = ["MCEES_1A4", "MCEES_5A9", "MCEES_PROF", "MEES_PROF"];
const ALLOWED_ROLES = ["ADMIN", "MUNICIPAL_MANAGER", "SCHOOL_MANAGER"] as const;
const SIX_MONTHS_IN_MS = 180 * 24 * 60 * 60 * 1000;

export const POST = withAuth(
  async (request, decodedTokenPayload) => {
    const requestBody = await request.json();
    const { userId, instrument, classId } = requestBody;

    if (!userId || !instrument) {
      return NextResponse.json(
        { error: "userId and instrument are required" },
        { status: 400 },
      );
    }

    if (!VALID_INSTRUMENTS.includes(instrument)) {
      return NextResponse.json(
        { error: "Invalid instrument" },
        { status: 400 },
      );
    }

    const targetUser = await prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (classId) {
      const targetClass = await prisma.class.findFirst({
        where: { id: classId, deletedAt: null },
      });

      if (!targetClass) {
        return NextResponse.json({ error: "Class not found" }, { status: 404 });
      }
    }

    const existingActiveRelease = await prisma.assessmentRelease.findFirst({
      where: {
        userId,
        instrument,
        state: { in: ["PENDING", "IN_USE"] },
      },
    });

    if (existingActiveRelease) {
      return NextResponse.json(
        { error: "User already has an active release for this instrument" },
        { status: 409 },
      );
    }

    const lastCompletedAssessment = await prisma.assessment.findFirst({
      where: {
        userId,
        instrument,
        state: "COMPLETE",
      },
      orderBy: { completedAt: "desc" },
    });

    if (lastCompletedAssessment?.completedAt) {
      const timeSinceLastAssessment =
        Date.now() - lastCompletedAssessment.completedAt.getTime();

      if (timeSinceLastAssessment < SIX_MONTHS_IN_MS) {
        return NextResponse.json(
          {
            error:
              "Minimum 6 months required between assessments of the same instrument",
          },
          { status: 409 },
        );
      }
    }

    const newRelease = await prisma.assessmentRelease.create({
      data: {
        userId,
        instrument,
        releasedById: decodedTokenPayload.userId,
        classId: classId || null,
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      },
    });

    return NextResponse.json(newRelease, { status: 201 });
  },
  { allowedRoles: [...ALLOWED_ROLES] },
);

export const GET = withAuth(
  async (request) => {
    const requestUrl = new URL(request.url);
    const classIdFilter = requestUrl.searchParams.get("classId");
    const stateFilter = requestUrl.searchParams.get("state");
    const instrumentFilter = requestUrl.searchParams.get("instrument");
    const pageParam = parseInt(requestUrl.searchParams.get("page") || "1", 10);
    const perPageParam = parseInt(
      requestUrl.searchParams.get("perPage") || "20",
      10,
    );

    const whereClause: Record<string, unknown> = {};

    if (classIdFilter) {
      whereClause.classId = classIdFilter;
    }

    if (stateFilter) {
      whereClause.state = stateFilter;
    }

    if (instrumentFilter) {
      whereClause.instrument = instrumentFilter;
    }

    const [releases, totalReleases] = await Promise.all([
      prisma.assessmentRelease.findMany({
        where: whereClause,
        include: {
          user: { select: { id: true, name: true, role: true } },
        },
        skip: (pageParam - 1) * perPageParam,
        take: perPageParam,
        orderBy: { createdAt: "desc" },
      }),
      prisma.assessmentRelease.count({ where: whereClause }),
    ]);

    return NextResponse.json({
      data: releases,
      total: totalReleases,
      page: pageParam,
      perPage: perPageParam,
    });
  },
  { allowedRoles: [...ALLOWED_ROLES] },
);
