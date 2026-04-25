"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  calculateTeacherMcees,
  calculateTeacherMees,
  type TeacherMceesResult,
  type TeacherMeesResult,
} from "@/lib/teacher/teacher-profile";
import {
  TEACHER_MCEES_PROFILE_DATA,
  TEACHER_MEES_PROFILE_DATA,
  TEACHER_PROFILE_RELATIONS,
} from "@/lib/teacher/teacher-profile-data";
import { type TeacherAnswerValue } from "@/lib/teacher/quiz";

const MCEES_STORAGE_KEY = "teacher_mcees_answers";
const MEES_STORAGE_KEY = "teacher_mees_answers";
const PROFILE_STORAGE_KEY = "teacher_profile";

interface TeacherProfileStorage {
  mcees: TeacherMceesResult;
  mees: TeacherMeesResult;
}

export default function TeacherProfilePage() {
  const router = useRouter();
  const initialized = useRef(false);

  const [result, setResult] = useState<TeacherProfileStorage | null>(null);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const stored = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (stored) {
      setResult(JSON.parse(stored) as TeacherProfileStorage);
      return;
    }

    const rawMcees = sessionStorage.getItem(MCEES_STORAGE_KEY);
    const rawMees = sessionStorage.getItem(MEES_STORAGE_KEY);

    if (!rawMcees || !rawMees) {
      router.replace("/teacher/assessment");
      return;
    }

    const mcees = calculateTeacherMcees(
      JSON.parse(rawMcees) as Record<number, TeacherAnswerValue>,
    );
    const mees = calculateTeacherMees(
      JSON.parse(rawMees) as Record<number, TeacherAnswerValue>,
    );

    const profile: TeacherProfileStorage = { mcees, mees };
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
    sessionStorage.removeItem(MCEES_STORAGE_KEY);
    sessionStorage.removeItem(MEES_STORAGE_KEY);
    setResult(profile);
  }, [router]);

  if (!result) return null;

  const { mcees, mees } = result;
  const mceesData = TEACHER_MCEES_PROFILE_DATA[mcees.profile];
  const meesData = TEACHER_MEES_PROFILE_DATA[mees.profile];
  const relationText =
    TEACHER_PROFILE_RELATIONS[mcees.profile]?.[mees.profile] ?? null;

  const mceesRelLabel = {
    Criativo: {
      top: "Intuitivo",
      bottom: "Sensorial",
      left: "Reflexivo",
      right: "Ativo",
    },
    Analítico: {
      top: "Intuitivo",
      bottom: "Sensorial",
      left: "Reflexivo",
      right: "Ativo",
    },
    Estrategista: {
      top: "Intuitivo",
      bottom: "Sensorial",
      left: "Reflexivo",
      right: "Ativo",
    },
    Prático: {
      top: "Intuitivo",
      bottom: "Sensorial",
      left: "Reflexivo",
      right: "Ativo",
    },
  }[mcees.profile];

  const meesRelLabel = {
    Facilitador: {
      top: "Teórico",
      bottom: "Prático",
      left: "Centrado no aluno",
      right: "Centrado no conteúdo",
    },
    Avaliador: {
      top: "Teórico",
      bottom: "Prático",
      left: "Centrado no aluno",
      right: "Centrado no conteúdo",
    },
    Especialista: {
      top: "Teórico",
      bottom: "Prático",
      left: "Centrado no aluno",
      right: "Centrado no conteúdo",
    },
    Mentor: {
      top: "Teórico",
      bottom: "Prático",
      left: "Centrado no aluno",
      right: "Centrado no conteúdo",
    },
  }[mees.profile];

  return (
    <div className="flex flex-col gap-6 p-10 w-full">
      <h1 className="text-2xl font-bold text-text-primary font-(family-name:--font-poppins)]">
        Seu perfil profissional
      </h1>

      {/* Cards row */}
      <div className="flex gap-6">
        {/* MCEES card */}
        <div className="flex-1 flex flex-col gap-4 bg-background rounded-[--radius-lg] border border-border-light shadow-[0_2px_8px_var(--shadow-color)] p-6">
          <h2 className="text-lg font-semibold text-text-primary font-(family-name:--font-poppins)]">
            Estilo de aprendizagem (MCEES)
          </h2>

          {/* Badge + name */}
          <div className="flex items-center gap-3">
            <span
              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold"
              style={{
                backgroundColor: mceesData.badgeBg,
                color: mceesData.badgeText,
              }}
            >
              {mcees.profile}
            </span>
          </div>

          {/* Bi-axial chart */}
          <BiaxialChart
            scoreX={mcees.scores.x}
            scoreY={mcees.scores.y}
            maxRange={16}
            dotColor={mceesData.color}
            labels={mceesRelLabel}
          />

          <p className="text-sm text-text-secondary font-(family-name:--font-inter)]">
            Ponto: ({mcees.scores.x.toFixed(1)}, {mcees.scores.y.toFixed(1)})
          </p>
          <p className="text-sm text-text-secondary font-(family-name:--font-inter)] leading-relaxed">
            {mceesData.description}
          </p>
        </div>

        {/* MEES card */}
        <div className="flex-1 flex flex-col gap-4 bg-background rounded-[--radius-lg] border border-border-light shadow-[0_2px_8px_var(--shadow-color)] p-6">
          <h2 className="text-lg font-semibold text-text-primary font-(family-name:--font-poppins)]">
            Estilo de ensino (MEES)
          </h2>

          {/* Badge + name */}
          <div className="flex items-center gap-3">
            <span
              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold"
              style={{
                backgroundColor: meesData.badgeBg,
                color: meesData.badgeText,
              }}
            >
              {mees.profile}
            </span>
          </div>

          {/* Bi-axial chart */}
          <BiaxialChart
            scoreX={mees.scores.x}
            scoreY={mees.scores.y}
            maxRange={16}
            dotColor={meesData.color}
            labels={meesRelLabel}
          />

          <p className="text-sm text-text-secondary font-(family-name:--font-inter)]">
            Ponto: ({mees.scores.x.toFixed(1)}, {mees.scores.y.toFixed(1)})
          </p>
          <p className="text-sm text-text-secondary font-(family-name:--font-inter)] leading-relaxed">
            {meesData.description}
          </p>
        </div>
      </div>

      {/* Relation card */}
      {relationText && (
        <div className="flex flex-col gap-3 bg-background rounded-[--radius-lg] border border-border-light shadow-[0_2px_8px_var(--shadow-color)] p-6">
          <h2 className="text-lg font-semibold text-text-primary font-(family-name:--font-poppins)]">
            Como seus perfis se relacionam
          </h2>
          <p className="text-base font-medium text-text-primary font-(family-name:--font-inter)] leading-relaxed">
            Seu estilo de aprendizagem é {mcees.profile} e seu estilo de ensino
            é {mees.profile}.
          </p>
          <p className="text-sm text-text-secondary font-(family-name:--font-inter)] leading-relaxed">
            {relationText}
          </p>
        </div>
      )}
    </div>
  );
}

