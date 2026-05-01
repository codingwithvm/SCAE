"use client";

import React, { useEffect, useState, use } from "react";
import Image from "next/image";
import {
  Sparkles,
  Sparkle,
  Star,
  Lightbulb,
  ThumbsUp,
  BicepsFlexed,
} from "lucide-react";

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
}

interface ReportData {
  profile: string;
  profileData: ProfileData;
  gscae: GScaeStage[] | null;
  ludic: { emoji: string | null; tag: string | null };
}

const LEVEL_ICONS: Record<
  string,
  React.ComponentType<{ size?: number; className?: string }>
> = {
  "gs-strong": Sparkle,
  "gs-mid": ThumbsUp,
  "gs-weak": BicepsFlexed,
};

const LEVEL_STARS: Record<string, string> = {
  "gs-strong": "★★★",
  "gs-mid": "★★",
  "gs-weak": "★",
};

export default function PublicReportPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const [data, setData] = useState<ReportData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/v1/report/public/${token}`)
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
  }, [token]);

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
        <Image src="/logo.png" alt="SCAE" width={116} height={32} />
        <p className="text-text-secondary text-center">
          {error || "Relatório não encontrado"}
        </p>
      </div>
    );
  }

  const { profileData, gscae, ludic } = data;

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      <header className="flex items-center justify-center h-16 px-8 bg-background border-b border-border-light shrink-0">
        <Image src="/logo.png" alt="SCAE" width={116} height={32} priority />
      </header>

      <main className="flex flex-col gap-10 w-full max-w-200 mx-auto py-12 px-8">
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
            <p className="text-base text-text-secondary font-(family-name:--font-inter)] max-w-125">
              {ludic.tag}
            </p>
          )}
          <p className="text-sm text-text-secondary font-(family-name:--font-inter)] leading-relaxed">
            {profileData.desc}
          </p>
        </section>

        <section className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Sparkles size={20} className="text-primary" />
            <h2 className="text-lg font-semibold text-text-primary font-(family-name:--font-poppins)]">
              O que descreve bem o(a) aluno(a)
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
              Como aprende melhor
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
                Dicas para ajudar no aprendizado
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

        <footer className="text-center pt-6 border-t border-border-light">
          <p className="text-xs text-text-secondary">
            Relatório gerado pelo SCAE — Sistema de Classificação de
            Aprendizagem por Estilos
          </p>
        </footer>
      </main>
    </div>
  );
}
