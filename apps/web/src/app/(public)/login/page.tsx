import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { GraduationCap, Briefcase } from "lucide-react";
import { Header } from "@/components/layout/Header";

export const metadata: Metadata = {
  title: "Acessar — SCAE",
};

export default function LoginPage() {
  return (
    <div className="flex flex-col min-h-screen bg-surface">
      <Header />
      <main className="flex flex-col items-center justify-center flex-1 p-20 gap-12">
        <Image src="/logo.png" alt="SCAE" width={180} height={52} priority />

        <h1 className="text-3xl font-bold text-text-primary text-center [font-family:var(--font-poppins),sans-serif]">
          Sistema de Apoio ao Ensino-Aprendizagem
        </h1>

        <p className="text-lg text-text-secondary text-center">
          Como você deseja acessar o sistema?
        </p>

        <div className="flex gap-6">
          <Link
            href="/login/student"
            className="flex flex-col items-center justify-center gap-3 w-90 h-41.25 rounded-xl bg-background border border-border-light py-7 px-6 transition-shadow hover:shadow-md no-underline"
          >
            <GraduationCap
              size={36}
              color="var(--color-primary)"
              aria-hidden="true"
            />
            <span className="text-xl font-bold text-text-primary [font-family:var(--font-poppins),sans-serif]">
              Sou Aluno
            </span>
            <span className="text-base text-text-secondary">
              Acessar com minha matrícula
            </span>
          </Link>

          <Link
            href="/login/staff"
            className="flex flex-col items-center justify-center gap-3 w-90 h-41.25 rounded-xl bg-background border border-border-light py-7 px-6 transition-shadow hover:shadow-md no-underline"
          >
            <Briefcase
              size={36}
              color="var(--color-accent)"
              aria-hidden="true"
            />
            <span className="text-xl font-bold text-text-primary [font-family:var(--font-poppins),sans-serif]">
              Sou Professor ou Gestor
            </span>
            <span className="text-base text-text-secondary">
              Acessar com meu e-mail
            </span>
          </Link>
        </div>
      </main>
    </div>
  );
}