interface BiaxialChartProps {
  scoreX: number;
  scoreY: number;
  maxRange: number;
  dotColor: string;
  labels: { top: string; bottom: string; left: string; right: string };
}

function BiaxialChart({
  scoreX,
  scoreY,
  maxRange,
  dotColor,
  labels,
}: BiaxialChartProps) {
  const W = 460;
  const H = 180;
  const PAD = 20;
  const innerW = W - PAD * 2;
  const innerH = H - PAD * 2;

  // Map score to pixel: score ∈ [-maxRange, +maxRange] → [0, innerW/H]
  const dotX = PAD + ((scoreX + maxRange) / (2 * maxRange)) * innerW;
  // y-axis is inverted in SVG (positive y = up in math, down in SVG)
  const dotY = PAD + ((-scoreY + maxRange) / (2 * maxRange)) * innerH;

  return (
    <div className="rounded-[--radius-md] bg-surface border border-border-light overflow-hidden">
      <svg
        width="100%"
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        aria-hidden="true"
      >
        {/* Horizontal axis */}
        <line
          x1={PAD}
          y1={H / 2}
          x2={W - PAD}
          y2={H / 2}
          stroke="var(--color-border-light)"
          strokeWidth={1}
        />
        {/* Vertical axis */}
        <line
          x1={W / 2}
          y1={PAD}
          x2={W / 2}
          y2={H - PAD}
          stroke="var(--color-border-light)"
          strokeWidth={1}
        />

        {/* Labels */}
        <text
          x={W / 2}
          y={PAD - 6}
          textAnchor="middle"
          fontSize={10}
          fill="var(--color-text-muted)"
          fontFamily="Inter, sans-serif"
        >
          {labels.top}
        </text>
        <text
          x={W / 2}
          y={H - 4}
          textAnchor="middle"
          fontSize={10}
          fill="var(--color-text-muted)"
          fontFamily="Inter, sans-serif"
        >
          {labels.bottom}
        </text>
        <text
          x={PAD + 2}
          y={H / 2 - 4}
          textAnchor="start"
          fontSize={10}
          fill="var(--color-text-muted)"
          fontFamily="Inter, sans-serif"
        >
          {labels.left}
        </text>
        <text
          x={W - PAD - 2}
          y={H / 2 - 4}
          textAnchor="end"
          fontSize={10}
          fill="var(--color-text-muted)"
          fontFamily="Inter, sans-serif"
        >
          {labels.right}
        </text>

        {/* Dot */}
        <circle cx={dotX} cy={dotY} r={6} fill={dotColor} />
      </svg>
    </div>
  );
}
