"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Sparkles, ArrowRight, FileText } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface AuthUser {
  id: string;
  name: string | null;
  role: string;
  email?: string;
}

interface AssessmentHistoryItem {
  id: string;
  instrument: string;
  state: string;
  profile: string | null;
  tier: string | null;
  completedAt: string | null;
}

const INSTRUMENT_META: Record<
  string,
  { label: string; desc: string; type: string; href: string }
> = {
  MCEES_PROF: {
    label: "MCEES — Professor",
    desc: "Perfil de aprendizagem do educador",
    type: "Aprendizagem",
    href: "/assessment/mcees_prof",
  },
  MEES_PROF: {
    label: "MEES — Professor",
    desc: "Estilo de ensino predominante",
    type: "Ensino",
    href: "/assessment/mees_prof",
  },
};

export default function TeacherProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
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

    fetch("/api/v1/assessments/history?perPage=50", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((res) =>
        setAssessments((res.data || []) as AssessmentHistoryItem[]),
      )
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={28} className="animate-spin text-primary" />
      </div>
    );
  }

  function latestCompleted(instrumentKey: string) {
    return assessments.find(
      (a) =>
        a.instrument === instrumentKey &&
        a.state === "COMPLETE" &&
        a.profile !== null,
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-text-primary font-(family-name:--font-poppins)]">
          Meu perfil
        </h1>
        <p className="text-base text-text-secondary font-(family-name:--font-inter)]">
          {user?.name || "Professor(a)"} · {user?.email || ""}
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-text-primary font-(family-name:--font-poppins)]">
          Meus resultados
        </h2>

        <div className="flex gap-4 flex-wrap">
          {Object.entries(INSTRUMENT_META).map(([key, meta]) => {
            const result = latestCompleted(key);
            return (
              <div
                key={key}
                className="flex flex-1 min-w-[280px] max-w-[400px] flex-col rounded-2xl border border-border-light bg-background shadow-[0_2px_8px_rgba(30,79,174,0.08)] overflow-hidden"
              >
                <div className="flex flex-col gap-1 px-6 py-5 border-b border-border-light">
                  <span className="text-xs font-bold text-text-muted uppercase tracking-wide">
                    {meta.type}
                  </span>
                  <h3 className="text-lg font-semibold text-text-primary font-(family-name:--font-poppins)]">
                    {meta.label}
                  </h3>
                  <p className="text-sm text-text-secondary font-(family-name:--font-inter)]">
                    {meta.desc}
                  </p>
                </div>

                <div className="flex flex-col gap-3 px-6 py-5">
                  {result ? (
                    <>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                          <Sparkles
                            size={20}
                            className="text-primary"
                            aria-hidden="true"
                          />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-base font-bold text-text-primary">
                            {result.profile}
                          </span>
                          {result.tier && (
                            <span className="text-xs text-text-secondary">
                              Consistência: {result.tier}
                            </span>
                          )}
                        </div>
                      </div>
                      {result.completedAt && (
                        <span className="text-xs text-text-muted">
                          Concluído em{" "}
                          {new Date(result.completedAt).toLocaleDateString(
                            "pt-BR",
                          )}
                        </span>
                      )}
                      <Button variant="outline" size="sm" asChild>
                        <Link
                          href={`/report/${result.id}`}
                          className="flex items-center gap-1.5 no-underline"
                        >
                          <FileText size={14} aria-hidden="true" />
                          Ver relatório completo
                        </Link>
                      </Button>
                    </>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <p className="text-sm text-text-secondary font-(family-name:--font-inter)]">
                        Avaliação ainda não realizada.
                      </p>
                      <Button variant="primary" size="sm" asChild>
                        <Link
                          href={meta.href}
                          className="flex items-center gap-1.5 no-underline"
                        >
                          Iniciar avaliação
                          <ArrowRight size={14} aria-hidden="true" />
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
