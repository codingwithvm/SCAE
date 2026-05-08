import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateToken } from "@/lib/auth/jwt";

export async function POST(loginRequest: Request) {
  try {
    const loginRequestBody = await loginRequest.json();
    const { registrationNumber, birthDate } = loginRequestBody;

    if (!registrationNumber || !birthDate) {
      return NextResponse.json(
        { error: "registrationNumber and birthDate are required" },
        { status: 400 },
      );
    }

    const parsedBirthDate = new Date(birthDate);

    if (isNaN(parsedBirthDate.getTime())) {
      return NextResponse.json(
        { error: "birthDate must be a valid date" },
        { status: 400 },
      );
    }

    const student = await prisma.user.findFirst({
      where: {
        registrationNumber,
        birthDate: parsedBirthDate,
        role: "STUDENT",
        deletedAt: null,
      },
    });

    if (!student) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );
    }

    const authenticationToken = generateToken({
      userId: student.id,
      role: student.role,
    });

    const response = NextResponse.json({
      token: authenticationToken,
      user: {
        id: student.id,
        name: student.name,
        role: student.role,
      },
    });

    response.cookies.set("auth_token", authenticationToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }
}
