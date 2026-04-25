import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { InputGroup } from "@/components/ui/InputGroup";
import { DatePicker } from "@/components/ui/DatePicker";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Entrar como Aluno — SCAE",
};

export default function LoginStudentPage() {
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

          <form className="flex flex-col gap-4">
            <InputGroup
              id="enrollment"
              label="Número de matrícula"
              placeholder="Ex: 20241234"
              autoComplete="username"
              required
            />
            <DatePicker
              id="birthdate"
              label="Data de nascimento"
              name="birthdate"
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
          </form>
        </div>
      </main>
    </div>
  );
}
