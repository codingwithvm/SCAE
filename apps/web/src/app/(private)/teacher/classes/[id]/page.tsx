"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { MOCK_CLASSES } from "@/lib/teacher/classes";
import { PROFILE_DATA } from "@/lib/quiz/profile-data";

const PAGE_SIZE = 9;

export default function ClassStudentsPage() {
  const params = useParams();
  const classId = Number(params.id);
  const turma = MOCK_CLASSES.find((c) => c.id === classId);

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  if (!turma) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20">
        <p className="text-base text-text-secondary font-(family-name:--font-inter)]">
          Turma não encontrada.
        </p>
        <Link
          href="/teacher/dashboard"
          className="text-sm font-medium text-primary no-underline"
        >
          Voltar ao dashboard
        </Link>
      </div>
    );
  }

  const filteredStudents = turma.students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.registrationNumber.includes(search),
  );

  const totalPages = Math.max(
    1,
    Math.ceil(filteredStudents.length / PAGE_SIZE),
  );
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  function handleSearch(value: string) {
    setSearch(value);
    setCurrentPage(1);
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Back link */}
      <Link
        href="/teacher/dashboard"
        className="flex items-center gap-1.5 text-sm font-medium text-primary hover:opacity-75 transition-opacity no-underline w-fit"
      >
        <ArrowLeft size={16} aria-hidden="true" />
        Voltar para Dashboard
      </Link>

      {/* Title */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-text-primary font-(family-name:--font-poppins)]">
          {turma.name} — {turma.grade}
        </h1>
        <p className="text-base text-text-secondary font-(family-name:--font-inter)]">
          {turma.totalStudents} alunos matriculados
        </p>
      </div>

      {/* Search */}
      <div className="relative w-full">
        <Search
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted"
          aria-hidden="true"
        />
        <input
          type="text"
          placeholder="Buscar aluno por nome ou matrícula"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full rounded-lg border border-border-light bg-background pl-9 pr-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted font-(family-name:--font-inter)] focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border-light bg-background overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[1fr_140px_140px_140px] items-center h-12 px-4 bg-surface border-b border-border-light">
          {["Nome", "Matrícula", "Avaliação", "Perfil"].map((col) => (
            <span
              key={col}
              className="text-xs font-semibold text-text-secondary uppercase tracking-wide font-(family-name:--font-inter)]"
            >
              {col}
            </span>
          ))}
        </div>

        {/* Rows */}
        {paginatedStudents.length === 0 ? (
          <div className="flex items-center justify-center py-10">
            <p className="text-sm text-text-secondary font-(family-name:--font-inter)]">
              Nenhum aluno encontrado.
            </p>
          </div>
        ) : (
          paginatedStudents.map((student) => {
            const profileData = student.profile
              ? PROFILE_DATA[student.profile]
              : null;

            return (
              <div
                key={student.id}
                className="grid grid-cols-[1fr_140px_140px_140px] items-center h-13 px-4 border-b border-border-light last:border-b-0"
              >
                {/* Name + avatar */}
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent shrink-0">
                    <span className="text-xs font-semibold text-white font-(family-name:--font-poppins)]">
                      {student.name.charAt(0)}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-text-primary font-(family-name:--font-inter)] truncate">
                    {student.name}
                  </span>
                </div>

                {/* Registration */}
                <span className="text-sm text-text-secondary font-(family-name:--font-inter)]">
                  {student.registrationNumber}
                </span>

                {/* Assessment status */}
                <div>
                  <Badge
                    variant={
                      student.assessmentStatus === "Completo"
                        ? "success"
                        : "warning"
                    }
                  >
                    {student.assessmentStatus}
                  </Badge>
                </div>

                {/* Profile badge */}
                <div>
                  {profileData ? (
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold font-(family-name:--font-inter)]"
                      style={{
                        backgroundColor: profileData.badgeBg,
                        color: profileData.badgeText,
                      }}
                    >
                      <span
                        className="h-1.5 w-1.5 rounded-full shrink-0"
                        style={{ backgroundColor: profileData.color }}
                        aria-hidden="true"
                      />
                      {student.profile}
                    </span>
                  ) : (
                    <span className="text-xs text-text-muted font-(family-name:--font-inter)]">
                      —
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="flex items-center gap-1 text-sm font-medium text-text-secondary hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <ChevronLeft size={16} aria-hidden="true" />
            Anterior
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={[
                "flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition-colors cursor-pointer",
                page === currentPage
                  ? "bg-primary text-white"
                  : "text-text-secondary hover:bg-surface",
              ].join(" ")}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1 text-sm font-medium text-text-secondary hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            Próxima
            <ChevronRight size={16} aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}
