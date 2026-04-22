import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--color-primary)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c3 3 9 3 12 0v-5" />
            </svg>
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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--color-accent)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
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
