"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import {
  Loader2,
  ArrowLeft,
  Calculator,
  BookOpen,
  FlaskConical,
  Code,
  ArrowRight,
} from "lucide-react";

interface Activity {
  id: string;
  habilidadeCode: string;
  habilidadeDesc: string;
  discipline: string;
  grade: string;
  title: string;
  activityVersion: string;
}

const DISCIPLINE_META: Record<
  string,
  {
    label: string;
    color: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
  }
> = {
  MA: {
    label: "Matemática",
    color: "bg-blue-100 text-blue-700",
    icon: Calculator,
  },
  LP: {
    label: "Língua Portuguesa",
    color: "bg-amber-100 text-amber-700",
    icon: BookOpen,
  },
  CI: {
    label: "Ciências",
    color: "bg-green-100 text-green-700",
    icon: FlaskConical,
  },
  IN: {
    label: "Informática",
    color: "bg-purple-100 text-purple-700",
    icon: Code,
  },
};

export default function ActivitiesPage() {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [activities, setActivities] = useState<Activity[]>([]);
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
    fetch("/api/v1/gscae/activities?limit=50", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => res.json())
      .then((data) => {
        setActivities(data.activities ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [router]);

  function handleLogout() {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    localStorage.removeItem("quiz_profile");
    router.replace("/login");
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <Header variant="app" userName={userName} onLogout={handleLogout} />

      <main className="flex flex-1 flex-col items-center gap-6 px-20 py-8">
        <div className="flex w-full flex-col gap-6">
          <Link
            href="/dashboard"
            className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors no-underline font-(family-name:--font-inter)]"
          >
            <ArrowLeft size={16} />
            Voltar ao Dashboard
          </Link>

          <div className="flex w-full flex-col gap-1">
            <h1 className="text-2xl font-semibold text-text-primary font-(family-name:--font-poppins)]">
              Atividades G-SCAE
            </h1>
            <p className="text-base text-text-secondary font-(family-name:--font-inter)]">
              Escolha uma atividade para praticar e evoluir suas habilidades.
            </p>
          </div>

          {activities.length === 0 ? (
            <div className="flex flex-col items-center gap-4 rounded-2xl border border-border-light bg-background p-12 shadow-[0_2px_8px_rgba(30,79,174,0.08)]">
              <p className="text-base text-text-secondary font-(family-name:--font-inter)]">
                Nenhuma atividade disponível no momento.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {activities.map((activity) => (
                <ActivityCard key={activity.id} activity={activity} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function ActivityCard({ activity }: { activity: Activity }) {
  const meta = DISCIPLINE_META[activity.discipline] ?? {
    label: activity.discipline,
    color: "bg-gray-100 text-gray-700",
    icon: BookOpen,
  };
  const IconComponent = meta.icon;

  return (
    <div className="flex flex-col rounded-2xl border border-border-light bg-background shadow-[0_2px_8px_rgba(30,79,174,0.08)] transition-all hover:shadow-[0_4px_16px_rgba(30,79,174,0.12)]">
      <div className="flex flex-col gap-3 p-6">
        <div className="flex items-start justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-cta">
            <IconComponent size={20} className="text-text-on-cta" />
          </div>
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium font-(family-name:--font-inter)] ${meta.color}`}
          >
            {meta.label}
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <p className="text-sm font-semibold text-text-primary font-(family-name:--font-poppins)]">
            {activity.title}
          </p>
          <p className="text-xs text-text-secondary font-(family-name:--font-inter)]">
            {activity.habilidadeCode} — {activity.grade}º ano
          </p>
        </div>

        <p className="text-xs text-text-secondary font-(family-name:--font-inter)] line-clamp-2">
          {activity.habilidadeDesc}
        </p>
      </div>

      <div className="border-t border-border-light px-6 py-4">
        <Button variant="secondary" size="sm" className="w-full" asChild>
          <Link
            href={`/gscae/activities/${activity.id}/play`}
            className="flex items-center justify-center gap-2"
          >
            Iniciar atividade
            <ArrowRight size={16} />
          </Link>
        </Button>
      </div>
    </div>
  );
}
