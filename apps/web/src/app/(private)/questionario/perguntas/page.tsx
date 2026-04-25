"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  QUIZ_QUESTIONS,
  SCALE_OPTIONS,
  type ScaleValue,
} from "@/lib/quiz/questions";

const TOTAL_QUESTIONS = QUIZ_QUESTIONS.length;

export default function QuizQuestionsPage() {
  const router = useRouter();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, ScaleValue>>({});

  const currentQuestion = QUIZ_QUESTIONS[currentQuestionIndex];
  const currentAnswer = answers[currentQuestion.id];
  const progressPercent = Math.round(
    (currentQuestionIndex / TOTAL_QUESTIONS) * 100,
  );
  const isFirstQuestion = currentQuestionIndex === 0;
  const isLastQuestion = currentQuestionIndex === TOTAL_QUESTIONS - 1;

  function handleSelectOption(scaleValue: ScaleValue) {
    setAnswers((previousAnswers) => ({
      ...previousAnswers,
      [currentQuestion.id]: scaleValue,
    }));
  }

  function handleNext() {
    if (isLastQuestion) {
      router.push("/questionario/resultado");
      return;
    }

    setCurrentQuestionIndex((previousIndex) => previousIndex + 1);
  }

  function handlePrevious() {
    if (isFirstQuestion) return;
    setCurrentQuestionIndex((previousIndex) => previousIndex - 1);
  }

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      {/* Top bar */}
      <header className="flex items-center justify-between h-18 px-8 bg-background border-b border-border-light shrink-0">
        <div className="flex flex-col gap-1.5 w-75">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-text-primary font-(family-name:--font-inter)]">
              Pergunta {currentQuestionIndex + 1} de {TOTAL_QUESTIONS}
            </span>
            <span className="text-sm font-semibold text-primary font-(family-name:--font-inter)]">
              {currentQuestionIndex + 1}/{TOTAL_QUESTIONS}
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-surface overflow-hidden">
            <div
              className="h-full rounded-full bg-linear-to-b from-cta to-accent transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div
          className="flex h-10 w-10 items-center justify-center rounded-full bg-primary"
          aria-hidden="true"
        >
          <Volume2 size={20} className="text-white" />
        </div>
      </header>

      {/* Body */}
      <main className="flex flex-1 items-center justify-center px-8 py-10">
        <div className="flex flex-col gap-8 w-150">
          {/* Pergunta */}
          <h1 className="text-xl font-semibold text-text-primary text-center font-(family-name:--font-poppins)]">
            {currentQuestion.statement}
          </h1>

          {/* Opções de escala */}
          <div className="flex flex-col gap-3">
            {SCALE_OPTIONS.map((scaleOption) => {
              const isSelected = currentAnswer === scaleOption.value;

              return (
                <button
                  key={scaleOption.value}
                  type="button"
                  onClick={() => handleSelectOption(scaleOption.value)}
                  className={[
                    "flex items-center gap-4 w-full h-14 px-5 rounded-2xl border text-left transition-colors",
                    isSelected
                      ? "bg-[#EDF9F5] border-cta border-2"
                      : "bg-background border-border hover:border-border-light",
                  ].join(" ")}
                >
                  {/* Radio dot */}
                  <div
                    className={[
                      "shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
                      isSelected
                        ? "bg-cta border-cta"
                        : "bg-surface border-border",
                    ].join(" ")}
                  >
                    {isSelected && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>

                  <span
                    className={[
                      "text-base font-(family-name:--font-inter)] text-text-primary",
                      isSelected ? "font-medium" : "font-normal",
                    ].join(" ")}
                  >
                    {scaleOption.label}
                  </span>

                  {isSelected && (
                    <svg
                      className="ml-auto text-cta-dark"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>

          {/* Navegação */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {!isFirstQuestion ? (
                <Button
                  variant="outline"
                  size="md"
                  onClick={handlePrevious}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft size={18} aria-hidden="true" />
                  Anterior
                </Button>
              ) : (
                <Link
                  href="/questionario"
                  className="flex items-center gap-1.5 text-sm font-medium text-primary hover:opacity-75 transition-opacity no-underline"
                >
                  <ArrowLeft size={18} aria-hidden="true" />
                  Voltar
                </Link>
              )}
            </div>

            <Button
              variant="primary"
              size="md"
              onClick={handleNext}
              className="flex items-center gap-2"
            >
              {isLastQuestion ? "Finalizar" : "Próxima"}
              <ArrowRight size={18} aria-hidden="true" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
