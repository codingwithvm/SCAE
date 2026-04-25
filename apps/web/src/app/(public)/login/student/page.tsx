"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { InputGroup } from "@/components/ui/InputGroup";
import { DatePicker } from "@/components/ui/DatePicker";
import { Button } from "@/components/ui/Button";

export default function LoginStudentPage() {
  const router = useRouter();

  const [registrationNumber, setRegistrationNumber] = useState("");
  const [birthDate, setBirthDate] = useState<string | undefined>();
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleStudentLoginSubmit(
    event: React.SyntheticEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setErrorMessage(undefined);

    if (!registrationNumber || !birthDate) {
      setErrorMessage("Preencha todos os campos para continuar.");
      return;
    }

    setIsSubmitting(true);

    try {
      const loginResponse = await fetch("/api/v1/auth/login/student", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registrationNumber, birthDate }),
      });

      const loginResponseBody = await loginResponse.json();

      if (!loginResponse.ok) {
        setErrorMessage("Matrícula ou data de nascimento inválidos.");
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
        <div className="flex flex-col gap-4 w-105 bg-background rounded-xl border border-border-light p-7">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold text-text-primary">
              Olá! Vamos começar?
            </h1>
            <p className="text-base text-text-secondary">
              Digite seu número de matrícula e sua data de nascimento para
              entrar.
            </p>
          </div>

          <form
            className="flex flex-col gap-4"
            onSubmit={handleStudentLoginSubmit}
          >
            <InputGroup
              id="enrollment"
              label="Número de matrícula"
              placeholder="Ex: 20241234"
              autoComplete="username"
              required
              value={registrationNumber}
              onChange={(event) => setRegistrationNumber(event.target.value)}
            />
            <DatePicker
              id="birthdate"
              label="Data de nascimento"
              name="birthdate"
              required
              onDateChange={setBirthDate}
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
          </form>
        </div>
      </main>
    </div>
  );
}
