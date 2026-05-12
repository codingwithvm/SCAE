"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Loader2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal, ModalField, ModalSelect } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";

const PAGE_SIZE = 10;

interface ClassRow {
  id: string;
  name: string;
  grade: number;
  year: number;
  schoolId: string;
}

export default function SchoolClassesPage() {
  const router = useRouter();
  const toast = useToast();
  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<ClassRow | null>(null);

  function getToken() {
    return localStorage.getItem("auth_token");
  }

  function loadData() {
    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    setLoading(true);
    fetch("/api/v1/classes/my", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => setClasses(data.classes || []))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadData();
  }, [router]);

  function handleSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  const filtered = classes.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()),
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={28} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-text-primary font-(family-name:--font-poppins)]">
            Turmas
          </h1>
          <p className="text-base text-text-secondary font-(family-name:--font-inter)]">
            {classes.length} turmas cadastradas
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setShowCreate(true)}>
          <Plus size={16} />
          Nova turma
        </Button>
      </div>

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

      <div className="rounded-md border border-border-light bg-background overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 bg-surface">
          <span className="flex-1 text-xs font-semibold text-text-secondary font-(family-name:--font-inter)]">
            Nome
          </span>
          <span className="w-20 text-xs font-semibold text-text-secondary font-(family-name:--font-inter)]">
            Série
          </span>
          <span className="w-20 text-xs font-semibold text-text-secondary font-(family-name:--font-inter)]">
            Ano
          </span>
          <span className="w-24 text-xs font-semibold text-text-secondary font-(family-name:--font-inter)] text-right">
            Ações
          </span>
        </div>

        {paginated.length === 0 ? (
          <div className="flex items-center justify-center py-10">
            <p className="text-sm text-text-secondary">
              Nenhuma turma encontrada.
            </p>
          </div>
        ) : (
          paginated.map((row) => (
            <div
              key={row.id}
              className="flex items-center gap-2 px-4 py-3 border-t border-border-light"
            >
              <span className="flex-1 text-sm font-medium text-text-primary font-(family-name:--font-inter)] truncate">
                {row.name}
              </span>
              <span className="w-20 text-sm text-text-secondary font-(family-name:--font-inter)]">
                {row.grade}º ano
              </span>
              <span className="w-20 text-sm text-text-secondary font-(family-name:--font-inter)]">
                {row.year}
              </span>
              <div className="w-24 flex items-center justify-end gap-1">
                <button
                  type="button"
                  onClick={() => setEditing(row)}
                  className="p-1.5 rounded text-text-secondary hover:text-primary hover:bg-surface transition-colors cursor-pointer"
                  aria-label="Editar"
                >
                  <Pencil size={15} />
                </button>
              </div>
            </div>
          ))
        )}
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
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(
            (pg) => (
              <button
                key={pg}
                type="button"
                onClick={() => setPage(pg)}
                className={[
                  "flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium transition-colors cursor-pointer",
                  pg === page
                    ? "bg-primary text-white"
                    : "text-text-secondary hover:bg-surface",
                ].join(" ")}
              >
                {pg}
              </button>
            ),
          )}
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

      {showCreate && (
        <ClassModal
          onClose={() => setShowCreate(false)}
          onSaved={() => {
            setShowCreate(false);
            loadData();
          }}
          toast={toast}
        />
      )}

      {editing && (
        <ClassModal
          initial={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            loadData();
          }}
          toast={toast}
        />
      )}
    </div>
  );
}

function ClassModal({
  initial,
  onClose,
  onSaved,
  toast,
}: {
  initial?: ClassRow;
  onClose: () => void;
  onSaved: () => void;
  toast: ReturnType<typeof useToast>;
}) {
  const isEdit = !!initial;
  const [name, setName] = useState(initial?.name || "");
  const [grade, setGrade] = useState(initial ? String(initial.grade) : "");
  const [year, setYear] = useState(
    initial ? String(initial.year) : String(new Date().getFullYear()),
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    if (!name || !grade) return;
    setSaving(true);
    setError(null);

    const token = localStorage.getItem("auth_token");
    const stored = localStorage.getItem("auth_user");
    const schoolId = stored
      ? (JSON.parse(stored) as { schoolId?: string }).schoolId
      : null;

    const url = isEdit ? `/api/v1/classes/${initial.id}` : "/api/v1/classes";

    const res = await fetch(url, {
      method: isEdit ? "PUT" : "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        grade: parseInt(grade),
        year: parseInt(year),
        schoolId: isEdit ? initial.schoolId : schoolId,
      }),
    });

    if (res.ok) {
      toast.success(
        isEdit
          ? "Turma atualizada com sucesso"
          : "Turma cadastrada com sucesso",
      );
      onSaved();
    } else {
      const body = await res.json().catch(() => null);
      setError(body?.error || "Erro ao salvar turma");
      setSaving(false);
    }
  }

  return (
    <Modal
      title={isEdit ? "Editar turma" : "Nova turma"}
      onClose={onClose}
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSave}
            disabled={saving || !name || !grade}
          >
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </>
      }
    >
      <ModalField
        label="Nome da turma"
        placeholder="Ex: Turma A"
        value={name}
        onChange={setName}
      />
      <ModalSelect
        label="Série"
        placeholder="Selecione a série..."
        value={grade}
        onChange={setGrade}
        options={Array.from({ length: 9 }, (_, i) => ({
          value: String(i + 1),
          label: `${i + 1}º ano`,
        }))}
      />
      <ModalField
        label="Ano letivo"
        placeholder="2026"
        value={year}
        onChange={setYear}
      />
      {error && (
        <p className="text-sm text-error font-(family-name:--font-inter)]">
          {error}
        </p>
      )}
    </Modal>
  );
}
