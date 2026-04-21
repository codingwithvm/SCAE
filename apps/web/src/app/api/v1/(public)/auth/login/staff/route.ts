import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { comparePassword } from "@/lib/auth/password";
import { generateToken } from "@/lib/auth/jwt";

export async function POST(loginRequest: Request) {
  try {
    const loginRequestBody = await loginRequest.json();
    const { email, password } = loginRequestBody;

    if (!email || !password) {
      return NextResponse.json(
        { error: "email and password are required" },
        { status: 400 },
      );
    }

    const staffMember = await prisma.user.findFirst({
      where: {
        email,
        role: { not: "STUDENT" },
        deletedAt: null,
      },
    });

    if (!staffMember || !staffMember.passwordHash) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );
    }

    const passwordMatchesHash = await comparePassword(
      password,
      staffMember.passwordHash,
    );

    if (!passwordMatchesHash) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );
    }

    const authenticationToken = generateToken({
      userId: staffMember.id,
      role: staffMember.role,
    });

    return NextResponse.json({
      token: authenticationToken,
      user: {
        id: staffMember.id,
        name: staffMember.name,
        role: staffMember.role,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }
}
