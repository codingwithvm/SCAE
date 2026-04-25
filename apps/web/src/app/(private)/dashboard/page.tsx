"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sparkles, BookOpen } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";

interface AuthenticatedUser {
  id: string;
  name: string | null;
  role: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [authenticatedUser, setAuthenticatedUser] =
    useState<AuthenticatedUser | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("auth_user");

    if (!storedUser) {
      router.replace("/login");
      return;
    }

    setAuthenticatedUser(JSON.parse(storedUser) as AuthenticatedUser);
  }, [router]);

  function handleLogout() {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    router.replace("/login");
  }

  if (!authenticatedUser) {
    return null;
  }

  const firstName = authenticatedUser.name?.split(" ")[0] ?? "Aluno";

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      <Header
        variant="app"
        userName={authenticatedUser.name ?? firstName}
        onLogout={handleLogout}
      />

      <main className="flex flex-1 flex-col items-center gap-6 px-20 py-8">
        {/* Saudação */}
        <div className="flex w-full flex-col items-center gap-2">
          <h1 className="text-2xl font-semibold text-text-primary font-(family-name:--font-poppins)]">
            Olá, {firstName}!
          </h1>
          <p className="text-base text-text-secondary font-(family-name:--font-inter)]">
            Bem-vindo ao SCAE. Veja o que temos para você.
          </p>
        </div>

        {/* Cards */}
        <div className="flex w-full gap-6">
          {/* Card — Perfil de aprendizagem */}
          <div className="flex flex-1 flex-col rounded-2xl border border-border-light bg-background shadow-[0_2px_8px_rgba(30,79,174,0.08)]">
            <div className="flex flex-col gap-1 px-6 py-5">
              <h2 className="text-lg font-semibold text-text-primary font-(family-name:--font-poppins)]">
                Descubra seu perfil de aprendizagem!
              </h2>
              <p className="text-sm text-text-secondary font-(family-name:--font-inter)]">
                Responda o questionário para saber como você aprende melhor.
              </p>
            </div>

            <div className="flex flex-col items-center gap-5 px-6 pb-5 pt-0">
              <Sparkles size={48} className="text-primary" aria-hidden="true" />
              <Button variant="primary" size="md" className="w-full" asChild>
                <Link href="/quiz">Começar questionário</Link>
              </Button>
            </div>
          </div>

          {/* Card — Atividades */}
          <div className="flex flex-1 flex-col rounded-2xl border border-border-light bg-background shadow-[0_2px_8px_rgba(30,79,174,0.08)]">
            <div className="flex flex-col gap-1 px-6 py-5">
              <h2 className="text-lg font-semibold text-text-primary font-(family-name:--font-poppins)]">
                Suas atividades
              </h2>
              <p className="text-sm text-text-secondary font-(family-name:--font-inter)]">
                Primeiro, descubra seu perfil respondendo o questionário.
              </p>
            </div>

            <div className="flex flex-col items-center gap-5 px-6 pb-5 pt-0">
              <BookOpen size={48} className="text-accent" aria-hidden="true" />
              <Button variant="secondary" size="md" className="w-full" asChild>
                <Link href="/quiz">Responder questionário</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
