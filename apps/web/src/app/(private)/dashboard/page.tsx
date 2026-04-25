"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

interface AuthenticatedUser {
  id: string;
  name: string | null;
  role: string;
}

const ROLE_LABEL: Record<string, string> = {
  STUDENT: "Aluno",
  TEACHER: "Professor",
  SCHOOL_MANAGER: "Gestor Escolar",
  MUNICIPAL_MANAGER: "Gestor Municipal",
  ADMIN: "Administrador",
};

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

  const roleLabel =
    ROLE_LABEL[authenticatedUser.role] ?? authenticatedUser.role;
  const welcomeMessage = authenticatedUser.name
    ? `Bem-vindo, ${authenticatedUser.name}!`
    : `Bem-vindo, ${roleLabel}!`;

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      <main className="flex flex-1 items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <h1 className="text-2xl font-bold text-text-primary">
            {welcomeMessage}
          </h1>
          <Button variant="secondary" size="md" onClick={handleLogout}>
            Sair
          </Button>
        </div>
      </main>
    </div>
  );
}
