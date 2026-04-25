"use client";

import Link from "next/link";
import { Sparkles, Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { MOCK_CLASSES } from "@/lib/teacher/classes";

export default function TeacherDashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* Greeting */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-text-primary font-(family-name:--font-poppins)]">
          Olá, Professora Ana!
        </h1>
        <p className="text-base text-text-secondary font-(family-name:--font-inter)]">
          Bem-vinda ao painel do professor.
        </p>
      </div>

      {/* Assessment CTA card */}
      <div className="flex flex-col rounded-2xl border border-border-light bg-background shadow-[0_2px_8px_rgba(30,79,174,0.08)] overflow-hidden">
        <div className="flex flex-col gap-1 px-6 py-5 border-b border-border-light">
          <h2 className="text-lg font-semibold text-text-primary font-(family-name:--font-poppins)]">
            Descubra seu perfil profissional!
          </h2>
          <p className="text-sm text-text-secondary font-(family-name:--font-inter)]">
            Responda as avaliações MCEES e MEES para descobrir seus estilos de
            aprendizagem e ensino.
          </p>
        </div>
        <div className="flex items-center gap-4 px-6 py-5">
          <Sparkles
            size={32}
            className="text-primary shrink-0"
            aria-hidden="true"
          />
          <Button variant="primary" size="md" asChild>
            <Link
              href="/teacher/assessment"
              className="flex items-center gap-2 no-underline"
            >
              Iniciar avaliação
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Classes section */}
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold text-text-primary font-(family-name:--font-poppins)]">
          Suas turmas
        </h2>

        <div className="flex gap-4">
          {MOCK_CLASSES.map((turma) => {
            const _pendingCount = turma.totalStudents - turma.assessedStudents;

            return (
              <div
                key={turma.id}
                className="flex flex-1 flex-col rounded-2xl border border-border-light bg-background shadow-[0_2px_8px_rgba(30,79,174,0.08)] overflow-hidden"
              >
                <div className="flex flex-col gap-1 px-6 py-5 border-b border-border-light">
                  <h3 className="text-lg font-semibold text-text-primary font-(family-name:--font-poppins)]">
                    {turma.name} — {turma.grade}
                  </h3>
                  <p className="text-sm text-text-secondary font-(family-name:--font-inter)]">
                    {turma.totalStudents} alunos • {turma.assessedStudents} com
                    perfil calculado
                  </p>
                </div>

                <div className="flex items-center gap-3 px-6 py-4">
                  <Users
                    size={20}
                    className="text-text-muted shrink-0"
                    aria-hidden="true"
                  />
                  <div className="flex flex-col gap-0.5 flex-1">
                    <div className="flex items-center justify-between text-xs font-medium font-(family-name:--font-inter)]">
                      <span className="text-text-secondary">Avaliados</span>
                      <span className="text-text-primary">
                        {turma.assessedStudents}/{turma.totalStudents}
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-surface overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{
                          width: `${Math.round((turma.assessedStudents / turma.totalStudents) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 px-6 pb-5">
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="flex-1"
                  >
                    <Link
                      href={`/teacher/classes/${turma.id}`}
                      className="no-underline"
                    >
                      Ver alunos
                    </Link>
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    asChild
                    className="flex-1"
                  >
                    <Link
                      href={`/teacher/classes/${turma.id}/profiles`}
                      className="no-underline"
                    >
                      Ver perfis
                    </Link>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
