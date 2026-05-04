"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Users, GraduationCap, Percent } from "lucide-react";

const PROFILE_COLORS: Record<string, string> = {
  Criativo: "#F6AD55",
  Analítico: "#63B3ED",
  Estrategista: "#68D391",
  Prático: "#FC8181",
};

interface ClassItem {
  id: string;
  name: string;
}

interface StudentRow {
  profile: string | null;
  tier: string | null;
}

export default function SchoolReportsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [totalStudents, setTotalStudents] = useState(0);
  const [assessedCount, setAssessedCount] = useState(0);
  const [distribution, setDistribution] = useState<Record<string, number>>({});
  const [tierDist, setTierDist] = useState<Record<string, number>>({});
  const [totalClasses, setTotalClasses] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      router.replace("/login");
      return;
    }

    const headers = { Authorization: `Bearer ${token}` };

    fetch("/api/v1/classes/my", { headers })
      .then((r) => r.json())
      .then(async (classesRes) => {
        const classes = (classesRes.classes || []) as ClassItem[];
        setTotalClasses(classes.length);

        let allStudents: StudentRow[] = [];
        await Promise.all(
          classes.map(async (c) => {
            const res = await fetch(`/api/v1/classes/${c.id}/assessments`, {
              headers,
            });
            const data = await res.json();
            allStudents = allStudents.concat(data.students || []);
          }),
        );

        setTotalStudents(allStudents.length);
        const assessed = allStudents.filter((s) => s.profile !== null);
        setAssessedCount(assessed.length);

        const profDist: Record<string, number> = {};
        const tDist: Record<string, number> = {};
        for (const s of assessed) {
          if (s.profile) profDist[s.profile] = (profDist[s.profile] || 0) + 1;
          if (s.tier) tDist[s.tier] = (tDist[s.tier] || 0) + 1;
        }
        setDistribution(profDist);
        setTierDist(tDist);
      })
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={28} className="animate-spin text-primary" />
      </div>
    );
  }

  const assessedPct =
    totalStudents > 0 ? Math.round((assessedCount / totalStudents) * 100) : 0;
  const totalAssessed = Object.values(distribution).reduce((a, b) => a + b, 0);
  const maxCount = Math.max(...Object.values(distribution), 1);

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-text-primary font-(family-name:--font-poppins)]">
          Relatórios
        </h1>
        <p className="text-base text-text-secondary font-(family-name:--font-inter)]">
          Visão geral dos resultados da escola
        </p>
      </div>

      <div className="flex gap-4">
        <MetricCard
          icon={<Users size={20} className="text-primary" />}
          label="Turmas"
          value={String(totalClasses)}
        />
        <MetricCard
          icon={<GraduationCap size={20} className="text-primary" />}
          label="Alunos"
          value={String(totalStudents)}
        />
        <MetricCard
          icon={<Percent size={20} className="text-primary" />}
          label="Avaliados"
          value={`${assessedCount} (${assessedPct}%)`}
        />
      </div>

      <div className="flex flex-col gap-4 bg-background rounded-2xl border border-border-light p-6">
        <h2 className="text-lg font-semibold text-text-primary font-(family-name:--font-poppins)]">
          Distribuição de perfis
        </h2>
        {totalAssessed === 0 ? (
          <p className="text-sm text-text-secondary">
            Nenhuma avaliação concluída ainda.
          </p>
        ) : (
          (Object.entries(distribution) as [string, number][])
            .sort(([, a], [, b]) => b - a)
            .map(([profile, count]) => (
              <div key={profile} className="flex items-center gap-3">
                <span className="text-sm font-medium text-text-secondary w-24 shrink-0">
                  {profile}
                </span>
                <div className="flex-1 h-5 rounded bg-surface overflow-hidden">
                  <div
                    className="h-full rounded transition-all"
                    style={{
                      width: `${(count / maxCount) * 100}%`,
                      backgroundColor: PROFILE_COLORS[profile] ?? "#63B3ED",
                    }}
                  />
                </div>
                <span className="text-sm font-medium text-text-secondary w-20 text-right shrink-0">
                  {count} (
                  {totalAssessed > 0
                    ? Math.round((count / totalAssessed) * 100)
                    : 0}
                  %)
                </span>
              </div>
            ))
        )}
      </div>

      {Object.keys(tierDist).length > 0 && (
        <div className="flex flex-col gap-4 bg-background rounded-2xl border border-border-light p-6">
          <h2 className="text-lg font-semibold text-text-primary font-(family-name:--font-poppins)]">
            Distribuição por consistência
          </h2>
          <div className="flex gap-4">
            {Object.entries(tierDist)
              .sort(([, a], [, b]) => b - a)
              .map(([tier, count]) => (
                <div
                  key={tier}
                  className="flex-1 flex flex-col items-center gap-1 rounded-xl border border-border-light bg-surface p-4"
                >
                  <span className="text-2xl font-bold text-text-primary">
                    {count}
                  </span>
                  <span className="text-xs text-text-secondary">{tier}</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex-1 flex flex-col gap-2 bg-background rounded-2xl border border-border-light p-6">
      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-surface">
        {icon}
      </div>
      <span className="text-2xl font-bold text-text-primary">{value}</span>
      <span className="text-sm text-text-secondary">{label}</span>
    </div>
  );
}
