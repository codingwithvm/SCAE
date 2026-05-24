"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import {
  Loader2,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  Target,
  TrendingUp,
} from "lucide-react";

interface ReviewData {
  session: {
    id: string;
    status: string;
    scaeLevel: string;
    spaeceLevel: string;
    totalScore: number;
    timeSpentSecs: number;
    completedAt: string;
  };
  activity: {
    habilidadeCode: string;
    habilidadeDesc: string;
    discipline: string;
    grade: string;
    title: string;
    activityVersion: string;
  };
  scores: Record<string, number | null>;
  stats: {
    totalQuestions: number;
    correctAnswers: number;
    byLevel: Array<{ level: number; total: number; correct: number }>;
  };
  responsesByLevel: Record<
    string,
    Array<{
      id: string;
      questionId: string;
      questionText: string;
      level: number;
      selectedOption: string;
      correctOption: string;
      isCorrect: boolean;
      points: number;
    }>
  >;
  reflections: Record<string, string>;
}

const SCAE_LEVEL_META: Record<string, { label: string; color: string }> = {
  CONHECE: { label: "Conhece", color: "bg-red-100 text-red-700" },
  ENTENDE: { label: "Entende", color: "bg-yellow-100 text-yellow-700" },
  APLICA: { label: "Aplica", color: "bg-blue-100 text-blue-700" },
  RESOLVE: { label: "Resolve", color: "bg-green-100 text-green-700" },
};

const LEVEL_NAMES: Record<number, string> = {
  1: "CONHECE",
  2: "ENTENDE",
  3: "APLICA",
};

