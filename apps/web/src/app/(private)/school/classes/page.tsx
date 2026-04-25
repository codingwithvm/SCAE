"use client";

import { useState } from "react";
import { Plus, Search, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { MOCK_CLASSES, SCHOOL_NAME, type SchoolClass } from "@/lib/school/data";

const PAGE_SIZE = 10;

export default function SchoolClassesPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);

  const filtered = MOCK_CLASSES.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.teacher.toLowerCase().includes(search.toLowerCase()),
  );
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Title */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-text-primary font-(family-name:--font-poppins)]">
          Turmas
        </h1>
        <p className="text-base text-text-secondary font-(family-name:--font-inter)]">
          {SCHOOL_NAME}
        </p>
      </div>

      {/* Action bar */}
      <div className="flex items-center justify-between">
        <div className="relative w-80">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
            aria-hidden="true"
          />
          <input
            type="text"
            placeholder="Buscar turma..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-4 rounded-md border border-border bg-background text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-primary transition-colors font-(family-name:--font-inter)]"
          />
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2"
        >
          <Plus size={16} aria-hidden="true" />
          Nova turma
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-md border border-border-light bg-background overflow-hidden">
        {/* Header row */}
        <div className="flex items-center gap-2 px-4 py-3 bg-surface">
          <span className="flex-1 text-xs font-semibold text-text-secondary font-(family-name:--font-inter)]">
            Nome
          </span>
          <span className="w-17.5 text-xs font-semibold text-text-secondary font-(family-name:--font-inter)]">
            Ano
          </span>
          <span className="w-20 text-xs font-semibold text-text-secondary font-(family-name:--font-inter)]">
            Turno
          </span>
          <span className="w-35 text-xs font-semibold text-text-secondary font-(family-name:--font-inter)]">
            Professor
          </span>
          <span className="w-17.5 text-xs font-semibold text-text-secondary font-(family-name:--font-inter)]">
            Alunos
          </span>
          <span className="w-40 text-xs font-semibold text-text-secondary font-(family-name:--font-inter)]">
            Ações
          </span>
        </div>

        {paginated.map((row) => (
          <ClassRow key={row.id} row={row} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex items-center gap-1 text-sm"
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
            className="flex items-center gap-1 text-sm"
          >
            Próxima
          </Button>
        </div>
      )}

      {/* Modal */}
      {showModal && <NewClassModal onClose={() => setShowModal(false)} />}
    </div>
  );
}

function ClassRow({ row }: { row: SchoolClass }) {
  return (
    <div className="flex items-center gap-2 px-4 py-3 border-t border-border-light">
      <span className="flex-1 text-sm font-medium text-text-primary font-(family-name:--font-inter)]">
        {row.name}
      </span>
      <span className="w-17.5 text-sm text-text-secondary font-(family-name:--font-inter)]">
        {row.year}
      </span>
      <span className="w-20 text-sm text-text-secondary font-(family-name:--font-inter)]">
        {row.shift}
      </span>
      <span className="w-35 text-sm text-text-secondary font-(family-name:--font-inter)]">
        {row.teacher}
      </span>
      <span className="w-17.5 text-sm text-text-secondary font-(family-name:--font-inter)]">
        {row.studentCount}
      </span>
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

function NewClassModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [year, setYear] = useState("");
  const [shift, setShift] = useState("");
  const [teacher, setTeacher] = useState("");

  function handleSave() {
    // TODO: persist via API
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="flex flex-col w-120 bg-background rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.2)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border-light">
          <h2 className="text-lg font-semibold text-text-primary font-(family-name:--font-poppins)]">
            Nova turma
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
            aria-label="Fechar"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-5 px-6 py-6">
          <ModalField
            label="Nome da turma"
            placeholder="Ex: Turma A"
            value={name}
            onChange={setName}
          />
          <ModalSelect
            label="Série/Ano"
            placeholder="Selecione a série..."
            value={year}
            onChange={setYear}
            options={[
              "1º ano",
              "2º ano",
              "3º ano",
              "4º ano",
              "5º ano",
              "6º ano",
              "7º ano",
              "8º ano",
              "9º ano",
            ]}
          />
          <ModalSelect
            label="Turno"
            placeholder="Selecione o turno..."
            value={shift}
            onChange={setShift}
            options={["Manhã", "Tarde", "Integral"]}
          />
          <ModalSelect
            label="Professor responsável"
            placeholder="Selecione o professor..."
            value={teacher}
            onChange={setTeacher}
            options={[
              "Ana Santos",
              "Carlos Lima",
              "Beatriz Rocha",
              "Fernando Melo",
            ]}
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border-light">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" size="sm" onClick={handleSave}>
            Salvar
          </Button>
        </div>
      </div>
    </div>
  );
}

function ModalField({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-text-primary font-(family-name:--font-inter)]">
        {label}
      </label>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 px-3 rounded-md border border-border bg-background text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-primary transition-colors font-(family-name:--font-inter)]"
      />
    </div>
  );
}

function ModalSelect({
  label,
  placeholder,
  value,
  onChange,
  options,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-text-primary font-(family-name:--font-inter)]">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 px-3 rounded-md border border-border bg-background text-sm text-text-primary focus:outline-none focus:border-primary transition-colors font-(family-name:--font-inter)] cursor-pointer"
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}
