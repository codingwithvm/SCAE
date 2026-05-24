"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import {
  Star,
  Search,
  Zap,
  Trophy,
  PlayCircle,
  Award,
  Medal,
  Sparkles,
  TrendingUp,
  Calculator,
  BookOpen,
  FlaskConical,
  Code,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

interface Badge {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  color: string;
  earned: boolean;
  earnedAt: string | null;
}

interface BadgesResponse {
  badges: Badge[];
  summary: {
    total: number;
    earned: number;
    byCategory: {
      scae_level: number;
      milestone: number;
    };
  };
}

const ICON_MAP: Record<string, React.ComponentType<{ size?: number }>> = {
  Star,
  Search,
  Zap,
  Trophy,
  PlayCircle,
  Award,
  Medal,
  Sparkles,
  TrendingUp,
  Calculator,
  BookOpen,
  FlaskConical,
  Code,
};

export default function BadgesPage() {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [data, setData] = useState<BadgesResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("auth_user");
    if (!storedUser) {
      router.replace("/login");
      return;
    }

    const user = JSON.parse(storedUser);
    if (user.role !== "STUDENT") {
      router.replace("/login");
      return;
    }
    setUserName(user.name ?? "Aluno");

    const token = localStorage.getItem("auth_token");
    fetch("/api/v1/gscae/badges", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => res.json())
      .then((json) => {
        setData(json);
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

  const scaeBadges =
    data?.badges.filter((b) => b.category === "scae_level") ?? [];
  const milestoneBadges =
    data?.badges.filter((b) => b.category === "milestone") ?? [];
  const earnedCount = data?.summary.earned ?? 0;
  const totalCount = data?.summary.total ?? 0;
  const progressPercent =
    totalCount > 0 ? Math.round((earnedCount / totalCount) * 100) : 0;

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
              Minhas Conquistas
            </h1>
            <p className="text-base text-text-secondary font-(family-name:--font-inter)]">
              Acompanhe seu progresso e desbloqueie novos badges.
            </p>
          </div>

          <div className="flex w-full gap-4">
            <div className="flex flex-1 items-center gap-4 rounded-2xl border border-border-light bg-background p-6 shadow-[0_2px_8px_rgba(30,79,174,0.08)]">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-cta">
                <Trophy size={20} className="text-text-on-cta" />
              </div>
              <div>
                <p className="text-3xl font-bold text-text-primary font-(family-name:--font-poppins)]">
                  {earnedCount}
                </p>
                <p className="text-sm text-text-secondary font-(family-name:--font-inter)]">
                  Badges conquistados
                </p>
              </div>
            </div>

            <div className="flex flex-1 items-center gap-4 rounded-2xl border border-border-light bg-background p-6 shadow-[0_2px_8px_rgba(30,79,174,0.08)]">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-cta">
                <Star size={20} className="text-text-on-cta" />
              </div>
              <div>
                <p className="text-3xl font-bold text-text-primary font-(family-name:--font-poppins)]">
                  {data?.summary.byCategory.scae_level ?? 0}
                </p>
                <p className="text-sm text-text-secondary font-(family-name:--font-inter)]">
                  Níveis SCAE
                </p>
              </div>
            </div>

            <div className="flex flex-1 items-center gap-4 rounded-2xl border border-border-light bg-background p-6 shadow-[0_2px_8px_rgba(30,79,174,0.08)]">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-cta">
                <Award size={20} className="text-text-on-cta" />
              </div>
              <div>
                <p className="text-3xl font-bold text-text-primary font-(family-name:--font-poppins)]">
                  {data?.summary.byCategory.milestone ?? 0}
                </p>
                <p className="text-sm text-text-secondary font-(family-name:--font-inter)]">
                  Marcos alcançados
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border-light bg-background p-6 shadow-[0_2px_8px_rgba(30,79,174,0.08)]">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-text-primary font-(family-name:--font-poppins)]">
                Progresso geral
              </p>
              <p className="text-sm text-text-secondary font-(family-name:--font-inter)]">
                {earnedCount} de {totalCount}
              </p>
            </div>
            <div className="h-2.5 w-full rounded-full bg-surface">
              <div
                className="h-2.5 rounded-full bg-cta transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <section className="flex flex-col gap-4">
            <h2 className="text-xl font-semibold text-text-primary font-(family-name:--font-poppins)]">
              Níveis SCAE
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {scaeBadges.map((badge) => (
                <BadgeCard key={badge.id} badge={badge} />
              ))}
            </div>
          </section>

          <section className="flex flex-col gap-4">
            <h2 className="text-xl font-semibold text-text-primary font-(family-name:--font-poppins)]">
              Marcos e Conquistas
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {milestoneBadges.map((badge) => (
                <BadgeCard key={badge.id} badge={badge} />
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function BadgeCard({ badge }: { badge: Badge }) {
  const IconComponent = ICON_MAP[badge.icon] ?? Star;
  const colorClasses = badge.earned
    ? badge.color
    : "bg-surface text-text-muted";

  return (
    <div
      className={`flex flex-col items-center rounded-2xl border p-5 text-center transition-all ${
        badge.earned
          ? "border-border-light bg-background shadow-[0_2px_8px_rgba(30,79,174,0.08)]"
          : "border-border-light bg-background opacity-50"
      }`}
    >
      <div
        className={`mb-3 flex h-12 w-12 items-center justify-center rounded-full ${colorClasses}`}
      >
        <IconComponent size={24} />
      </div>
      <p
        className={`text-sm font-semibold font-(family-name:--font-poppins)] ${
          badge.earned ? "text-text-primary" : "text-text-secondary"
        }`}
      >
        {badge.name}
      </p>
      <p className="mt-1 text-xs text-text-secondary font-(family-name:--font-inter)]">
        {badge.description}
      </p>
      {badge.earned && badge.earnedAt && (
        <p className="mt-2 text-xs text-text-muted font-(family-name:--font-inter)]">
          {new Date(badge.earnedAt).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </p>
      )}
    </div>
  );
}
