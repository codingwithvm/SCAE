"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Lightbulb, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { calculateProfile, type ProfileResult } from "@/lib/quiz/profile";
import { PROFILE_DATA } from "@/lib/quiz/profile-data";
import { type ScaleValue } from "@/lib/quiz/questions";

const PROFILE_ORDER = [
  "Criativo",
  "Analítico",
  "Estrategista",
  "Prático",
] as const;

export default function QuizProfilePage() {
  const router = useRouter();
  const initialized = useRef(false);
  const [profileResult, setProfileResult] = useState<ProfileResult | null>(
    null,
  );

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const storedAnswers = sessionStorage.getItem("quiz_answers");

    if (!storedAnswers) {
      router.replace("/quiz/questions");
      return;
    }

    const answers = JSON.parse(storedAnswers) as Record<number, ScaleValue>;
    const result = calculateProfile(answers);
    sessionStorage.removeItem("quiz_answers");

    // Persist profile in localStorage so dashboard and activities page can read it
    localStorage.setItem("quiz_profile", result.profile);

    setProfileResult(result);
  }, [router]);

  if (!profileResult) return null;

  const profileData = PROFILE_DATA[profileResult.profile];
  const { scores, percentages } = profileResult;

  const CHART_SIZE = 240;
  const CHART_CENTER = CHART_SIZE / 2;
  const SCALE_FACTOR = 1.5;
  const dotX = Math.min(
    Math.max(CHART_CENTER + scores.x * SCALE_FACTOR, 8),
    CHART_SIZE - 8,
  );
  const dotY = Math.min(
    Math.max(CHART_CENTER - scores.y * SCALE_FACTOR, 8),
    CHART_SIZE - 8,
  );

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      {/* Header */}
      <header className="flex items-center justify-between h-16 px-8 bg-background border-b border-border-light shrink-0">
        <Link href="/dashboard" aria-label="Início — SCAE">
          <Image src="/logo.png" alt="SCAE" width={116} height={32} priority />
        </Link>

        <h1 className="text-lg font-semibold text-text-primary font-(family-name:--font-poppins)]">
          Seu perfil
        </h1>

        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 text-sm font-medium text-primary hover:opacity-75 transition-opacity no-underline"
        >
          <ArrowLeft size={18} aria-hidden="true" />
          Voltar
        </Link>
      </header>

      {/* Body */}
      <main className="flex flex-1 flex-col gap-6 px-8 py-6">
        {/* Audio row */}
        <div className="flex justify-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary">
            <Volume2 size={22} className="text-white" aria-hidden="true" />
          </div>
        </div>

        {/* Top row: profile card + chart + bars */}
        <div className="flex gap-5">
          {/* Profile card */}
          <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-border-light bg-background p-7 shadow-[0_4px_16px_rgba(30,79,174,0.08)]">
            {/* Badge */}
            <span
              className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold font-(family-name:--font-inter)]"
              style={{
                backgroundColor: profileData.badgeBg,
                color: profileData.badgeText,
              }}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: profileData.color }}
                aria-hidden="true"
              />
              {profileData.name}
            </span>

            <h2
              className="text-xl font-bold text-center font-(family-name:--font-poppins)]"
              style={{ color: profileData.color }}
            >
              Você é {profileData.name}!
            </h2>

            <p className="text-sm text-text-secondary text-center font-(family-name:--font-inter)] max-w-70">
              {profileData.description}
            </p>

            <Button variant="primary" size="md" asChild>
              <Link
                href="/activities"
                className="flex items-center gap-2 no-underline"
              >
                Ver atividades
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
            </Button>
          </div>

          {/* Right column: chart + bars */}
          <div className="flex flex-1 flex-col gap-5">
            {/* Bi-axial chart card */}
            <div className="flex items-center gap-5 rounded-2xl border border-border-light bg-background p-5">
              <div className="relative shrink-0">
                <svg
                  width={CHART_SIZE}
                  height={CHART_SIZE}
                  className="rounded-md bg-surface"
                  aria-label="Gráfico bi-axial de perfil"
                >
                  <line
                    x1={0}
                    y1={CHART_CENTER}
                    x2={CHART_SIZE}
                    y2={CHART_CENTER}
                    stroke="#E2E8F0"
                    strokeWidth={1}
                  />
                  <line
                    x1={CHART_CENTER}
                    y1={0}
                    x2={CHART_CENTER}
                    y2={CHART_SIZE}
                    stroke="#E2E8F0"
                    strokeWidth={1}
                  />
                  <text
                    x={CHART_SIZE - 8}
                    y={16}
                    textAnchor="end"
                    fill="#F6AD55"
                    fontSize={10}
                    fontWeight={600}
                    fontFamily="Inter, sans-serif"
                  >
                    Criativo
                  </text>
                  <text
                    x={8}
                    y={16}
                    textAnchor="start"
                    fill="#63B3ED"
                    fontSize={10}
                    fontWeight={600}
                    fontFamily="Inter, sans-serif"
                  >
                    Analítico
                  </text>
                  <text
                    x={8}
                    y={CHART_SIZE - 6}
                    textAnchor="start"
                    fill="#68D391"
                    fontSize={10}
                    fontWeight={600}
                    fontFamily="Inter, sans-serif"
                  >
                    Estrategista
                  </text>
                  <text
                    x={CHART_SIZE - 8}
                    y={CHART_SIZE - 6}
                    textAnchor="end"
                    fill="#FC8181"
                    fontSize={10}
                    fontWeight={600}
                    fontFamily="Inter, sans-serif"
                  >
                    Prático
                  </text>
                  <circle
                    cx={dotX}
                    cy={dotY}
                    r={7}
                    fill={profileData.color}
                    opacity={0.9}
                  />
                </svg>
              </div>

              <div className="flex flex-col gap-3">
                <p className="text-base font-semibold text-text-primary font-(family-name:--font-poppins)]">
                  Gráfico bi-axial
                </p>
                <p className="text-xs text-text-secondary font-(family-name:--font-inter)] max-w-70">
                  Posição no quadrante indica seu estilo dominante de
                  aprendizagem.
                </p>
              </div>
            </div>

            {/* Affinity bars card */}
            <div className="flex flex-1 flex-col justify-center gap-4 rounded-2xl border border-border-light bg-background p-5">
              <p className="text-base font-semibold text-text-primary font-(family-name:--font-poppins)]">
                Sua afinidade com cada perfil:
              </p>

              <div className="flex flex-col gap-4">
                {PROFILE_ORDER.map((profileName) => {
                  const data = PROFILE_DATA[profileName];
                  const percent = percentages[profileName];

                  return (
                    <div key={profileName} className="flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <span
                          className="text-sm font-medium font-(family-name:--font-inter)]"
                          style={{ color: data.color }}
                        >
                          {profileName}
                        </span>
                        <span className="text-sm font-semibold text-text-primary font-(family-name:--font-inter)]">
                          {percent}%
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-surface overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${percent}%`,
                            backgroundColor: data.color,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Tips card */}
        <div className="flex items-start gap-3 rounded-2xl border border-border-light bg-background px-6 py-4">
          <Lightbulb
            size={20}
            aria-hidden="true"
            style={{ color: profileData.color }}
            className="mt-0.5 shrink-0"
          />
          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold text-text-primary font-(family-name:--font-poppins)]">
              Como você aprende melhor:
            </p>
            <ul className="flex flex-col gap-1">
              {profileData.tips.map((tip, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span
                    className="text-sm font-semibold font-(family-name:--font-inter)]"
                    style={{ color: profileData.color }}
                    aria-hidden="true"
                  >
                    •
                  </span>
                  <span className="text-xs text-text-secondary font-(family-name:--font-inter)]">
                    {tip}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
