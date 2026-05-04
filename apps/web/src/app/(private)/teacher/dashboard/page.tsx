"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Sparkles,
  Users,
  ArrowRight,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

interface AuthUser {
  id: string;
  name: string | null;
  role: string;
}

interface ClassItem {
  id: string;
  name: string;
  grade: number;
  year: number;
}

interface ClassStudents {
  classId: string;
  students: {
    studentId: string;
    assessmentId: string | null;
    profile: string | null;
  }[];
}

interface AssessmentHistoryItem {
  id: string;
  instrument: string;
  state: string;
  profile: string | null;
  tier: string | null;
}

const TEACHER_INSTRUMENTS = [
  {
    key: "MCEES_PROF",
    label: "MCEES — Professor",
    desc: "Descubra seu perfil de aprendizagem como educador.",
    href: "/assessment/mcees_prof",
  },
  {
    key: "MEES_PROF",
    label: "MEES — Professor",
    desc: "Identifique seu estilo de ensino predominante.",
    href: "/assessment/mees_prof",
  },
];

export default function TeacherDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [classStats, setClassStats] = useState<
    Record<string, { total: number; assessed: number }>
  >({});
  const [assessments, setAssessments] = useState<AssessmentHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("auth_user");
    if (!stored) {
      router.replace("/login");
      return;
    }
    const parsed = JSON.parse(stored) as AuthUser;
    setUser(parsed);

    const token = localStorage.getItem("auth_token");
    if (!token) return;

    const headers = { Authorization: `Bearer ${token}` };

    Promise.all([
      fetch("/api/v1/classes/my", { headers }).then((r) => r.json()),
      fetch("/api/v1/assessments/history?perPage=50", { headers }).then((r) =>
        r.json(),
      ),
    ])
      .then(async ([classesRes, historyRes]) => {
        const fetchedClasses = (classesRes.classes || []) as ClassItem[];
        setClasses(fetchedClasses);
        setAssessments((historyRes.data || []) as AssessmentHistoryItem[]);

        const stats: Record<string, { total: number; assessed: number }> = {};
        await Promise.all(
          fetchedClasses.map(async (c) => {
            const res = await fetch(`/api/v1/classes/${c.id}/assessments`, {
              headers,
            });
            const data = (await res.json()) as ClassStudents;
            const total = data.students?.length || 0;
            const assessed =
              data.students?.filter((s) => s.profile !== null).length || 0;
            stats[c.id] = { total, assessed };
          }),
        );
        setClassStats(stats);
      })
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2
          size={28}
          className="animate-spin text-primary"
          aria-hidden="true"
        />
      </div>
    );
  }

  const firstName = user?.name?.split(" ")[0] || "Professor(a)";

  function instrumentStatus(instrumentKey: string) {
    const completed = assessments.find(
      (a) =>
        a.instrument === instrumentKey &&
        a.state === "COMPLETE" &&
        a.profile !== null,
    );
    if (completed)
      return { done: true, profile: completed.profile, id: completed.id };
    return { done: false, profile: null, id: null };
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-text-primary font-(family-name:--font-poppins)]">
          Olá, {firstName}!
        </h1>
        <p className="text-base text-text-secondary font-(family-name:--font-inter)]">
          Bem-vindo(a) ao painel do professor.
        </p>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-border-light bg-background shadow-[0_2px_8px_rgba(30,79,174,0.08)] p-6">
        <h2 className="text-lg font-semibold text-text-primary font-(family-name:--font-poppins)]">
          Suas avaliações
        </h2>
        <p className="text-sm text-text-secondary font-(family-name:--font-inter)]">
          Responda as avaliações MCEES e MEES para descobrir seus estilos de
          aprendizagem e ensino.
        </p>
        <div className="flex gap-3 mt-1">
          {TEACHER_INSTRUMENTS.map((inst) => {
            const status = instrumentStatus(inst.key);
            return (
              <div
                key={inst.key}
                className="flex flex-1 flex-col gap-2 rounded-xl border border-border-light bg-surface p-4"
              >
                <span className="text-sm font-semibold text-text-primary font-(family-name:--font-poppins)]">
                  {inst.label}
                </span>
                <span className="text-xs text-text-secondary font-(family-name:--font-inter)]">
                  {inst.desc}
                </span>
                {status.done ? (
                  <div className="flex items-center gap-2 mt-auto">
                    <CheckCircle2
                      size={16}
                      className="text-green-600 shrink-0"
                      aria-hidden="true"
                    />
                    <span className="text-xs font-medium text-green-700">
                      Perfil: {status.profile}
                    </span>
                    <Link
                      href={`/report/${status.id}`}
                      className="ml-auto text-xs font-medium text-primary no-underline hover:underline"
                    >
                      Ver relatório
                    </Link>
                  </div>
                ) : (
                  <Button
                    variant="primary"
                    size="sm"
                    asChild
                    className="mt-auto"
                  >
                    <Link
                      href={inst.href}
                      className="flex items-center gap-1.5 no-underline"
                    >
                      <Sparkles size={14} aria-hidden="true" />
                      Iniciar
                      <ArrowRight size={14} aria-hidden="true" />
                    </Link>
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold text-text-primary font-(family-name:--font-poppins)]">
          Suas turmas
        </h2>

        {classes.length === 0 ? (
          <p className="text-sm text-text-secondary font-(family-name:--font-inter)]">
            Nenhuma turma vinculada ao seu perfil.
          </p>
        ) : (
          <div className="flex gap-4 flex-wrap">
            {classes.map((turma) => {
              const stats = classStats[turma.id] || {
                total: 0,
                assessed: 0,
              };
              return (
                <div
                  key={turma.id}
                  className="flex flex-1 min-w-[280px] max-w-[400px] flex-col rounded-2xl border border-border-light bg-background shadow-[0_2px_8px_rgba(30,79,174,0.08)] overflow-hidden"
                >
                  <div className="flex flex-col gap-1 px-6 py-5 border-b border-border-light">
                    <h3 className="text-lg font-semibold text-text-primary font-(family-name:--font-poppins)]">
                      {turma.name}
                    </h3>
                    <p className="text-sm text-text-secondary font-(family-name:--font-inter)]">
                      {stats.total} alunos · {stats.assessed} com perfil
                      calculado
                    </p>
                  </div>

                  <div className="flex items-center gap-3 px-6 py-4">
                    <Users
                      size={20}
                      className="text-text-muted shrink-0"
                      aria-hidden="true"
                    />
                    <div className="flex flex-col gap-0.5 flex-1">
                      <div className="flex items-center justify-between text-xs font-medium font-(family-name:--font-inter)]">
                        <span className="text-text-secondary">Avaliados</span>
                        <span className="text-text-primary">
                          {stats.assessed}/{stats.total}
                        </span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-surface overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{
                            width: `${stats.total > 0 ? Math.round((stats.assessed / stats.total) * 100) : 0}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 px-6 pb-5">
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="flex-1"
                    >
                      <Link
                        href={`/teacher/students?class=${turma.id}`}
                        className="no-underline"
                      >
                        Ver alunos
                      </Link>
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      asChild
                      className="flex-1"
                    >
                      <Link
                        href={`/teacher/classes/${turma.id}/profiles`}
                        className="no-underline"
                      >
                        Ver perfis
                      </Link>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
