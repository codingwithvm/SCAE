"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sparkles, BookOpen, ArrowRight, Loader2, Trophy } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { type ProfileName } from "@/lib/quiz/profile";
import { PROFILE_DATA } from "@/lib/quiz/profile-data";

interface AuthenticatedUser {
  id: string;
  name: string | null;
  role: string;
}

interface PendingRelease {
  releaseId: string;
  instrument: string;
}

const INSTRUMENT_LABELS: Record<string, string> = {
  MCEES_1A4: "MCEES — 1º ao 4º ano",
  MCEES_5A9: "MCEES — 5º ao 9º ano",
  MCEES_PROF: "MCEES — Professor",
  MEES_PROF: "MEES — Professor",
};

export default function DashboardPage() {
  const router = useRouter();
  const [authenticatedUser, setAuthenticatedUser] =
    useState<AuthenticatedUser | null>(null);
  const [quizProfile, setQuizProfile] = useState<ProfileName | null>(null);
  const [pendingReleases, setPendingReleases] = useState<PendingRelease[]>([]);
  const [loadingReleases, setLoadingReleases] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("auth_user");

    if (!storedUser) {
      router.replace("/login");
      return;
    }

    setAuthenticatedUser(JSON.parse(storedUser) as AuthenticatedUser);

    const storedProfile = localStorage.getItem(
      "quiz_profile",
    ) as ProfileName | null;
    setQuizProfile(storedProfile);

    const token = localStorage.getItem("auth_token");
    fetch("/api/v1/assessments/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({}),
    })
      .then((res) => res.json())
      .then((data: { allowed: boolean; releases?: PendingRelease[] }) => {
        if (data.allowed && data.releases) {
          setPendingReleases(data.releases);
        }
        setLoadingReleases(false);
      })
      .catch(() => {
        setLoadingReleases(false);
      });
  }, [router]);

  function handleLogout() {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    localStorage.removeItem("quiz_profile");
    router.replace("/login");
  }

  function handleStartAssessment(release: PendingRelease) {
    const slug = release.instrument.toLowerCase().replace("_", "_");
    router.push(`/assessment/${slug}`);
  }

  if (!authenticatedUser) {
    return null;
  }

  const firstName = authenticatedUser.name?.split(" ")[0] ?? "Aluno";
  const profileData = quizProfile ? PROFILE_DATA[quizProfile] : null;
  const hasReleases = pendingReleases.length > 0;

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      <Header
        variant="app"
        userName={authenticatedUser.name ?? firstName}
        onLogout={handleLogout}
      />

      <main className="flex flex-1 flex-col items-center gap-6 px-20 py-8">
        <div className="flex w-full flex-col items-center gap-2">
          <h1 className="text-2xl font-semibold text-text-primary font-(family-name:--font-poppins)]">
            Olá, {firstName}!
          </h1>
          <p className="text-base text-text-secondary font-(family-name:--font-inter)]">
            Bem-vindo ao SCAE. Veja o que temos para você.
          </p>
        </div>

        <div className="flex w-full gap-6">
          <div className="flex flex-1 flex-col rounded-2xl border border-border-light bg-background shadow-[0_2px_8px_rgba(30,79,174,0.08)]">
            <div className="flex flex-col gap-1 px-6 py-5">
              <h2 className="text-lg font-semibold text-text-primary font-(family-name:--font-poppins)]">
                {profileData
                  ? "Seu perfil de aprendizagem"
                  : "Descubra seu perfil de aprendizagem!"}
              </h2>
              <p className="text-sm text-text-secondary font-(family-name:--font-inter)]">
                {profileData
                  ? `Você é ${profileData.name}. Refaça o questionário quando quiser.`
                  : "Responda o questionário para saber como você aprende melhor."}
              </p>
            </div>

            <div className="flex flex-col items-center gap-5 px-6 pb-5 pt-0">
              {profileData ? (
                <span
                  className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold"
                  style={{
                    backgroundColor: profileData.badgeBg,
                    color: profileData.badgeText,
                  }}
                >
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: profileData.color }}
                    aria-hidden="true"
                  />
                  {profileData.name}
                </span>
              ) : (
                <Sparkles
                  size={48}
                  className="text-primary"
                  aria-hidden="true"
                />
              )}

              {loadingReleases ? (
                <div className="flex items-center gap-2 py-2">
                  <Loader2
                    size={16}
                    className="animate-spin text-primary"
                    aria-hidden="true"
                  />
                  <span className="text-sm text-text-secondary font-(family-name:--font-inter)]">
                    Verificando avaliações...
                  </span>
                </div>
              ) : hasReleases ? (
                <div className="flex w-full flex-col gap-2">
                  {pendingReleases.map((release) => (
                    <Button
                      key={release.releaseId}
                      variant="primary"
                      size="md"
                      className="w-full"
                      onClick={() => handleStartAssessment(release)}
                    >
                      {pendingReleases.length === 1
                        ? profileData
                          ? "Refazer avaliação"
                          : "Iniciar avaliação"
                        : `Iniciar ${INSTRUMENT_LABELS[release.instrument] ?? release.instrument}`}
                    </Button>
                  ))}
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="md"
                  className="w-full opacity-50 cursor-not-allowed"
                  disabled
                >
                  Nenhuma avaliação disponível
                </Button>
              )}
            </div>
          </div>

          <div className="flex flex-1 flex-col rounded-2xl border border-border-light bg-background shadow-[0_2px_8px_rgba(30,79,174,0.08)]">
            <div className="flex flex-col gap-1 px-6 py-5">
              <h2 className="text-lg font-semibold text-text-primary font-(family-name:--font-poppins)]">
                Suas atividades
              </h2>
              <p className="text-sm text-text-secondary font-(family-name:--font-inter)]">
                {quizProfile
                  ? "Atividades selecionadas para o seu perfil."
                  : "Primeiro, descubra seu perfil respondendo o questionário."}
              </p>
            </div>

            <div className="flex flex-col items-center gap-5 px-6 pb-5 pt-0">
              <BookOpen
                size={48}
                className={quizProfile ? "text-accent" : "text-text-muted"}
                aria-hidden="true"
              />
              {quizProfile ? (
                <Button
                  variant="secondary"
                  size="md"
                  className="w-full"
                  asChild
                >
                  <Link
                    href="/activities"
                    className="flex items-center justify-center gap-2"
                  >
                    Acessar atividades
                    <ArrowRight size={18} aria-hidden="true" />
                  </Link>
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="md"
                  className="w-full opacity-50 cursor-not-allowed"
                  disabled
                >
                  Responder questionário primeiro
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="flex w-full gap-6">
          <div className="flex flex-1 flex-col rounded-2xl border border-border-light bg-background shadow-[0_2px_8px_rgba(30,79,174,0.08)]">
            <div className="flex flex-col gap-1 px-6 py-5">
              <h2 className="text-lg font-semibold text-text-primary font-(family-name:--font-poppins)]">
                Minhas Conquistas
              </h2>
              <p className="text-sm text-text-secondary font-(family-name:--font-inter)]">
                Veja seus badges e acompanhe seu progresso.
              </p>
            </div>

            <div className="flex flex-col items-center gap-5 px-6 pb-5 pt-0">
              <Trophy size={48} className="text-accent" aria-hidden="true" />
              <Button variant="secondary" size="md" className="w-full" asChild>
                <Link
                  href="/gscae/badges"
                  className="flex items-center justify-center gap-2"
                >
                  Ver conquistas
                  <ArrowRight size={18} aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </div>
          <div className="flex-1" />
        </div>
      </main>
    </div>
  );
}
