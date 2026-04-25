"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Minus, Send, ArrowLeft, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { QUIZ_QUESTIONS, type ScaleValue } from "@/lib/quiz/questions";

const TOTAL_QUESTIONS = QUIZ_QUESTIONS.length;

export default function QuizReviewPage() {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<number, ScaleValue>>({});

  useEffect(() => {
    const storedAnswers = sessionStorage.getItem("quiz_answers");

    if (!storedAnswers) {
      router.replace("/questionario/perguntas");
      return;
    }

    setAnswers(JSON.parse(storedAnswers) as Record<number, ScaleValue>);
  }, [router]);

  function handleSubmit() {
    sessionStorage.removeItem("quiz_answers");
    router.push("/dashboard");
  }

  const answeredCount = Object.keys(answers).length;

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      {/* Top bar */}
      <header className="flex items-center justify-between px-8 py-4 bg-background border-b border-border-light shrink-0">
        <div className="flex flex-col gap-1.5 w-75">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-text-primary font-(family-name:--font-inter)]">
              Completo!
            </span>
            <span className="text-sm font-semibold text-primary font-(family-name:--font-inter)]">
              {answeredCount}/{TOTAL_QUESTIONS}
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-surface overflow-hidden">
            <div className="h-full w-full rounded-full bg-linear-to-r from-cta to-accent" />
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
        <div className="flex flex-col items-center gap-6 w-125">
          {/* Check circle */}
          <div
            className="flex h-16 w-16 items-center justify-center rounded-xl bg-black"
            aria-hidden="true"
          >
            <Check size={32} className="text-success" strokeWidth={2.5} />
          </div>

          {/* Título */}
          <h1 className="text-2xl font-semibold text-text-primary text-center font-(family-name:--font-poppins)]">
            Você respondeu todas as perguntas!
          </h1>

          {/* Instrução */}
          <p className="text-base text-text-secondary text-center font-(family-name:--font-inter)]">
            Verifique se deseja mudar alguma resposta antes de enviar. Depois de
            enviar, não será possível alterar.
          </p>

          {/* Grid de questões */}
          <div className="flex w-full flex-col gap-2.5 rounded-2xl border border-border-light bg-background p-5">
            {[0, 1].map((rowIndex) => (
              <div key={rowIndex} className="flex justify-center gap-2">
                {QUIZ_QUESTIONS.slice(rowIndex * 8, rowIndex * 8 + 8).map(
                  (quizQuestion) => {
                    const isAnswered = quizQuestion.id in answers;

                    return (
                      <div
                        key={quizQuestion.id}
                        className="flex items-center gap-1 rounded-md bg-black px-2.5 py-1.5"
                      >
                        {isAnswered ? (
                          <Check
                            size={14}
                            className="text-success"
                            strokeWidth={2.5}
                            aria-hidden="true"
                          />
                        ) : (
                          <Minus
                            size={14}
                            className="text-text-muted"
                            strokeWidth={2.5}
                            aria-hidden="true"
                          />
                        )}
                        <span
                          className={[
                            "text-xs font-semibold font-(family-name:--font-inter)]",
                            isAnswered ? "text-success" : "text-text-muted",
                          ].join(" ")}
                        >
                          {quizQuestion.id}
                        </span>
                      </div>
                    );
                  },
                )}
              </div>
            ))}
          </div>

          {/* Navegação */}
          <div className="flex items-center justify-center gap-4 w-full">
            <Button
              variant="outline"
              size="md"
              onClick={() => router.push("/questionario/perguntas")}
              className="flex items-center gap-2"
            >
              <ArrowLeft size={18} aria-hidden="true" />
              Voltar e revisar
            </Button>

            <Button
              variant="primary"
              size="md"
              onClick={handleSubmit}
              className="flex items-center gap-2"
            >
              <Send size={18} aria-hidden="true" />
              Enviar respostas
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
