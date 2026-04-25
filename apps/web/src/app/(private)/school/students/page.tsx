"use client";

import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  MOCK_STUDENTS,
  MOCK_CLASSES,
  SCHOOL_NAME,
  type SchoolStudent,
} from "@/lib/school/data";

const PAGE_SIZE = 10;

const PROFILE_COLORS: Record<string, { bg: string; text: string }> = {
  Criativo: { bg: "#FFF5EB", text: "#C05621" },
  Analítico: { bg: "#EBF8FF", text: "#2B6CB0" },
  Estrategista: { bg: "#F0FFF4", text: "#276749" },
  Prático: { bg: "#FFF5F5", text: "#C53030" },
};

export default function SchoolStudentsPage() {
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [page, setPage] = useState(1);

  const filtered = MOCK_STUDENTS.filter((s) => {
    const matchSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.registration.includes(search);
    const matchClass = classFilter === "" || s.className === classFilter;
    return matchSearch && matchClass;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  function handleClassFilter(value: string) {
    setClassFilter(value);
    setPage(1);
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-text-primary font-(family-name:--font-poppins)]">
          Alunos
        </h1>
        <p className="text-base text-text-secondary font-(family-name:--font-inter)]">
          {SCHOOL_NAME}
        </p>
      </div>

      {/* Action bar */}
      <div className="flex items-center gap-3">
        <div className="relative w-60">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
            aria-hidden="true"
          />
          <input
            type="text"
            placeholder="Buscar aluno..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-4 rounded-md border border-border bg-background text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-primary transition-colors font-(family-name:--font-inter)]"
          />
        </div>

        <select
          value={classFilter}
          onChange={(e) => handleClassFilter(e.target.value)}
          className="h-10 px-3 w-48 rounded-md border border-border bg-background text-sm text-text-primary focus:outline-none focus:border-primary transition-colors font-(family-name:--font-inter)] cursor-pointer"
        >
          <option value="">Todas as turmas</option>
          {MOCK_CLASSES.map((c) => (
            <option key={c.id} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>

        <div className="flex-1" />

        <Button variant="primary" size="sm" className="flex items-center gap-2">
          <Plus size={16} aria-hidden="true" />
          Novo aluno
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-md border border-border-light bg-background overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 bg-surface">
          <span className="flex-1 text-xs font-semibold text-text-secondary font-(family-name:--font-inter)]">
            Nome
          </span>
          <span className="w-25 text-xs font-semibold text-text-secondary font-(family-name:--font-inter)]">
            Matrícula
          </span>
          <span className="w-20 text-xs font-semibold text-text-secondary font-(family-name:--font-inter)]">
            Turma
          </span>
          <span className="w-25 text-xs font-semibold text-text-secondary font-(family-name:--font-inter)]">
            Nascimento
          </span>
          <span className="w-22.5 text-xs font-semibold text-text-secondary font-(family-name:--font-inter)]">
            Perfil
          </span>
          <span className="w-42.5 text-xs font-semibold text-text-secondary font-(family-name:--font-inter)]">
            Ações
          </span>
        </div>
        {paginated.map((row) => (
          <StudentRow key={row.id} row={row} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Anterior
          </Button>
          {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => {
            const pg = i + 1;
            return (
              <button
                key={pg}
                type="button"
                onClick={() => setPage(pg)}
                className={[
                  "flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium transition-colors",
                  pg === page
                    ? "bg-primary text-white"
                    : "text-text-secondary hover:bg-surface",
                ].join(" ")}
              >
                {pg}
              </button>
            );
          })}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Próxima
          </Button>
        </div>
      )}
    </div>
  );
}

function StudentRow({ row }: { row: SchoolStudent }) {
  const profileStyle = row.profile ? PROFILE_COLORS[row.profile] : null;

  return (
    <div className="flex items-center gap-2 px-4 py-3 border-t border-border-light">
      <span className="flex-1 text-sm font-medium text-text-primary font-(family-name:--font-inter)]">
        {row.name}
      </span>
      <span className="w-25 text-sm text-text-secondary font-(family-name:--font-inter)]">
        {row.registration}
      </span>
      <span className="w-20 text-sm text-text-secondary font-(family-name:--font-inter)]">
        {row.className}
      </span>
      <span className="w-25 text-sm text-text-secondary font-(family-name:--font-inter)]">
        {row.birthDate}
      </span>
      <div className="w-22.5">
        {row.profile && profileStyle ? (
          <span
            className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
            style={{
              backgroundColor: profileStyle.bg,
              color: profileStyle.text,
            }}
          >
            {row.profile}
          </span>
        ) : (
          <span className="text-xs text-text-muted font-(family-name:--font-inter)]">
            —
          </span>
        )}
      </div>
      <div className="w-42.5 flex items-center gap-4">
        <button
          type="button"
          className="text-sm font-medium text-primary hover:opacity-75 transition-opacity cursor-pointer"
        >
          Editar
        </button>
        <button
          type="button"
          className="text-sm font-medium text-accent hover:opacity-75 transition-opacity cursor-pointer"
        >
          Transferir
        </button>
      </div>
    </div>
  );
}
