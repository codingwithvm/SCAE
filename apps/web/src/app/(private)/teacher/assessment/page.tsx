"use client";

import { useRouter } from "next/navigation";
import { ClipboardList, ListChecks, Timer, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function TeacherAssessmentIntroPage() {
  const router = useRouter();

  function handleStart() {
    router.push("/teacher/quiz");
  }

  return (
    <div className="flex flex-1 items-center justify-center py-10">
      <div className="flex flex-col items-center gap-6 w-120">
        {/* Icon */}
        <div
          className="flex h-14 w-14 items-center justify-center rounded-full bg-primary"
          aria-hidden="true"
        >
          <ClipboardList size={26} className="text-white" />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-semibold text-text-primary text-center font-(family-name:--font-poppins)]">
          Descubra seu perfil profissional
        </h1>

        {/* Description */}
        <div className="flex flex-col gap-3 text-center">
          <p className="text-base text-text-secondary font-(family-name:--font-inter)]">
            Você vai responder 32 perguntas sobre seus hábitos de aprendizagem.
            Não existem respostas certas ou erradas.
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
            <ListChecks size={20} className="text-primary" aria-hidden="true" />
            <span className="text-sm font-medium text-text-primary font-(family-name:--font-inter)]">
              Duas etapas: MCEES (32 questões) e MEES (16 questões)
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
              Você pode voltar e mudar suas respostas
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
    </div>
  );
}
