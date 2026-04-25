import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { InputGroup } from "@/components/ui/InputGroup";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Acesso do Professor — SCAE",
};

export default function LoginStaffPage() {
  return (
    <div className="flex flex-col min-h-screen bg-surface">
      <Header variant="auth" backHref="/login" />

      <main className="flex flex-1 items-center justify-center px-8 py-12">
        <div className="flex flex-col items-center gap-5">
          <div className="flex flex-col gap-4 w-110 bg-background rounded-xl border border-border-light p-7">
            <h1 className="text-2xl font-bold text-text-primary">
              Acesso Institucional
            </h1>

            <form className="flex flex-col gap-4">
              <InputGroup
                id="email"
                label="E-mail"
                type="email"
                placeholder="professor@escola.edu.br"
                autoComplete="email"
                required
              />
              <InputGroup
                id="password"
                label="Senha"
                type="password"
                placeholder="Sua senha"
                autoComplete="current-password"
                required
              />
              <Button
                variant="primary"
                size="md"
                type="submit"
                className="w-full mt-2"
              >
                Entrar
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
