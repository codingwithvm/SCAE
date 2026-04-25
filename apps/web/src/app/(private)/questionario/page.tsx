"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Volume2, ListChecks, Timer, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function QuizIntroPage() {
  const router = useRouter();

  function handleStart() {
    router.push("/questionario/perguntas");
  }

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      {/* Header */}
      <header className="flex items-center justify-between h-16 px-8 bg-background border-b border-border-light shrink-0">
        <Link href="/dashboard" aria-label="Início — SCAE">
          <Image src="/logo.png" alt="SCAE" width={116} height={32} priority />
        </Link>

        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 text-sm font-medium text-primary hover:opacity-75 transition-opacity no-underline"
        >
          <ArrowLeft size={18} aria-hidden="true" />
          Voltar
        </Link>
      </header>

      {/* Body */}
      <main className="flex flex-1 items-center justify-center px-8 py-10">
        <div className="flex flex-col items-center gap-6 w-120">
          {/* Ícone de áudio */}
          <div
            className="flex h-14 w-14 items-center justify-center rounded-full bg-primary"
            aria-hidden="true"
          >
            <Volume2 size={26} className="text-white" />
          </div>

          {/* Título */}
          <h1 className="text-2xl font-semibold text-text-primary text-center font-(family-name:--font-poppins)]">
            Vamos descobrir como você aprende melhor!
          </h1>

          {/* Instruções */}
          <div className="flex flex-col gap-3 text-center">
            <p className="text-base text-text-secondary font-(family-name:--font-inter)]">
              Você vai responder 16 perguntas simples. Não existem respostas
              certas ou erradas.
            </p>
            <p className="text-base text-text-secondary font-(family-name:--font-inter)]">
              Escolha a opção que mais combina com você.
            </p>
            <p className="text-base text-text-secondary font-(family-name:--font-inter)]">
              Você pode parar a qualquer momento e continuar depois.
            </p>
          </div>

          {/* Highlights */}
          <div className="flex w-full flex-col gap-3 rounded-2xl border border-border-light bg-background p-6">
            <div className="flex items-center gap-3">
              <ListChecks
                size={20}
                className="text-primary"
                aria-hidden="true"
              />
              <span className="text-sm font-medium text-text-primary font-(family-name:--font-inter)]">
                São 16 perguntas
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Timer size={20} className="text-primary" aria-hidden="true" />
              <span className="text-sm font-medium text-text-primary font-(family-name:--font-inter)]">
                Sem tempo limite
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Undo2 size={20} className="text-primary" aria-hidden="true" />
              <span className="text-sm font-medium text-text-primary font-(family-name:--font-inter)]">
                Você pode voltar e mudar
              </span>
            </div>
          </div>

          {/* CTA */}
          <Button
            variant="primary"
            size="md"
            className="w-full"
            onClick={handleStart}
          >
            Começar agora
          </Button>
        </div>
      </main>
    </div>
  );
}
