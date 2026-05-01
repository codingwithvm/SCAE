"use client";

import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Sparkles,
  Sparkle,
  Star,
  Lightbulb,
  Bell,
  ChevronDown,
  ThumbsUp,
  BicepsFlexed,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

interface GScaeStage {
  name: string;
  level: "gs-strong" | "gs-mid" | "gs-weak";
  description: string;
  tip?: string;
}

interface ProfileData {
  titulo: string;
  cor: string;
  desc: string;
  fortes: string[];
  estrategias?: string[];
  gscae: string;
}

interface ReportData {
  profile: string;
  profileData: ProfileData;
  gscae: GScaeStage[] | null;
  ludic: { emoji: string | null; tag: string | null };
}

const LEVEL_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  "gs-strong": Sparkle,
  "gs-mid": ThumbsUp,
  "gs-weak": BicepsFlexed,
};

const LEVEL_STARS: Record<string, string> = {
  "gs-strong": "★★★",
  "gs-mid": "★★",
  "gs-weak": "★",
};

export default function StudentReportPage({
  params,
}: {
  params: Promise<{ assessmentId: string }>;
}) {
  const { assessmentId } = use(params);
  const router = useRouter();
  const [data, setData] = useState<ReportData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [backUrl, setBackUrl] = useState("/dashboard");

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      router.replace("/login");
      return;
    }

    const stored = localStorage.getItem("auth_user");
    if (stored) {
      const parsed = JSON.parse(stored) as { role?: string };
      if (parsed.role === "TEACHER") setBackUrl("/teacher/students");
      else if (parsed.role === "SCHOOL_MANAGER") setBackUrl("/school/students");
    }

    fetch(`/api/v1/assessments/${assessmentId}/report`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json();
          throw new Error(body.error || "Erro ao carregar relatório");
        }
        return res.json();
      })
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [assessmentId, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface px-8">
        <p className="text-text-secondary text-center">
          {error || "Relatório não encontrado"}
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push(backUrl)}
        >
          Voltar ao início
        </Button>
      </div>
    );
  }

  const { profileData, gscae, ludic } = data;

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      <header className="flex items-center justify-between h-16 px-8 bg-background border-b border-border-light shrink-0">
        <Link href={backUrl} aria-label="Início — SCAE">
          <Image src="/logo.png" alt="SCAE" width={116} height={32} priority />
        </Link>
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center h-10 w-10 rounded-full bg-surface">
            <Bell size={18} className="text-text-secondary" />
          </div>
          <div className="flex items-center justify-center h-9 w-9 rounded-full bg-primary">
            <span className="text-sm font-semibold text-white font-(family-name:--font-poppins)]">A</span>
          </div>
          <span className="text-sm font-medium text-text-primary font-(family-name:--font-inter)]">Aluno</span>
          <ChevronDown size={16} className="text-text-secondary" />
        </div>
      </header>

      <main className="flex flex-col gap-10 w-full max-w-[800px] mx-auto py-12 px-8">
        <section className="flex flex-col items-center gap-4 text-center">
          <div
            className="flex h-20 w-20 items-center justify-center rounded-full text-4xl"
            style={{ backgroundColor: profileData.cor + "20" }}
          >
            {ludic.emoji || "⭐"}
          </div>
          <h1 className="text-2xl font-semibold text-text-primary font-(family-name:--font-poppins)]">
            {profileData.titulo}
          </h1>
          {ludic.tag && (
            <p className="text-base text-text-secondary font-(family-name:--font-inter)] max-w-[500px]">
              {ludic.tag}
            </p>
          )}
        </section>

        <section className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Sparkles size={20} className="text-primary" />
            <h2 className="text-lg font-semibold text-text-primary font-(family-name:--font-poppins)]">
              O que me descreve bem
            </h2>
          </div>
          <div className="flex flex-col gap-3">
            {profileData.fortes.slice(0, 3).map((item, i) => (
              <div
                key={i}
                className="rounded-lg border border-border-light bg-background p-4 flex items-start gap-3"
              >
                <Star size={18} className="text-primary shrink-0" />
                <p className="text-sm text-text-secondary font-(family-name:--font-inter)]">
                  {item}
                </p>
              </div>
            ))}
          </div>
        </section>

        {gscae && (
          <section className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold text-text-primary font-(family-name:--font-poppins)]">
              Quando eu aprendo melhor
            </h2>
            <div className="grid grid-cols-4 gap-4">
              {gscae.map((stage) => (
                <div
                  key={stage.name}
                  className="flex flex-col items-center justify-between gap-2 rounded-lg border border-border-light bg-background p-5 text-center"
                >
                  {(() => {
                    const Icon = LEVEL_ICONS[stage.level];
                    return <Icon size={28} className="text-text-primary" />;
                  })()}
                  <p className="text-sm font-semibold text-text-primary">
                    {stage.name}
                  </p>
                  <p className="text-xs text-text-secondary">
                    {stage.description}
                  </p>
                  <p className="text-xs text-primary">
                    {LEVEL_STARS[stage.level]}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {profileData.estrategias && profileData.estrategias.length > 0 && (
          <section className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Lightbulb size={20} className="text-primary" />
              <h2 className="text-lg font-semibold text-text-primary font-(family-name:--font-poppins)]">
                Dicas para aprender ainda mais
              </h2>
            </div>
            <div className="flex flex-col gap-3">
              {profileData.estrategias.slice(0, 3).map((item, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-border-light bg-background p-4 flex items-start gap-3"
                >
                  <Lightbulb size={16} className="text-primary shrink-0" />
                  <p className="text-sm text-text-secondary font-(family-name:--font-inter)]">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {profileData.gscae && (
          <section className="flex flex-col gap-3 rounded-2xl border border-border-light bg-background p-6">
            <h3 className="text-base font-semibold text-text-primary font-(family-name:--font-poppins)]">
              Próximo Passo: Simulador G-SCAE
            </h3>
            <p className="text-sm text-text-secondary font-(family-name:--font-inter)] leading-relaxed">
              {profileData.gscae}
            </p>
            <div className="flex items-center gap-2 pt-2">
              {["Percebe", "Entende", "Aplica", "Resolve"].map((s, i) => (
                <span
                  key={s}
                  className="flex items-center gap-1 text-xs font-medium text-primary"
                >
                  {i > 0 && <span className="text-text-secondary">→</span>}
                  {s}
                </span>
              ))}
            </div>
          </section>
        )}

        <Button
          variant="primary"
          size="md"
          className="w-full"
          onClick={() => router.push(backUrl)}
        >
          Voltar ao início
        </Button>
      </main>
    </div>
  );
}
