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
    setUserName(user.name ?? "Aluno");

    fetch("/api/v1/gscae/badges")
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

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <Header variant="app" userName={userName} onLogout={handleLogout} />

      <main className="flex-1 px-8 py-8">
        <div className="mx-auto max-w-4xl">
          <Link
            href="/dashboard"
            className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors no-underline"
          >
            <ArrowLeft size={16} />
            Voltar ao Dashboard
          </Link>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-text-primary">
              Minhas Conquistas
            </h1>
            <p className="mt-1 text-sm text-text-secondary">
              {data?.summary.earned ?? 0} de {data?.summary.total ?? 0} badges
              conquistados
            </p>
          </div>

          <div className="mb-4 flex gap-3">
            <div className="rounded-lg border border-border-light bg-background px-4 py-3">
              <p className="text-xs text-text-secondary">Nível SCAE</p>
              <p className="text-lg font-bold text-primary">
                {data?.summary.byCategory.scae_level ?? 0}
              </p>
            </div>
            <div className="rounded-lg border border-border-light bg-background px-4 py-3">
              <p className="text-xs text-text-secondary">Marcos</p>
              <p className="text-lg font-bold text-primary">
                {data?.summary.byCategory.milestone ?? 0}
              </p>
            </div>
          </div>

          <section className="mb-8">
            <h2 className="mb-4 text-lg font-semibold text-text-primary">
              Níveis SCAE
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {scaeBadges.map((badge) => (
                <BadgeCard key={badge.id} badge={badge} />
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-lg font-semibold text-text-primary">
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
  const colorClasses = badge.earned ? badge.color : "bg-gray-100 text-gray-400";

  return (
    <div
      className={`flex flex-col items-center rounded-xl border p-4 text-center transition-all ${
        badge.earned
          ? "border-border-light bg-background shadow-sm"
          : "border-border-light/50 bg-background/50 opacity-60"
      }`}
    >
      <div
        className={`mb-3 flex h-12 w-12 items-center justify-center rounded-full ${colorClasses}`}
      >
        <IconComponent size={24} />
      </div>
      <p
        className={`text-sm font-semibold ${badge.earned ? "text-text-primary" : "text-text-secondary"}`}
      >
        {badge.name}
      </p>
      <p className="mt-1 text-xs text-text-secondary">{badge.description}</p>
      {badge.earned && badge.earnedAt && (
        <p className="mt-2 text-[11px] text-text-secondary/60">
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
