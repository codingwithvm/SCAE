"use client";

import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  MOCK_TEACHERS,
  SCHOOL_NAME,
  type SchoolTeacher,
} from "@/lib/school/data";

const PAGE_SIZE = 10;

export default function SchoolTeachersPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filtered = MOCK_TEACHERS.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.email.toLowerCase().includes(search.toLowerCase()),
  );
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-text-primary font-(family-name:--font-poppins)]">
          Professores
        </h1>
        <p className="text-base text-text-secondary font-(family-name:--font-inter)]">
          {SCHOOL_NAME}
        </p>
      </div>

      <div className="flex items-center justify-between">
        <div className="relative w-80">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
            aria-hidden="true"
          />
          <input
            type="text"
            placeholder="Buscar professor..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-4 rounded-md border border-border bg-background text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-primary transition-colors font-(family-name:--font-inter)]"
          />
        </div>
        <Button variant="primary" size="sm" className="flex items-center gap-2">
          <Plus size={16} aria-hidden="true" />
          Novo professor
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-md border border-border-light bg-background overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 bg-surface">
          <span className="flex-1 text-xs font-semibold text-text-secondary font-(family-name:--font-inter)]">
            Nome
          </span>
          <span className="flex-1 text-xs font-semibold text-text-secondary font-(family-name:--font-inter)]">
            E-mail
          </span>
          <span className="w-17.5 text-xs font-semibold text-text-secondary font-(family-name:--font-inter)]">
            Turmas
          </span>
          <span className="w-20 text-xs font-semibold text-text-secondary font-(family-name:--font-inter)]">
            MCEES
          </span>
          <span className="w-20 text-xs font-semibold text-text-secondary font-(family-name:--font-inter)]">
            MEES
          </span>
          <span className="w-40 text-xs font-semibold text-text-secondary font-(family-name:--font-inter)]">
            Ações
          </span>
        </div>
        {paginated.map((row) => (
          <TeacherRow key={row.id} row={row} />
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

function TeacherRow({ row }: { row: SchoolTeacher }) {
  return (
    <div className="flex items-center gap-2 px-4 py-3 border-t border-border-light">
      <span className="flex-1 text-sm font-medium text-text-primary font-(family-name:--font-inter)]">
        {row.name}
      </span>
      <span className="flex-1 text-sm text-text-secondary font-(family-name:--font-inter)]">
        {row.email}
      </span>
      <span className="w-17.5 text-sm text-text-secondary font-(family-name:--font-inter)]">
        {row.classCount}
      </span>
      <div className="w-20">
        <StatusBadge status={row.mcees} />
      </div>
      <div className="w-20">
        <StatusBadge status={row.mees} />
      </div>
      <div className="w-40 flex items-center gap-4">
        <button
          type="button"
          className="text-sm font-medium text-primary hover:opacity-75 transition-opacity cursor-pointer"
        >
          Editar
        </button>
        <button
          type="button"
          className="text-sm font-medium text-error hover:opacity-75 transition-opacity cursor-pointer"
        >
          Desativar
        </button>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: "Completo" | "Pendente" }) {
  const isComplete = status === "Completo";
  return (
    <span
      className={[
        "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium",
        isComplete
          ? "bg-success-light text-success-foreground"
          : "bg-warning-light text-warning-foreground",
      ].join(" ")}
    >
      {status}
    </span>
  );
}
