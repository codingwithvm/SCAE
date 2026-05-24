import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/middleware";
import { prisma } from "@/lib/prisma";

type ScaeProfile = "Analítico" | "Prático" | "Criativo" | "Estrategista";

const VALID_PROFILES: ScaeProfile[] = [
  "Analítico",
  "Prático",
  "Criativo",
  "Estrategista",
];

const PROFILE_DATA: Record<
  ScaeProfile,
  { description: string; strategies: string[] }
> = {
  Analítico: {
    description:
      "Aprende melhor com teoria, gráficos e lógica sequencial. Prefere entender o porquê antes de agir.",
    strategies: [
      "Leia o texto introdutório com atenção antes de começar as questões.",
      "Faça anotações identificando padrões e relações entre os conceitos.",
      "Use os gráficos e tabelas como ponto de partida para a resolução.",
      "Revise a lógica da resposta antes de confirmar — confie no seu raciocínio.",
    ],
  },
  Prático: {
    description:
      "Aprende melhor fazendo, experimentando e aplicando conceitos em situações concretas.",
    strategies: [
      "Comece pela atividade principal sem ler todo o enunciado — ajuste no caminho.",
      "Use a tentativa e erro como estratégia: cada erro traz informação útil.",
      "Relacione o conteúdo com situações do seu dia a dia.",
      "Se travar em um conceito, pule e volte depois com novo contexto.",
    ],
  },
  Criativo: {
    description:
      "Aprende melhor com conexões inesperadas, metáforas e liberdade para explorar.",
    strategies: [
      "Antes de resolver, imagine situações diferentes em que o conceito poderia aparecer.",
      "Tente criar uma metáfora ou história curta que explique o que está aprendendo.",
      "Explore as alternativas erradas das questões — entender o erro também é aprender.",
      "Permita-se escrever ou desenhar suas ideias antes de escolher a resposta.",
    ],
  },
  Estrategista: {
    description:
      "Aprende melhor com visão do todo, objetivos claros e planejamento antes da ação.",
    strategies: [
      "Leia todas as questões disponíveis antes de responder qualquer uma.",
      "Identifique quais questões valem mais ou são mais fáceis e planeje a ordem.",
      "Conecte o conteúdo da atividade com os objetivos maiores da disciplina.",
      "Reserve tempo ao final para revisar suas respostas com olhar crítico.",
    ],
  },
};

export const GET = withAuth(async (_request, decodedTokenPayload) => {
  const user = await prisma.user.findUnique({
    where: { id: decodedTokenPayload.userId },
    select: { scaeProfile: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const profile = user.scaeProfile as ScaeProfile | null;

  if (!profile) {
    return NextResponse.json({
      scaeProfile: null,
      profileDescription: null,
      strategies: [],
    });
  }

  const profileInfo = PROFILE_DATA[profile];

  return NextResponse.json({
    scaeProfile: profile,
    profileDescription: profileInfo?.description ?? null,
    strategies: profileInfo?.strategies ?? [],
  });
});

export const PATCH = withAuth(async (request, decodedTokenPayload) => {
  let body: { scaeProfile?: string; userId?: string };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const { scaeProfile, userId: targetUserId } = body;

  if (!scaeProfile) {
    return NextResponse.json(
      { error: "scaeProfile is required" },
      { status: 400 },
    );
  }

  if (!VALID_PROFILES.includes(scaeProfile as ScaeProfile)) {
    return NextResponse.json(
      {
        error: `Invalid scaeProfile. Accepted values: ${VALID_PROFILES.join(", ")}`,
      },
      { status: 400 },
    );
  }

  if (targetUserId && targetUserId !== decodedTokenPayload.userId) {
    if (decodedTokenPayload.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const targetExists = await prisma.user.findUnique({
      where: { id: targetUserId, deletedAt: null },
      select: { id: true },
    });

    if (!targetExists) {
      return NextResponse.json(
        { error: "Target user not found" },
        { status: 404 },
      );
    }
  }

  const resolvedUserId = targetUserId ?? decodedTokenPayload.userId;

  const updated = await prisma.user.update({
    where: { id: resolvedUserId },
    data: { scaeProfile },
    select: {
      id: true,
      name: true,
      scaeProfile: true,
    },
  });

  const profile = updated.scaeProfile as ScaeProfile;
  const profileInfo = PROFILE_DATA[profile];

  return NextResponse.json({
    scaeProfile: updated.scaeProfile,
    profileDescription: profileInfo?.description ?? null,
    strategies: profileInfo?.strategies ?? [],
    userId: updated.id,
    userName: updated.name,
  });
});