export default function ReviewPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.sessionId as string;
  const [userName, setUserName] = useState("");
  const [data, setData] = useState<ReviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("auth_user");
    if (!storedUser) {
      router.replace("/login");
      return;
    }

    const user = JSON.parse(storedUser);
    if (user.role !== "STUDENT") {
      router.replace("/unauthorized");
      return;
    }
    setUserName(user.name ?? "Aluno");

    const token = localStorage.getItem("auth_token");
    fetch(`/api/v1/gscae/sessions/${sessionId}/review`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load review");
        return res.json();
      })
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch(() => {
        router.replace("/gscae/activities");
      });
  }, [router, sessionId]);

  function handleLogout() {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    localStorage.removeItem("quiz_profile");
    router.replace("/login");
  }

  if (loading || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const levelMeta = SCAE_LEVEL_META[data.session.scaeLevel] ?? {
    label: data.session.scaeLevel,
    color: "bg-gray-100 text-gray-700",
  };
  const scorePercent = Math.round((data.session.totalScore ?? 0) * 100);
  const minutes = Math.floor((data.session.timeSpentSecs ?? 0) / 60);
  const seconds = (data.session.timeSpentSecs ?? 0) % 60;

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <Header variant="app" userName={userName} onLogout={handleLogout} />

      <main className="flex flex-1 flex-col items-center gap-6 px-20 py-8">
        <div className="flex w-full flex-col gap-6">
          <Link
            href="/gscae/activities"
            className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors no-underline font-(family-name:--font-inter)]"
          >
            <ArrowLeft size={16} />
            Voltar às atividades
          </Link>

          <div className="flex w-full flex-col gap-1">
            <h1 className="text-2xl font-semibold text-text-primary font-(family-name:--font-poppins)]">
              Revisão da Atividade
            </h1>
            <p className="text-base text-text-secondary font-(family-name:--font-inter)]">
              {data.activity.title} — {data.activity.habilidadeCode}
            </p>
          </div>

          <div className="flex w-full gap-4">
            <div className="flex flex-1 items-center gap-4 rounded-2xl border border-border-light bg-background p-6 shadow-[0_2px_8px_rgba(30,79,174,0.08)]">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-cta">
                <Target size={20} className="text-text-on-cta" />
              </div>
              <div>
                <p className="text-3xl font-bold text-text-primary font-(family-name:--font-poppins)]">
                  {scorePercent}%
                </p>
                <p className="text-sm text-text-secondary font-(family-name:--font-inter)]">
                  Pontuação geral
                </p>
              </div>
            </div>

            <div className="flex flex-1 items-center gap-4 rounded-2xl border border-border-light bg-background p-6 shadow-[0_2px_8px_rgba(30,79,174,0.08)]">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-cta">
                <TrendingUp size={20} className="text-text-on-cta" />
              </div>
              <div>
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold font-(family-name:--font-poppins)] ${levelMeta.color}`}
                >
                  {levelMeta.label}
                </span>
                <p className="mt-1 text-sm text-text-secondary font-(family-name:--font-inter)]">
                  Nível SCAE alcançado
                </p>
              </div>
            </div>

            <div className="flex flex-1 items-center gap-4 rounded-2xl border border-border-light bg-background p-6 shadow-[0_2px_8px_rgba(30,79,174,0.08)]">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-cta">
                <Clock size={20} className="text-text-on-cta" />
              </div>
              <div>
                <p className="text-3xl font-bold text-text-primary font-(family-name:--font-poppins)]">
                  {minutes}:{seconds.toString().padStart(2, "0")}
                </p>
                <p className="text-sm text-text-secondary font-(family-name:--font-inter)]">
                  Tempo total
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border-light bg-background p-6 shadow-[0_2px_8px_rgba(30,79,174,0.08)]">
            <h2 className="mb-4 text-xl font-semibold text-text-primary font-(family-name:--font-poppins)]">
              Desempenho por Nível
            </h2>
            <div className="flex gap-4">
              {data.stats.byLevel.map((level) => {
                const percent =
                  level.total > 0
                    ? Math.round((level.correct / level.total) * 100)
                    : 0;
                const levelName =
                  LEVEL_NAMES[level.level] ?? `Nível ${level.level}`;
                const meta = SCAE_LEVEL_META[levelName];
                return (
                  <div
                    key={level.level}
                    className="flex flex-1 flex-col items-center gap-2 rounded-xl border border-border-light p-4"
                  >
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${meta?.color ?? "bg-gray-100 text-gray-700"}`}
                    >
                      {meta?.label ?? levelName}
                    </span>
                    <p className="text-2xl font-bold text-text-primary font-(family-name:--font-poppins)]">
                      {percent}%
                    </p>
                    <p className="text-xs text-text-secondary font-(family-name:--font-inter)]">
                      {level.correct}/{level.total} corretas
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {Object.entries(data.responsesByLevel).map(
            ([levelKey, responses]) => {
              const levelNum = parseInt(levelKey, 10);
              const levelName = LEVEL_NAMES[levelNum] ?? `Nível ${levelNum}`;
              const meta = SCAE_LEVEL_META[levelName];
              return (
                <div
                  key={levelKey}
                  className="rounded-2xl border border-border-light bg-background p-6 shadow-[0_2px_8px_rgba(30,79,174,0.08)]"
                >
                  <h2 className="mb-4 text-lg font-semibold text-text-primary font-(family-name:--font-poppins)]">
                    <span
                      className={`mr-2 inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${meta?.color ?? "bg-gray-100 text-gray-700"}`}
                    >
                      {meta?.label ?? levelName}
                    </span>
                    Questões
                  </h2>
                  <div className="flex flex-col gap-3">
                    {responses.map((r, idx) => (
                      <div
                        key={r.id}
                        className={`flex items-start gap-3 rounded-xl border p-4 ${
                          r.isCorrect
                            ? "border-green-200 bg-green-50/50"
                            : "border-red-200 bg-red-50/50"
                        }`}
                      >
                        <div className="mt-0.5">
                          {r.isCorrect ? (
                            <CheckCircle2
                              size={18}
                              className="text-green-600"
                            />
                          ) : (
                            <XCircle size={18} className="text-red-600" />
                          )}
                        </div>
                        <div className="flex flex-1 flex-col gap-1">
                          <p className="text-sm font-medium text-text-primary font-(family-name:--font-inter)]">
                            {idx + 1}. {r.questionText}
                          </p>
                          <div className="flex gap-4 text-xs text-text-secondary font-(family-name:--font-inter)]">
                            <span>
                              Sua resposta:{" "}
                              <strong
                                className={
                                  r.isCorrect
                                    ? "text-green-700"
                                    : "text-red-700"
                                }
                              >
                                {r.selectedOption}
                              </strong>
                            </span>
                            {!r.isCorrect && (
                              <span>
                                Correta:{" "}
                                <strong className="text-green-700">
                                  {r.correctOption}
                                </strong>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            },
          )}

          {Object.keys(data.reflections).length > 0 && (
            <div className="rounded-2xl border border-border-light bg-background p-6 shadow-[0_2px_8px_rgba(30,79,174,0.08)]">
              <h2 className="mb-4 text-xl font-semibold text-text-primary font-(family-name:--font-poppins)]">
                Suas Reflexões
              </h2>
              <div className="flex flex-col gap-4">
                {Object.entries(data.reflections).map(([level, text]) => {
                  const meta = SCAE_LEVEL_META[level];
                  return (
                    <div key={level} className="flex flex-col gap-2">
                      <span
                        className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-medium ${meta?.color ?? "bg-gray-100 text-gray-700"}`}
                      >
                        {meta?.label ?? level}
                      </span>
                      <p className="text-sm text-text-secondary font-(family-name:--font-inter)] whitespace-pre-wrap">
                        {text}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Link
              href="/gscae/activities"
              className="flex items-center gap-2 rounded-md border border-border bg-background px-4 py-2.5 text-sm font-medium text-text-primary no-underline hover:bg-surface transition-colors font-(family-name:--font-inter)]"
            >
              Voltar às atividades
            </Link>
            <Link
              href="/gscae/badges"
              className="flex items-center gap-2 rounded-md border border-border bg-background px-4 py-2.5 text-sm font-medium text-text-primary no-underline hover:bg-surface transition-colors font-(family-name:--font-inter)]"
            >
              Ver minhas conquistas
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
