"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Users,
  UserCheck,
  GraduationCap,
  Percent,
  BarChart3,
  Loader2,
} from "lucide-react";

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
}

export default function SchoolDashboardPage() {
  const router = useRouter();
  const [userName, setUserName] = useState("Gestor(a)");
  const [loading, setLoading] = useState(true);
  const [totalClasses, setTotalClasses] = useState(0);
  const [totalTeachers, setTotalTeachers] = useState(0);
  const [totalStudents, setTotalStudents] = useState(0);
  const [assessedCount, setAssessedCount] = useState(0);
  const [distribution, setDistribution] = useState<Record<string, number>>({});

  useEffect(() => {
    const stored = localStorage.getItem("auth_user");
    if (!stored) {
      router.replace("/login");
      return;
    }
    const parsed = JSON.parse(stored) as { name?: string };
    if (parsed.name) setUserName(parsed.name.split(" ")[0]);

    const token = localStorage.getItem("auth_token");
    if (!token) return;

    const headers = { Authorization: `Bearer ${token}` };

    Promise.all([
      fetch("/api/v1/classes/my", { headers }).then((r) => r.json()),
      fetch("/api/v1/users?role=TEACHER&perPage=1", { headers }).then((r) =>
        r.json(),
      ),
    ])
      .then(async ([classesRes, teachersRes]) => {
        const classes = (classesRes.classes || []) as ClassItem[];
        setTotalClasses(classes.length);
        setTotalTeachers(teachersRes.total || 0);

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

        const dist: Record<string, number> = {};
        for (const s of assessed) {
          if (s.profile) {
            dist[s.profile] = (dist[s.profile] || 0) + 1;
          }
        }
        setDistribution(dist);
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

  const metricCards = [
    { label: "Turmas", value: String(totalClasses), icon: Users },
    { label: "Professores", value: String(totalTeachers), icon: UserCheck },
    { label: "Alunos", value: String(totalStudents), icon: GraduationCap },
    { label: "Alunos avaliados", value: `${assessedPct}%`, icon: Percent },
  ];

  const quickActions = [
    { label: "Gerenciar turmas", icon: Users, href: "/school/classes" },
    {
      label: "Gerenciar professores",
      icon: UserCheck,
      href: "/school/teachers",
    },
    { label: "Ver relatórios", icon: BarChart3, href: "/school/reports" },
  ];

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-text-primary font-(family-name:--font-poppins)]">
          Olá, {userName}!
        </h1>
        <p className="text-base text-text-secondary font-(family-name:--font-inter)]">
          Painel da escola
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex gap-4">
          {metricCards.slice(0, 2).map(({ label, value, icon: Icon }) => (
            <MetricCard
              key={label}
              label={label}
              value={value}
              icon={
                <Icon
                  size={20}
                  className="text-primary-dark"
                  aria-hidden="true"
                />
              }
            />
          ))}
        </div>
        <div className="flex gap-4">
          {metricCards.slice(2, 4).map(({ label, value, icon: Icon }) => (
            <MetricCard
              key={label}
              label={label}
              value={value}
              icon={
                <Icon
                  size={20}
                  className="text-primary-dark"
                  aria-hidden="true"
                />
              }
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4 bg-background rounded-2xl border border-border-light shadow-[0_2px_8px_var(--shadow-color)] p-6">
        <h2 className="text-lg font-semibold text-text-primary font-(family-name:--font-poppins)]">
          Distribuição de perfis da escola
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
                <span className="text-sm font-medium text-text-secondary w-24 shrink-0 font-(family-name:--font-inter)]">
                  {profile}
                </span>
                <div className="flex-1 h-5 rounded bg-surface overflow-hidden">
                  <div
                    className="h-full rounded transition-all"
                    style={{
                      width:
                        maxCount > 0 ? `${(count / maxCount) * 100}%` : "0%",
                      backgroundColor: PROFILE_COLORS[profile] ?? "#63B3ED",
                    }}
                  />
                </div>
                <span className="text-sm font-medium text-text-secondary w-20 text-right shrink-0 font-(family-name:--font-inter)]">
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

      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-text-primary font-(family-name:--font-poppins)]">
          Acesso rápido
        </h2>
        <div className="flex gap-3">
          {quickActions.map(({ label, icon: Icon, href }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2 px-4 py-2.5 rounded-md border border-border text-sm font-medium text-text-primary bg-background hover:bg-surface transition-colors no-underline"
            >
              <Icon
                size={16}
                className="text-text-secondary"
                aria-hidden="true"
              />
              {label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex-1 flex flex-col gap-2 bg-background rounded-2xl border border-border-light shadow-[0_2px_8px_var(--shadow-color)] p-6">
      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-cta">
        {icon}
      </div>
      <span className="text-3xl font-bold text-text-primary font-(family-name:--font-poppins)]">
        {value}
      </span>
      <span className="text-sm text-text-secondary font-(family-name:--font-inter)]">
        {label}
      </span>
    </div>
  );
}
