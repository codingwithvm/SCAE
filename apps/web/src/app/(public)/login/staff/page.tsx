"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { InputGroup } from "@/components/ui/InputGroup";
import { Button } from "@/components/ui/Button";

export default function LoginStaffPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleStaffLoginSubmit(
    event: React.SyntheticEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setErrorMessage(undefined);

    if (!email || !password) {
      setErrorMessage("Preencha todos os campos para continuar.");
      return;
    }

    setIsSubmitting(true);

    try {
      const loginResponse = await fetch("/api/v1/auth/login/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const loginResponseBody = await loginResponse.json();

      if (!loginResponse.ok) {
        setErrorMessage("E-mail ou senha inválidos.");
        return;
      }

      localStorage.setItem("auth_token", loginResponseBody.token);
      localStorage.setItem("auth_user", JSON.stringify(loginResponseBody.user));

      router.push("/dashboard");
    } catch {
      setErrorMessage("Erro ao conectar com o servidor. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      <Header variant="auth" backHref="/login" />

      <main className="flex flex-1 items-center justify-center px-8 py-12">
        <div className="flex flex-col items-center gap-5">
          <div className="flex flex-col gap-4 w-110 bg-background rounded-xl border border-border-light p-7">
            <h1 className="text-2xl font-bold text-text-primary">
              Acesso Institucional
            </h1>

            <form
              className="flex flex-col gap-4"
              onSubmit={handleStaffLoginSubmit}
            >
              <InputGroup
                id="email"
                label="E-mail"
                type="email"
                placeholder="professor@escola.edu.br"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
              <InputGroup
                id="password"
                label="Senha"
                type="password"
                placeholder="Sua senha"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />

              {errorMessage && (
                <p className="text-sm text-red-600">{errorMessage}</p>
              )}

              <Button
                variant="primary"
                size="md"
                type="submit"
                className="w-full mt-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Entrando..." : "Entrar"}
              </Button>
              <Link
                href="/login/staff/forgot-password"
                className="text-sm font-medium text-primary text-center no-underline hover:opacity-75 transition-opacity"
              >
                Esqueceu sua senha?
              </Link>
            </form>
          </div>

          <p className="text-sm text-text-secondary text-center w-110">
            Acesso somente para profissionais cadastrados pela gestão escolar.
          </p>
        </div>
      </main>
    </div>
  );
}
