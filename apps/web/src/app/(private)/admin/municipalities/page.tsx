"use client";

import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface Municipality {
  id: string;
  name: string;
  state: string;
  schools: number;
  manager: string | null;
}

const MOCK_MUNICIPALITIES: Municipality[] = [
  {
    id: "m1",
    name: "São José dos Campos",
    state: "SP",
    schools: 12,
    manager: "Carlos Mendes",
  },
  { id: "m2", name: "Recife", state: "PE", schools: 8, manager: "Maria Silva" },
  { id: "m3", name: "Olinda", state: "PE", schools: 6, manager: null },
  {
    id: "m4",
    name: "Curitiba",
    state: "PR",
    schools: 15,
    manager: "Ana Souza",
  },
  {
    id: "m5",
    name: "Belo Horizonte",
    state: "MG",
    schools: 10,
    manager: "Pedro Lima",
  },
  { id: "m6", name: "Salvador", state: "BA", schools: 9, manager: null },
  {
    id: "m7",
    name: "Fortaleza",
    state: "CE",
    schools: 7,
    manager: "Lucia Costa",
  },
  {
    id: "m8",
    name: "Manaus",
    state: "AM",
    schools: 5,
    manager: "Roberto Alves",
  },
  {
    id: "m9",
    name: "Porto Alegre",
    state: "RS",
    schools: 11,
    manager: "Julia Ferreira",
  },
  { id: "m10", name: "Goiânia", state: "GO", schools: 4, manager: null },
];

const PAGE_SIZE = 10;

export default function AdminMunicipalitiesPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filtered = MOCK_MUNICIPALITIES.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase()),
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Title */}
      <h1 className="text-2xl font-bold text-text-primary font-(family-name:--font-poppins)]">
        Municípios
      </h1>

      {/* Action bar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
            aria-hidden="true"
          />
          <input
            type="text"
            placeholder="Buscar município..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-4 rounded-md border border-border bg-background text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-primary transition-colors font-(family-name:--font-inter)]"
          />
        </div>
        <Button
          variant="primary"
          size="sm"
          className="flex items-center gap-2 shrink-0"
        >
          <Plus size={16} aria-hidden="true" />
          Novo município
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-md border border-border-light bg-background overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-4 px-4 py-3 bg-surface">
          <span className="w-65 shrink-0 text-[13px] font-semibold text-text-primary font-(family-name:--font-inter)]">
            Nome
          </span>
          <span className="w-15 shrink-0 text-[13px] font-semibold text-text-primary font-(family-name:--font-inter)]">
            UF
          </span>
          <span className="w-20 shrink-0 text-[13px] font-semibold text-text-primary font-(family-name:--font-inter)]">
            Escolas
          </span>
          <span className="w-47.5 shrink-0 text-[13px] font-semibold text-text-primary font-(family-name:--font-inter)]">
            Gestor
          </span>
          <span className="w-45 shrink-0 text-[13px] font-semibold text-text-primary font-(family-name:--font-inter)]">
            Ações
          </span>
        </div>

        {/* Rows */}
        {paginated.map((municipality) => (
          <div
            key={municipality.id}
            className="flex items-center gap-4 px-4 py-2.5 border-t border-border-light"
          >
            <span className="w-65 shrink-0 text-[13px] font-medium text-text-primary font-(family-name:--font-inter)]">
              {municipality.name}
            </span>
            <span className="w-15 shrink-0 text-[13px] text-text-primary font-(family-name:--font-inter)]">
              {municipality.state}
            </span>
            <span className="w-20 shrink-0 text-[13px] text-text-primary font-(family-name:--font-inter)]">
              {municipality.schools}
            </span>
            <span
              className={[
                "w-47.5 shrink-0 text-[13px] font-(family-name:--font-inter)]",
                municipality.manager
                  ? "text-text-primary"
                  : "text-text-secondary",
              ].join(" ")}
            >
              {municipality.manager ?? "—"}
            </span>
            <div className="w-45 shrink-0 flex items-center gap-4">
              <button
                type="button"
                className="text-[13px] font-medium text-primary hover:opacity-75 transition-opacity cursor-pointer"
              >
                Editar
              </button>
              {municipality.manager ? (
                <button
                  type="button"
                  className="text-[13px] font-medium text-error hover:opacity-75 transition-opacity cursor-pointer"
                >
                  Desativar
                </button>
              ) : (
                <button
                  type="button"
                  className="text-[13px] font-medium text-warning hover:opacity-75 transition-opacity cursor-pointer"
                >
                  Vincular
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors disabled:opacity-40 cursor-pointer"
          >
            ←
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
            <button
              key={pg}
              type="button"
              onClick={() => setPage(pg)}
              className={[
                "flex h-8 w-8 items-center justify-center rounded-sm text-sm transition-colors",
                pg === page
                  ? "bg-primary text-white font-semibold"
                  : "text-text-secondary font-medium hover:bg-surface",
              ].join(" ")}
            >
              {pg}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors disabled:opacity-40 cursor-pointer"
          >
            →
          </button>
        </div>
      )}
    </div>
  );
}
