"use client";

import { useState } from "react";
import { Plus, Search, X } from "lucide-react";

import { Button } from "@/components/ui/Button";
import {
  MOCK_MUNICIPAL_SCHOOLS,
  MUNICIPALITY_NAME,
  type MunicipalSchool,
} from "@/lib/municipal/data";

interface NewSchoolForm {
  name: string;
  address: string;
  phone: string;
  email: string;
  manager: string;
}

const EMPTY_FORM: NewSchoolForm = {
  name: "",
  address: "",
  phone: "",
  email: "",
  manager: "",
};

export default function MunicipalSchoolsPage() {
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<NewSchoolForm>(EMPTY_FORM);

  const filtered = MOCK_MUNICIPAL_SCHOOLS.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.address.toLowerCase().includes(search.toLowerCase()),
  );

  function handleOpenModal() {
    setForm(EMPTY_FORM);
    setShowModal(true);
  }

  function handleCloseModal() {
    setShowModal(false);
  }

  function handleSave(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    // TODO: integrate with API
    setShowModal(false);
  }

  return (
    <>
      <div className="flex flex-col gap-6 w-full">
        {/* Title */}
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-text-primary font-(family-name:--font-poppins)]">
            Escolas
          </h1>
          <p className="text-base text-text-secondary font-(family-name:--font-inter)]">
            {MUNICIPALITY_NAME}
          </p>
        </div>

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
              placeholder="Buscar escola..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-9 pr-4 rounded-md border border-border bg-background text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-primary transition-colors font-(family-name:--font-inter)]"
            />
          </div>
          <Button
            variant="primary"
            size="sm"
            className="flex items-center gap-2 shrink-0"
            onClick={handleOpenModal}
          >
            <Plus size={16} aria-hidden="true" />
            Nova escola
          </Button>
        </div>

        {/* School cards */}
        <div className="flex flex-col gap-4">
          {filtered.map((school) => (
            <SchoolCard key={school.id} school={school} />
          ))}
        </div>
      </div>

      {/* Modal Nova Escola */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={handleCloseModal}
        >
          <div
            className="bg-background rounded-2xl shadow-[0_4px_16px_var(--shadow-color)] p-8 w-130 flex flex-col gap-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-text-primary font-(family-name:--font-poppins)]">
                Nova escola
              </h2>
              <button
                type="button"
                onClick={handleCloseModal}
                className="text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                aria-label="Fechar"
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSave} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-text-secondary font-(family-name:--font-inter)]">
                  Nome da escola
                </label>
                <input
                  type="text"
                  placeholder="Ex: E.M. Prof. João Santos"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="h-10 px-3 rounded-md border border-border bg-background text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-primary transition-colors font-(family-name:--font-inter)]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-text-secondary font-(family-name:--font-inter)]">
                  Endereço
                </label>
                <input
                  type="text"
                  placeholder="Ex: Rua das Flores, 123"
                  value={form.address}
                  onChange={(e) =>
                    setForm({ ...form, address: e.target.value })
                  }
                  className="h-10 px-3 rounded-md border border-border bg-background text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-primary transition-colors font-(family-name:--font-inter)]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-text-secondary font-(family-name:--font-inter)]">
                  Telefone
                </label>
                <input
                  type="text"
                  placeholder="(00) 0000-0000"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="h-10 px-3 rounded-md border border-border bg-background text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-primary transition-colors font-(family-name:--font-inter)]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-text-secondary font-(family-name:--font-inter)]">
                  E-mail de contato
                </label>
                <input
                  type="email"
                  placeholder="escola@exemplo.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="h-10 px-3 rounded-md border border-border bg-background text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-primary transition-colors font-(family-name:--font-inter)]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-text-secondary font-(family-name:--font-inter)]">
                  Gestor da escola
                </label>
                <select
                  value={form.manager}
                  onChange={(e) =>
                    setForm({ ...form, manager: e.target.value })
                  }
                  className="h-10 px-3 rounded-md border border-border bg-background text-sm text-text-primary focus:outline-none focus:border-primary transition-colors font-(family-name:--font-inter)] cursor-pointer"
                >
                  <option value="">Selecionar gestor...</option>
                  <option value="g1">Ana Paula Souza</option>
                  <option value="g2">Roberto Lima</option>
                  <option value="g3">Fernanda Costa</option>
                </select>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCloseModal}
                >
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Salvar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

function SchoolCard({ school }: { school: MunicipalSchool }) {
  const avaliatedColor =
    school.participationPct >= 80
      ? "text-success"
      : school.participationPct >= 60
        ? "text-warning"
        : "text-error";

  return (
    <div className="flex flex-col gap-3 bg-background rounded-lg border border-border-light shadow-[0_2px_8px_var(--shadow-color)] p-5">
      <div className="flex flex-col gap-0.5">
        <span className="text-lg font-semibold text-text-primary font-(family-name:--font-poppins)]">
          {school.name}
        </span>
        <span className="text-sm text-text-secondary font-(family-name:--font-inter)]">
          {school.address}
        </span>
      </div>

      <div className="flex items-center gap-1 text-sm font-(family-name:--font-inter)]">
        <span className="text-text-secondary">Turmas:</span>
        <span className="font-medium text-text-primary">{school.classes}</span>
        <span className="text-text-muted mx-1">·</span>
        <span className="text-text-secondary">Professores:</span>
        <span className="font-medium text-text-primary">{school.teachers}</span>
        <span className="text-text-muted mx-1">·</span>
        <span className="text-text-secondary">Alunos:</span>
        <span className="font-medium text-text-primary">{school.students}</span>
        <span className="text-text-muted mx-1">·</span>
        <span className="text-text-secondary">Avaliados:</span>
        <span className={`font-semibold ${avaliatedColor}`}>
          {school.participationPct}%
        </span>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm">
          Ver detalhes
        </Button>
        <Button variant="ghost" size="sm">
          Editar
        </Button>
      </div>
    </div>
  );
}
