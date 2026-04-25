"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, LogOut } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  TEACHER_MEES_QUESTIONS,
  TEACHER_MEES_TOTAL,
  type TeacherAnswerValue,
} from "@/lib/teacher/quiz";

const STORAGE_KEY = "teacher_mees_answers";

export default function TeacherMeesQuizPage() {
  const router = useRouter();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, TeacherAnswerValue>>(
    () => {
      if (typeof window === "undefined") return {};
      const stored = sessionStorage.getItem(STORAGE_KEY);
      return stored
        ? (JSON.parse(stored) as Record<number, TeacherAnswerValue>)
        : {};
    },
  );

  const question = TEACHER_MEES_QUESTIONS[currentIndex];
  const currentAnswer = answers[question.id];
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === TEACHER_MEES_TOTAL - 1;
  const progressPercent = Math.round((currentIndex / TEACHER_MEES_TOTAL) * 100);

  function handleSelect(value: TeacherAnswerValue) {
    setAnswers((prev) => {
      const next = { ...prev, [question.id]: value };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }

  function handleNext() {
    if (!currentAnswer) return;
    if (isLast) {
      router.push("/teacher/profile");
      return;
    }
    setCurrentIndex((i) => i + 1);
  }

  function handlePrevious() {
    if (isFirst) {
      router.push("/teacher/quiz");
      return;
    }
    setCurrentIndex((i) => i - 1);
  }

  function handleSaveAndExit() {
    router.push("/teacher/dashboard");
  }

  const alternatives: {
    value: TeacherAnswerValue;
    label: string;
    text: string;
  }[] = [
    { value: 1, label: "A", text: question.optionA },
    { value: 2, label: "B", text: question.optionB },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      {/* Header */}
      <header className="flex items-center justify-between h-16 px-8 bg-background border-b border-border-light shrink-0">
        {/* Logo */}
        <Link href="/teacher/dashboard" aria-label="Início — SCAE">
          <Image src="/logo.png" alt="SCAE" width={116} height={32} priority />
        </Link>

        <div className="flex flex-col items-center gap-0.5">
          <span className="text-sm font-semibold text-text-primary font-(family-name:--font-poppins)]">
            Avaliação MEES
          </span>
          <span className="text-xs text-text-secondary font-(family-name:--font-inter)]">
            Questão {currentIndex + 1} de {TEACHER_MEES_TOTAL}
          </span>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleSaveAndExit}
          className="flex items-center gap-2"
        >
          <LogOut size={16} aria-hidden="true" />
          Salvar e sair
        </Button>
      </header>

      {/* Body */}
      <main className="flex flex-1 items-center justify-center px-20 py-8">
        <div className="flex flex-col gap-8 w-150">
          {/* Progress row */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-text-primary font-(family-name:--font-inter)]">
                Questão {currentIndex + 1} de {TEACHER_MEES_TOTAL}
              </span>
              <span className="text-sm font-semibold text-primary font-(family-name:--font-inter)]">
                {currentIndex + 1}/{TEACHER_MEES_TOTAL}
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-surface overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Question */}
          <h1 className="text-xl font-semibold text-text-primary text-center font-(family-name:--font-poppins)]">
            {question.statement}
          </h1>

          {/* A/B alternatives */}
          <div className="flex flex-col gap-3">
            {alternatives.map(({ value, label, text }) => {
              const isSelected = currentAnswer === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleSelect(value)}
                  className={[
                    "flex items-start gap-4 w-full px-5 py-4 rounded-2xl border text-left transition-colors",
                    isSelected
                      ? "bg-[#EDF9F5] border-cta border-2"
                      : "bg-background border-border hover:border-border-light",
                  ].join(" ")}
                >
                  <div
                    className={[
                      "shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors",
                      isSelected
                        ? "bg-cta text-white"
                        : "bg-surface text-text-secondary border border-border",
                    ].join(" ")}
                  >
                    {label}
                  </div>

                  <span
                    className={[
                      "text-base font-(family-name:--font-inter)] text-text-primary leading-relaxed",
                      isSelected ? "font-medium" : "font-normal",
                    ].join(" ")}
                  >
                    {text}
                  </span>

                  {isSelected && (
                    <svg
                      className="ml-auto shrink-0 mt-1 text-cta-dark"
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

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="md"
              onClick={handlePrevious}
              className="flex items-center gap-2"
            >
              <ArrowLeft size={18} aria-hidden="true" />
              Anterior
            </Button>

            <Button
              variant="primary"
              size="md"
              onClick={handleNext}
              disabled={!currentAnswer}
              className="flex items-center gap-2"
            >
              {isLast ? "Finalizar" : "Próxima"}
              <ArrowRight size={18} aria-hidden="true" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
